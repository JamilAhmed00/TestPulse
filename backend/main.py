from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import Optional
import os
import shutil
import logging

from database import get_db, init_db
from config import get_settings
import crud
import schemas
from utils import (
    generate_application_id,
    generate_transaction_id,
    generate_job_id,
    setup_logging,
    ensure_upload_dirs
)
from photo_utils import validate_photo, process_photo
from ssl_commerz import init_payment, verify_payment
from tasks import (
    start_automation_background,
    resume_automation_after_otp,
    complete_automation_after_payment,
    active_jobs,
    otp_waiting_jobs
)
import asyncio
from contextlib import asynccontextmanager

# Setup
settings = get_settings()
logger = setup_logging()
ensure_upload_dirs()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup"""
    logger.info("Initializing database...")
    init_db()
    logger.info("Database initialized successfully")
    yield
    # Cleanup on shutdown (if needed)
    logger.info("Shutting down...")


# Initialize FastAPI app
app = FastAPI(
    title="TestPulse DU Admission API",
    description="Backend API for automating University of Dhaka admission applications",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for serving uploaded documents
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "TestPulse DU Admission API",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Health check"""
    return {"status": "healthy"}


@app.post("/api/uni/apply", response_model=schemas.ApplicationResponse)
async def create_application(
    # Student Credentials
    hsc_roll: str = Form(...),
    hsc_board: str = Form(...),
    hsc_year: int = Form(...),
    hsc_registration_number: str = Form(...),
    ssc_roll: str = Form(...),
    ssc_board: str = Form(...),
    ssc_year: int = Form(...),
    
    # Personal Details
    first_name: str = Form(...),
    last_name: str = Form(...),
    father_name: str = Form(...),
    mother_name: str = Form(...),
    date_of_birth: Optional[str] = Form(None),
    gender: Optional[str] = Form(None),
    
    # Contact Information
    email: str = Form(...),
    mobile_number: str = Form(...),
    
    # Address
    present_address: str = Form(...),
    permanent_address: Optional[str] = Form(None),
    city: str = Form(...),
    district: Optional[str] = Form(None),
    postal_code: Optional[str] = Form(None),
    
    # Application Details
    quota: Optional[str] = Form(None),
    exam_center: Optional[str] = Form(None),
    unit: Optional[str] = Form(None),
    
    # Photo
    photo: UploadFile = File(...),
    
    db: Session = Depends(get_db)
):
    """
    Create a new DU admission application
    Accepts multipart form data with student information and photo
    """
    try:
        logger.info(f"Creating application for {first_name} {last_name}")
        
        # Generate application ID
        app_id = generate_application_id()
        
        # Save uploaded photo
        photo_dir = "./uploads/photos"
        os.makedirs(photo_dir, exist_ok=True)
        
        temp_photo_path = os.path.join(photo_dir, f"{app_id}_temp.jpg")
        final_photo_path = os.path.join(photo_dir, f"{app_id}.jpg")
        
        # Save uploaded file
        with open(temp_photo_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        
        # Validate photo
        is_valid, error_msg = validate_photo(temp_photo_path)
        if not is_valid:
            os.remove(temp_photo_path)
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Process photo (resize and compress)
        success, message = process_photo(temp_photo_path, final_photo_path)
        
        # Remove temp file
        if os.path.exists(temp_photo_path):
            os.remove(temp_photo_path)
        
        if not success:
            raise HTTPException(status_code=400, detail=message)
        
        logger.info(f"Photo processed: {message}")
        
        # Create application record
        app_data = {
            "id": app_id,
            "hsc_roll": hsc_roll,
            "hsc_board": hsc_board,
            "hsc_year": hsc_year,
            "hsc_registration_number": hsc_registration_number,
            "ssc_roll": ssc_roll,
            "ssc_board": ssc_board,
            "ssc_year": ssc_year,
            "first_name": first_name,
            "last_name": last_name,
            "father_name": father_name,
            "mother_name": mother_name,
            "date_of_birth": date_of_birth,
            "gender": gender,
            "email": email,
            "mobile_number": mobile_number,
            "present_address": present_address,
            "permanent_address": permanent_address or present_address,
            "city": city,
            "district": district,
            "postal_code": postal_code,
            "quota": quota,
            "exam_center": exam_center,
            "unit": unit,
            "photo_path": final_photo_path,
            "job_status": "pending",
            "current_stage": "created",
            "stage_message": "Application created successfully. Ready to start automation.",
            "payment_status": "pending"
        }
        
        db_app = crud.create_application(db, app_data)
        
        logger.info(f"Application created: {app_id}")
        
        return db_app
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating application: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create application: {str(e)}")


@app.post("/api/uni/start-automation")
async def start_automation(
    request: schemas.AutomationStart,
    db: Session = Depends(get_db)
):
    """
    Start RPA automation for DU admission
    """
    try:
        application_id = request.application_id
        
        # Check if application exists
        app = crud.get_application(db, application_id)
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Check if already running
        if app.job_status in ["login", "form_fill", "otp_required", "payment", "downloading"]:
            return {
                "application_id": application_id,
                "job_id": app.job_id,
                "stage": app.current_stage,
                "message": "Automation already in progress"
            }
        
        # Generate job ID
        job_id = generate_job_id()
        
        # Update job ID in database
        crud.update_job_id(db, application_id, job_id)
        
        # Start automation in background
        start_automation_background(application_id, job_id)
        
        logger.info(f"Started automation for application {application_id}, job {job_id}")
        
        return {
            "application_id": application_id,
            "job_id": job_id,
            "stage": "login",
            "message": "Automation started successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting automation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/uni/status/{application_id}", response_model=schemas.StatusResponse)
async def get_status(
    application_id: str,
    db: Session = Depends(get_db)
):
    """
    Get current automation status
    """
    try:
        app = crud.get_application(db, application_id)
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Determine next step
        next_step = None
        if app.job_status == "otp_required":
            next_step = "Please enter the OTP sent to your mobile number"
        elif app.job_status == "payment":
            next_step = "Please complete the payment"
        elif app.job_status == "completed":
            next_step = "Application completed successfully"
        
        # Get documents if available
        documents = None
        if app.receipt_path or app.admit_card_path:
            documents = {
                "receipt": app.receipt_path,
                "admit_card": app.admit_card_path
            }
        
        return {
            "application_id": application_id,
            "job_status": app.job_status,
            "current_stage": app.current_stage,
            "stage_message": app.stage_message,
            "next_step": next_step,
            "sms_code": app.sms_code,  # Include SMS code for OTP
            "documents": documents
        }

        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/uni/submit-otp")
async def submit_otp(
    request: schemas.OTPSubmit,
    db: Session = Depends(get_db)
):
    """
    Submit OTP to resume automation
    """
    try:
        application_id = request.application_id
        job_id = request.job_id
        otp_code = request.otp_code
        
        # Check if application exists
        app = crud.get_application(db, application_id)
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Check if waiting for OTP
        if app.job_status != "otp_required":
            raise HTTPException(status_code=400, detail="Application is not waiting for OTP")
        
        # Resume automation with OTP
        logger.info(f"Resuming automation with OTP for {application_id}")
        
        # Run in background
        asyncio.create_task(resume_automation_after_otp(application_id, job_id, otp_code))
        
        return {
            "status": "resumed",
            "stage": "otp_verify",
            "message": "OTP submitted, verifying..."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting OTP: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/uni/get-payment-url", response_model=schemas.PaymentURLResponse)
async def get_payment_url(
    application_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Get SSLCommerz payment URL
    """
    try:
        app = crud.get_application(db, application_id)
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Generate transaction ID
        transaction_id = generate_transaction_id()
        
        # Initialize payment
        payment_result = await init_payment(
            amount=app.payment_amount,
            transaction_id=transaction_id,
            customer_name=f"{app.first_name} {app.last_name}",
            customer_email=app.email,
            customer_phone=app.mobile_number,
            application_id=application_id
        )
        
        if not payment_result.get('success'):
            raise HTTPException(status_code=400, detail=payment_result.get('error', 'Payment initialization failed'))
        
        # Update transaction ID
        crud.update_payment_status(db, application_id, "pending", transaction_id)
        
        return {
            "payment_url": payment_result['payment_url'],
            "transaction_id": transaction_id,
            "amount": app.payment_amount
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting payment URL: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/uni/payment/callback")
async def payment_callback(
    status: str = Query(...),
    tran_id: Optional[str] = Query(None),
    val_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Handle SSLCommerz payment callback
    """
    try:
        logger.info(f"Payment callback: status={status}, tran_id={tran_id}")
        
        if status == "success" and tran_id and val_id:
            # Verify payment
            verification = await verify_payment(tran_id, val_id)
            
            if verification.get('success'):
                # Find application by transaction ID
                # Note: This is simplified - in production, you'd query by transaction_id
                # For now, we'll need to pass application_id in the callback
                
                # Update payment status
                # crud.update_payment_status(db, application_id, "completed", tran_id)
                
                # Resume automation to download documents
                # asyncio.create_task(complete_automation_after_payment(application_id, job_id))
                
                logger.info(f"Payment verified successfully: {tran_id}")
                
                # Redirect to frontend success page
                return RedirectResponse(url=f"{settings.frontend_url}/applications?payment=success")
            else:
                logger.error(f"Payment verification failed: {verification}")
                return RedirectResponse(url=f"{settings.frontend_url}/applications?payment=failed")
        else:
            logger.warning(f"Payment {status}: {tran_id}")
            return RedirectResponse(url=f"{settings.frontend_url}/applications?payment={status}")
            
    except Exception as e:
        logger.error(f"Error in payment callback: {str(e)}")
        return RedirectResponse(url=f"{settings.frontend_url}/applications?payment=error")


@app.get("/api/uni/documents/{application_id}")
async def get_documents(
    application_id: str,
    db: Session = Depends(get_db)
):
    """
    Get application documents (receipt and admit card)
    """
    try:
        app = crud.get_application(db, application_id)
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return {
            "receipt_url": f"/uploads/docs/{os.path.basename(app.receipt_path)}" if app.receipt_path else None,
            "admit_card_url": f"/uploads/docs/{os.path.basename(app.admit_card_path)}" if app.admit_card_path else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/uni/download/{document_type}/{application_id}")
async def download_document(
    document_type: str,
    application_id: str,
    db: Session = Depends(get_db)
):
    """
    Download specific document (receipt or admit_card)
    """
    try:
        app = crud.get_application(db, application_id)
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        
        file_path = None
        if document_type == "receipt" and app.receipt_path:
            file_path = app.receipt_path
        elif document_type == "admit_card" and app.admit_card_path:
            file_path = app.admit_card_path
        
        if not file_path or not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Document not found")
        
        return FileResponse(
            file_path,
            media_type="application/pdf",
            filename=os.path.basename(file_path)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
