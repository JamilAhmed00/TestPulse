from sqlalchemy.orm import Session
from models import UniApplication, UniDocument
from datetime import datetime
from typing import Optional


def create_application(db: Session, app_data: dict) -> UniApplication:
    """Create a new university application"""
    db_app = UniApplication(**app_data)
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app


def get_application(db: Session, application_id: str) -> Optional[UniApplication]:
    """Get application by ID"""
    return db.query(UniApplication).filter(UniApplication.id == application_id).first()


def update_application_status(
    db: Session,
    application_id: str,
    job_status: str,
    current_stage: str,
    stage_message: str
) -> Optional[UniApplication]:
    """Update application job status and stage"""
    db_app = get_application(db, application_id)
    if db_app:
        db_app.job_status = job_status
        db_app.current_stage = current_stage
        db_app.stage_message = stage_message
        db_app.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_app)
    return db_app


def update_payment_status(
    db: Session,
    application_id: str,
    payment_status: str,
    transaction_id: str
) -> Optional[UniApplication]:
    """Update payment status"""
    db_app = get_application(db, application_id)
    if db_app:
        db_app.payment_status = payment_status
        db_app.transaction_id = transaction_id
        db_app.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_app)
    return db_app


def save_document(
    db: Session,
    application_id: str,
    document_type: str,
    file_path: str
) -> UniDocument:
    """Save document path"""
    db_doc = UniDocument(
        application_id=application_id,
        document_type=document_type,
        file_path=file_path
    )
    db.add(db_doc)
    
    # Also update the application record
    db_app = get_application(db, application_id)
    if db_app:
        if document_type == "receipt":
            db_app.receipt_path = file_path
        elif document_type == "admit_card":
            db_app.admit_card_path = file_path
        db_app.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_doc)
    return db_doc


def update_job_id(db: Session, application_id: str, job_id: str) -> Optional[UniApplication]:
    """Update job ID for tracking"""
    db_app = get_application(db, application_id)
    if db_app:
        db_app.job_id = job_id
        db_app.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_app)
    return db_app


def update_sms_code(db: Session, application_id: str, sms_code: str) -> Optional[UniApplication]:
    """Update SMS code for OTP"""
    db_app = get_application(db, application_id)
    if db_app:
        db_app.sms_code = sms_code
        db_app.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_app)
    return db_app

