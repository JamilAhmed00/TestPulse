"""
BUP Admission Database Models
Bangladesh University of Professionals (BUP) admission application models
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DECIMAL, DateTime, Date, JSON
from sqlalchemy.sql import func
from database import Base


class BUPApplication(Base):
    """BUP Admission Application Model"""
    __tablename__ = "bup_applications"
    
    # Primary Key
    id = Column(String(50), primary_key=True)  # BUP-20251130-XXXXX
    user_id = Column(Integer, nullable=True)  # Optional user reference
    
    # Faculty/Program Selection
    faculty = Column(String(100), nullable=False)  # FASS, FBS, FST, FSSS
    application_fee = Column(DECIMAL(10, 2), nullable=False)
    
    # SSC Information
    ssc_examination = Column(String(50), nullable=False)  # SSC, Dakhil, SSC Vocational
    ssc_roll = Column(String(20), nullable=False)
    ssc_registration = Column(String(20), nullable=False)
    ssc_passing_year = Column(Integer, nullable=False)
    ssc_board = Column(String(50), nullable=False)
    
    # HSC Information
    hsc_examination = Column(String(50), nullable=False)  # HSC, Alim, HSC Vocational
    hsc_roll = Column(String(20), nullable=False)
    hsc_registration = Column(String(20), nullable=False)
    hsc_passing_year = Column(Integer, nullable=False)
    hsc_board = Column(String(50), nullable=False)
    
    # Personal Information
    candidate_name = Column(String(100), nullable=False)
    father_name = Column(String(100), nullable=False)
    mother_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(20), nullable=False)
    nationality = Column(String(50), nullable=False, default="Bangladeshi")
    religion = Column(String(50), nullable=False)
    mobile_number = Column(String(15), nullable=False)
    email = Column(String(100), nullable=False)
    nid_birth_cert = Column(String(20), nullable=True)
    
    # Present Address
    present_division = Column(String(50), nullable=False)
    present_district = Column(String(50), nullable=False)
    present_thana = Column(String(50), nullable=False)
    present_post_office = Column(String(100), nullable=True)
    present_village = Column(Text, nullable=False)
    present_zip = Column(String(10), nullable=True)
    
    # Permanent Address
    permanent_division = Column(String(50), nullable=False)
    permanent_district = Column(String(50), nullable=False)
    permanent_thana = Column(String(50), nullable=False)
    permanent_post_office = Column(String(100), nullable=True)
    permanent_village = Column(Text, nullable=False)
    permanent_zip = Column(String(10), nullable=True)
    same_as_present = Column(Boolean, default=False)
    
    # Files
    photo_path = Column(String(255), nullable=True)
    signature_path = Column(String(255), nullable=True)
    
    # Job Tracking
    job_id = Column(String(50), nullable=True)
    job_status = Column(String(50), default="pending")
    current_stage = Column(String(50), default="created")
    stage_message = Column(Text, nullable=True)
    
    # Payment
    payment_status = Column(String(50), default="pending")
    payment_amount = Column(DECIMAL(10, 2), nullable=True)
    transaction_id = Column(String(100), nullable=True)
    payment_method = Column(String(50), nullable=True)
    payment_date = Column(DateTime, nullable=True)
    
    # Documents
    admission_slip_path = Column(String(255), nullable=True)
    receipt_path = Column(String(255), nullable=True)
    
    # BUP Credentials
    bup_username = Column(String(100), nullable=True)
    bup_password = Column(String(100), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime, nullable=True)


class BUPJob(Base):
    """BUP Automation Job Tracking"""
    __tablename__ = "bup_jobs"
    
    id = Column(String(50), primary_key=True)
    application_id = Column(String(50), nullable=False)
    
    # Job Status
    status = Column(String(50), default="created")  # created, running, paused, completed, failed
    current_stage = Column(String(50), nullable=True)
    stage_message = Column(Text, nullable=True)
    
    # Session Data
    browser_cookies = Column(JSON, nullable=True)
    storage_state = Column(JSON, nullable=True)
    
    # Progress Tracking
    stages_completed = Column(JSON, nullable=True)  # Array of completed stages
    retry_count = Column(Integer, default=0)
    error_count = Column(Integer, default=0)
    
    # Error Tracking
    last_error = Column(Text, nullable=True)
    error_screenshots = Column(JSON, nullable=True)  # Array of screenshot paths
    
    # Pause/Resume
    paused_for = Column(String(50), nullable=True)  # payment, otp, etc.
    pause_timestamp = Column(DateTime, nullable=True)
    resume_timestamp = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)


class BUPDocument(Base):
    """BUP Application Documents"""
    __tablename__ = "bup_documents"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    application_id = Column(String(50), nullable=False)
    
    document_type = Column(String(50), nullable=False)  # admission_slip, receipt, photo, signature
    file_path = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String(50), nullable=True)
    
    uploaded_at = Column(DateTime, server_default=func.now())


class BUPPayment(Base):
    """BUP Payment Records"""
    __tablename__ = "bup_payments"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    application_id = Column(String(50), nullable=False)
    
    transaction_id = Column(String(100), unique=True, nullable=False)
    validation_id = Column(String(100), nullable=True)
    
    amount = Column(DECIMAL(10, 2), nullable=False)
    currency = Column(String(10), default="BDT")
    
    payment_method = Column(String(50), nullable=True)  # bKash, Rocket, Card
    card_type = Column(String(50), nullable=True)
    bank_name = Column(String(100), nullable=True)
    
    status = Column(String(50), default="pending")  # pending, success, failed, cancelled
    
    # SSLCommerz Data
    tran_date = Column(DateTime, nullable=True)
    val_id = Column(String(100), nullable=True)
    store_amount = Column(DECIMAL(10, 2), nullable=True)
    card_issuer = Column(String(100), nullable=True)
    
    # Timestamps
    initiated_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)
