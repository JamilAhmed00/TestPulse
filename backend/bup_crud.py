"""
BUP Admission CRUD Operations
Database operations for BUP applications
"""

from sqlalchemy.orm import Session
from bup_models import BUPApplication, BUPJob, BUPDocument, BUPPayment
from datetime import datetime


def create_bup_application(db: Session, app_data: dict) -> BUPApplication:
    """Create new BUP application"""
    db_app = BUPApplication(**app_data)
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app


def get_bup_application(db: Session, application_id: str) -> BUPApplication:
    """Get BUP application by ID"""
    return db.query(BUPApplication).filter(BUPApplication.id == application_id).first()


def update_bup_job_id(db: Session, application_id: str, job_id: str):
    """Update job ID for application"""
    db.query(BUPApplication).filter(BUPApplication.id == application_id).update({
        "job_id": job_id
    })
    db.commit()


def update_bup_application_status(db: Session, application_id: str, job_status: str, current_stage: str, stage_message: str):
    """Update application status"""
    db.query(BUPApplication).filter(BUPApplication.id == application_id).update({
        "job_status": job_status,
        "current_stage": current_stage,
        "stage_message": stage_message,
        "updated_at": datetime.now()
    })
    db.commit()


def update_bup_payment_status(db: Session, application_id: str, payment_status: str, transaction_id: str = None):
    """Update payment status"""
    update_data = {
        "payment_status": payment_status,
        "updated_at": datetime.now()
    }
    if transaction_id:
        update_data["transaction_id"] = transaction_id
    
    db.query(BUPApplication).filter(BUPApplication.id == application_id).update(update_data)
    db.commit()


def save_bup_document(db: Session, application_id: str, doc_type: str, file_path: str):
    """Save document record"""
    # Update application table
    if doc_type == "admission_slip":
        db.query(BUPApplication).filter(BUPApplication.id == application_id).update({
            "admission_slip_path": file_path
        })
    elif doc_type == "receipt":
        db.query(BUPApplication).filter(BUPApplication.id == application_id).update({
            "receipt_path": file_path
        })
    
    # Create document record
    doc = BUPDocument(
        application_id=application_id,
        document_type=doc_type,
        file_path=file_path
    )
    db.add(doc)
    db.commit()


def create_bup_job(db: Session, job_data: dict) -> BUPJob:
    """Create new BUP job"""
    db_job = BUPJob(**job_data)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job


def update_bup_job_status(db: Session, job_id: str, status: str, current_stage: str = None, stage_message: str = None):
    """Update job status"""
    update_data = {"status": status}
    if current_stage:
        update_data["current_stage"] = current_stage
    if stage_message:
        update_data["stage_message"] = stage_message
    
    db.query(BUPJob).filter(BUPJob.id == job_id).update(update_data)
    db.commit()


def save_bup_job_error(db: Session, job_id: str, error_message: str, screenshot_path: str = None):
    """Save job error"""
    job = db.query(BUPJob).filter(BUPJob.id == job_id).first()
    if job:
        job.last_error = error_message
        job.error_count += 1
        
        if screenshot_path:
            screenshots = job.error_screenshots or []
            screenshots.append(screenshot_path)
            job.error_screenshots = screenshots
        
        db.commit()


def create_bup_payment(db: Session, payment_data: dict) -> BUPPayment:
    """Create payment record"""
    db_payment = BUPPayment(**payment_data)
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment


def update_bup_payment(db: Session, transaction_id: str, update_data: dict):
    """Update payment record"""
    db.query(BUPPayment).filter(BUPPayment.transaction_id == transaction_id).update(update_data)
    db.commit()
