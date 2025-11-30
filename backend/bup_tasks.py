"""
BUP Admission Background Tasks
Job orchestration and automation workflow management
"""

import sys
import asyncio

# Fix for Windows Playwright async issue
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from typing import Dict
import logging
from bup_rpa import BUPAutomation
from database import SessionLocal
import bup_crud
from threading import Thread

logger = logging.getLogger(__name__)

# In-memory job tracking
active_bup_jobs: Dict[str, Dict] = {}
payment_waiting_jobs: Dict[str, BUPAutomation] = {}


async def run_bup_automation_async(application_id: str, job_id: str):
    """
    Main BUP automation orchestrator (async version)
    Runs the complete BUP admission flow
    """
    db = SessionLocal()
    automation = BUPAutomation()
    
    try:
        # Store automation instance for payment resume
        payment_waiting_jobs[job_id] = automation
        active_bup_jobs[job_id] = {
            "application_id": application_id,
            "status": "running",
            "stage": "initializing"
        }
        
        # Get application data
        app = bup_crud.get_bup_application(db, application_id)
        if not app:
            raise Exception("Application not found")
        
        # Initialize browser
        logger.info(f"[{application_id}] Initializing browser...")
        await automation.initialize()
        bup_crud.update_bup_application_status(
            db, application_id, "running", "initialization", "Initializing browser..."
        )
        
        # Step 1: Navigate to admission page
        logger.info(f"[{application_id}] Navigating to BUP admission page...")
        bup_crud.update_bup_application_status(
            db, application_id, "running", "navigation", "Loading BUP admission page..."
        )
        
        nav_result = await automation.navigate_to_admission_page()
        if not nav_result["success"]:
            raise Exception(f"Navigation failed: {nav_result['message']}")
        
        # Step 2: Select faculty
        logger.info(f"[{application_id}] Selecting faculty...")
        bup_crud.update_bup_application_status(
            db, application_id, "running", "faculty_selection", f"Selecting faculty: {app.faculty}"
        )
        
        faculty_result = await automation.select_faculty(app.faculty)
        if not faculty_result["success"]:
            raise Exception(f"Faculty selection failed: {faculty_result['message']}")
        
        # Step 3: Select education type
        logger.info(f"[{application_id}] Selecting education type...")
        bup_crud.update_bup_application_status(
            db, application_id, "running", "education_type", "Selecting SSC/HSC education type..."
        )
        
        edu_type_result = await automation.select_education_type("SSC/HSC")
        if not edu_type_result["success"]:
            raise Exception(f"Education type selection failed: {edu_type_result['message']}")
        
        # Step 4: Fill SSC information
        logger.info(f"[{application_id}] Filling SSC information...")
        bup_crud.update_bup_application_status(
            db, application_id, "running", "ssc_info", "Filling SSC examination details..."
        )
        
        ssc_data = {
            "ssc_examination": app.ssc_examination,
            "ssc_roll": app.ssc_roll,
            "ssc_registration": app.ssc_registration,
            "ssc_passing_year": app.ssc_passing_year,
            "ssc_board": app.ssc_board
        }
        
        ssc_result = await automation.fill_ssc_information(ssc_data)
        if not ssc_result["success"]:
            raise Exception(f"SSC information failed: {ssc_result['message']}")
        
        # Step 5: Fill HSC information
        logger.info(f"[{application_id}] Filling HSC information...")
        bup_crud.update_bup_application_status(
            db, application_id, "running", "hsc_info", "Filling HSC examination details..."
        )
        
        hsc_data = {
            "hsc_examination": app.hsc_examination,
            "hsc_roll": app.hsc_roll,
            "hsc_registration": app.hsc_registration,
            "hsc_passing_year": app.hsc_passing_year,
            "hsc_board": app.hsc_board
        }
        
        hsc_result = await automation.fill_hsc_information(hsc_data)
        if not hsc_result["success"]:
            raise Exception(f"HSC information failed: {hsc_result['message']}")
        
        # Step 6: Fill personal information
        logger.info(f"[{application_id}] Filling personal information...")
        bup_crud.update_bup_application_status(
            db, application_id, "running", "personal_info", "Filling personal details..."
        )
        
        personal_data = {
            "candidate_name": app.candidate_name,
            "father_name": app.father_name,
            "mother_name": app.mother_name,
            "date_of_birth": app.date_of_birth,
            "gender": app.gender,
            "nationality": app.nationality,
            "religion": app.religion,
            "mobile_number": app.mobile_number,
            "email": app.email,
            "nid_birth_cert": app.nid_birth_cert
        }
        
        personal_result = await automation.fill_personal_information(personal_data)
        if not personal_result["success"]:
            raise Exception(f"Personal information failed: {personal_result['message']}")
        
        # Step 7: Fill present address
        logger.info(f"[{application_id}] Filling present address...")
        bup_crud.update_bup_application_status(
            db, application_id, "running", "present_address", "Filling present address..."
        )
        
        present_address_data = {
            "present_division": app.present_division,
            "present_district": app.present_district,
            "present_thana": app.present_thana,
            "present_post_office": app.present_post_office,
            "present_village": app.present_village,
            "present_zip": app.present_zip
        }
        
        present_address_result = await automation.fill_present_address(present_address_data)
        if not present_address_result["success"]:
            raise Exception(f"Present address failed: {present_address_result['message']}")
        
        # Step 8: Fill permanent address
        logger.info(f"[{application_id}] Filling permanent address...")
        bup_crud.update_bup_application_status(
            db, application_id, "running", "permanent_address", "Filling permanent address..."
        )
        
        if app.same_as_present:
            permanent_address_result = await automation.fill_permanent_address({}, same_as_present=True)
        else:
            permanent_address_data = {
                "permanent_division": app.permanent_division,
                "permanent_district": app.permanent_district,
                "permanent_thana": app.permanent_thana,
                "permanent_post_office": app.permanent_post_office,
                "permanent_village": app.permanent_village,
                "permanent_zip": app.permanent_zip
            }
            permanent_address_result = await automation.fill_permanent_address(permanent_address_data, same_as_present=False)
        
        if not permanent_address_result["success"]:
            raise Exception(f"Permanent address failed: {permanent_address_result['message']}")
        
        # Step 9: Upload photo
        if app.photo_path:
            logger.info(f"[{application_id}] Uploading photo...")
            bup_crud.update_bup_application_status(
                db, application_id, "running", "photo_upload", "Uploading candidate photo..."
            )
            
            photo_result = await automation.upload_photo(app.photo_path)
            if not photo_result["success"]:
                logger.warning(f"Photo upload failed: {photo_result['message']}")
        
        # Step 10: Upload signature
        if app.signature_path:
            logger.info(f"[{application_id}] Uploading signature...")
            bup_crud.update_bup_application_status(
                db, application_id, "running", "signature_upload", "Uploading candidate signature..."
            )
            
            signature_result = await automation.upload_signature(app.signature_path)
            if not signature_result["success"]:
                logger.warning(f"Signature upload failed: {signature_result['message']}")
        
        # Step 11: Submit application
        logger.info(f"[{application_id}] Submitting application...")
        bup_crud.update_bup_application_status(
            db, application_id, "running", "submission", "Submitting application form..."
        )
        
        submit_result = await automation.submit_application()
        if not submit_result["success"]:
            raise Exception(f"Application submission failed: {submit_result['message']}")
        
        # Step 12: Get payment info
        logger.info(f"[{application_id}] Getting payment information...")
        bup_crud.update_bup_application_status(
            db, application_id, "payment_pending", "payment", "Application submitted. Please complete payment..."
        )
        
        payment_info = await automation.get_payment_info()
        
        # Update payment amount
        if payment_info.get("amount"):
            db.query(bup_crud.BUPApplication).filter(
                bup_crud.BUPApplication.id == application_id
            ).update({"payment_amount": payment_info["amount"]})
            db.commit()
        
        # Pause automation - wait for payment
        active_bup_jobs[job_id]["stage"] = "payment_waiting"
        logger.info(f"[{application_id}] Automation paused, waiting for payment completion...")
        
        # Keep browser alive for document download after payment
        
    except Exception as e:
        logger.error(f"[{application_id}] Automation error: {str(e)}")
        bup_crud.update_bup_application_status(
            db, application_id, "failed", "error", f"Automation failed: {str(e)}"
        )
        active_bup_jobs[job_id] = {
            "application_id": application_id,
            "status": "failed",
            "error": str(e)
        }
        await automation.close()
        if job_id in payment_waiting_jobs:
            del payment_waiting_jobs[job_id]
    finally:
        db.close()


async def complete_bup_automation_after_payment(application_id: str, job_id: str):
    """
    Complete automation after payment is successful
    Download documents
    """
    db = SessionLocal()
    
    try:
        # Get the paused automation instance
        if job_id not in payment_waiting_jobs:
            logger.warning(f"[{application_id}] Job not found, may have already completed")
            return
        
        automation = payment_waiting_jobs[job_id]
        
        # Step 13: Download documents
        logger.info(f"[{application_id}] Downloading documents...")
        bup_crud.update_bup_application_status(
            db, application_id, "downloading", "downloading", "Downloading admission slip and receipt..."
        )
        
        download_result = await automation.download_documents(application_id)
        
        if download_result["success"]:
            # Save document paths
            if download_result.get("admission_slip_path"):
                bup_crud.save_bup_document(db, application_id, "admission_slip", download_result["admission_slip_path"])
            
            if download_result.get("receipt_path"):
                bup_crud.save_bup_document(db, application_id, "receipt", download_result["receipt_path"])
            
            # Mark as completed
            bup_crud.update_bup_application_status(
                db, application_id, "completed", "completed",
                "Application completed successfully! Documents downloaded."
            )
            
            active_bup_jobs[job_id]["status"] = "completed"
        else:
            logger.warning(f"[{application_id}] Document download failed: {download_result['message']}")
            bup_crud.update_bup_application_status(
                db, application_id, "completed", "completed_no_docs",
                "Application completed but documents could not be downloaded automatically."
            )
        
        # Clean up
        await automation.close()
        del payment_waiting_jobs[job_id]
        
    except Exception as e:
        logger.error(f"[{application_id}] Payment completion error: {str(e)}")
        bup_crud.update_bup_application_status(
            db, application_id, "failed", "error", f"Document download failed: {str(e)}"
        )
        if job_id in payment_waiting_jobs:
            automation = payment_waiting_jobs[job_id]
            await automation.close()
            del payment_waiting_jobs[job_id]
    finally:
        db.close()


def run_bup_automation(application_id: str, job_id: str):
    """
    Wrapper to run async automation in a thread
    """
    asyncio.run(run_bup_automation_async(application_id, job_id))


def start_bup_automation_background(application_id: str, job_id: str):
    """
    Start BUP automation in background thread
    """
    thread = Thread(target=run_bup_automation, args=(application_id, job_id))
    thread.daemon = True
    thread.start()
    logger.info(f"Started BUP automation thread for application {application_id}")
