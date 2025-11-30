import sys
import asyncio

# Fix for Windows Playwright async issue
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from typing import Dict, Optional
import logging
from rpa import DUAutomation
from database import SessionLocal
import crud
from threading import Thread

logger = logging.getLogger(__name__)

# In-memory job tracking
active_jobs: Dict[str, Dict] = {}
otp_waiting_jobs: Dict[str, DUAutomation] = {}


async def run_du_automation_async(application_id: str, job_id: str):
    """
    Main automation orchestrator (async version)
    Runs the complete DU admission flow
    """
    db = SessionLocal()
    automation = DUAutomation()
    
    try:
        # Store automation instance for OTP resume
        otp_waiting_jobs[job_id] = automation
        active_jobs[job_id] = {
            "application_id": application_id,
            "status": "running",
            "stage": "initializing"
        }
        
        # Get application data
        app = crud.get_application(db, application_id)
        if not app:
            raise Exception("Application not found")
        
        # Initialize browser
        logger.info(f"[{application_id}] Initializing browser...")
        await automation.initialize()
        crud.update_application_status(
            db, application_id, "login", "login", "Initializing browser..."
        )
        
        # Step 1: Login
        logger.info(f"[{application_id}] Starting login...")
        crud.update_application_status(
            db, application_id, "login", "login", "Logging in to DU admission portal..."
        )
        
        login_result = await automation.du_login(
            app.hsc_roll,
            app.hsc_board,
            app.ssc_roll
        )
        
        if not login_result["success"]:
            raise Exception(f"Login failed: {login_result['message']}")
        
        # Step 2: Fill form
        logger.info(f"[{application_id}] Filling form...")
        crud.update_application_status(
            db, application_id, "form_fill", "form_fill", "Filling application form..."
        )
        
        form_data = {
            "first_name": app.first_name,
            "last_name": app.last_name,
            "father_name": app.father_name,
            "mother_name": app.mother_name,
            "email": app.email,
            "mobile_number": app.mobile_number,
            "present_address": app.present_address,
            "city": app.city,
            "quota": app.quota,
            "exam_center": app.exam_center,
        }
        
        fill_result = await automation.du_fill_form(form_data)
        if not fill_result["success"]:
            raise Exception(f"Form fill failed: {fill_result['message']}")
        
        # Step 3: Upload photo
        if app.photo_path:
            logger.info(f"[{application_id}] Uploading photo...")
            crud.update_application_status(
                db, application_id, "form_fill", "photo_upload", "Uploading photo..."
            )
            
            photo_result = await automation.du_upload_photo(app.photo_path)
            if not photo_result["success"]:
                logger.warning(f"Photo upload failed: {photo_result['message']}")
        
        # Step 4: Submit form (triggers OTP)
        logger.info(f"[{application_id}] Submitting form...")
        crud.update_application_status(
            db, application_id, "form_fill", "submitting", "Submitting application form..."
        )
        
        submit_result = await automation.du_submit_form()
        if not submit_result["success"]:
            raise Exception(f"Form submit failed: {submit_result['message']}")
        
        # Extract and save SMS code
        sms_code = submit_result.get("sms_code")
        if sms_code:
            crud.update_sms_code(db, application_id, sms_code)
            logger.info(f"[{application_id}] SMS code extracted: {sms_code}")
        
        # Step 5: Wait for OTP
        logger.info(f"[{application_id}] Waiting for OTP...\"")
        
        # Build message with SMS code instructions
        if sms_code:
            otp_message = f"SMS Code: {sms_code}\\n\\nSend this code via SMS to 16321 from your mobile (Grameenphone, Teletalk, Robi, Banglalink, or Airtel) to receive the OTP. Then enter the OTP here to continue."
        else:
            otp_message = "Check the DU admission page for the 8-character SMS code. Send it to 16321 via SMS to receive the OTP, then enter the OTP here."
        
        crud.update_application_status(
            db, application_id, "otp_required", "otp_required", 
            otp_message
        )

        
        active_jobs[job_id]["stage"] = "otp_waiting"
        
        # Automation pauses here - will be resumed by submit_otp endpoint
        # Keep browser open and wait
        logger.info(f"[{application_id}] Automation paused, waiting for OTP submission...")
        
    except Exception as e:
        logger.error(f"[{application_id}] Automation error: {str(e)}")
        crud.update_application_status(
            db, application_id, "failed", "error", f"Automation failed: {str(e)}"
        )
        active_jobs[job_id] = {
            "application_id": application_id,
            "status": "failed",
            "error": str(e)
        }
        await automation.close()
        if job_id in otp_waiting_jobs:
            del otp_waiting_jobs[job_id]
    finally:
        db.close()


async def resume_automation_after_otp(application_id: str, job_id: str, otp_code: str):
    """
    Resume automation after OTP is submitted
    """
    db = SessionLocal()
    
    try:
        # Get the paused automation instance
        if job_id not in otp_waiting_jobs:
            raise Exception("Job not found or already completed")
        
        automation = otp_waiting_jobs[job_id]
        
        # Step 6: Enter OTP
        logger.info(f"[{application_id}] Entering OTP...")
        crud.update_application_status(
            db, application_id, "otp_verify", "otp_verify", "Verifying OTP..."
        )
        
        otp_result = await automation.du_enter_otp(otp_code)
        if not otp_result["success"]:
            raise Exception(f"OTP verification failed: {otp_result['message']}")
        
        # Step 7: Get payment info
        logger.info(f"[{application_id}] Checking payment...")
        crud.update_application_status(
            db, application_id, "payment", "payment", 
            "OTP verified. Proceeding to payment..."
        )
        
        payment_info = await automation.du_get_payment_info()
        
        # At this point, user needs to complete payment via SSLCommerz
        # Automation will pause again until payment callback
        logger.info(f"[{application_id}] Waiting for payment completion...")
        crud.update_application_status(
            db, application_id, "payment", "payment_pending", 
            "Please complete payment to continue."
        )
        
        active_jobs[job_id]["stage"] = "payment_waiting"
        
        # Keep browser open for document download after payment
        
    except Exception as e:
        logger.error(f"[{application_id}] OTP resume error: {str(e)}")
        crud.update_application_status(
            db, application_id, "failed", "error", f"OTP verification failed: {str(e)}"
        )
        await automation.close()
        if job_id in otp_waiting_jobs:
            del otp_waiting_jobs[job_id]
    finally:
        db.close()


async def complete_automation_after_payment(application_id: str, job_id: str):
    """
    Complete automation after payment is successful
    Download documents
    """
    db = SessionLocal()
    
    try:
        # Get the paused automation instance
        if job_id not in otp_waiting_jobs:
            logger.warning(f"[{application_id}] Job not found, may have already completed")
            return
        
        automation = otp_waiting_jobs[job_id]
        
        # Step 8: Download documents
        logger.info(f"[{application_id}] Downloading documents...")
        crud.update_application_status(
            db, application_id, "downloading", "downloading", "Downloading receipt and admit card..."
        )
        
        download_result = await automation.du_download_documents(application_id)
        
        if download_result["success"]:
            # Save document paths
            if download_result.get("receipt_path"):
                crud.save_document(db, application_id, "receipt", download_result["receipt_path"])
            
            if download_result.get("admit_card_path"):
                crud.save_document(db, application_id, "admit_card", download_result["admit_card_path"])
            
            # Mark as completed
            crud.update_application_status(
                db, application_id, "completed", "completed", 
                "Application completed successfully! Documents downloaded."
            )
            
            active_jobs[job_id]["status"] = "completed"
        else:
            logger.warning(f"[{application_id}] Document download failed: {download_result['message']}")
            crud.update_application_status(
                db, application_id, "completed", "completed_no_docs", 
                "Application completed but documents could not be downloaded automatically."
            )
        
        # Clean up
        await automation.close()
        del otp_waiting_jobs[job_id]
        
    except Exception as e:
        logger.error(f"[{application_id}] Payment completion error: {str(e)}")
        crud.update_application_status(
            db, application_id, "failed", "error", f"Document download failed: {str(e)}"
        )
        if job_id in otp_waiting_jobs:
            automation = otp_waiting_jobs[job_id]
            await automation.close()
            del otp_waiting_jobs[job_id]
    finally:
        db.close()


def run_du_automation(application_id: str, job_id: str):
    """
    Wrapper to run async automation in a thread
    """
    asyncio.run(run_du_automation_async(application_id, job_id))


def start_automation_background(application_id: str, job_id: str):
    """
    Start automation in background thread
    """
    thread = Thread(target=run_du_automation, args=(application_id, job_id))
    thread.daemon = True
    thread.start()
    logger.info(f"Started automation thread for application {application_id}")
