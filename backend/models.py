from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class UniApplication(Base):
    __tablename__ = "uni_applications"
    
    # Primary Key
    id = Column(String, primary_key=True, index=True)
    
    # Student Credentials
    hsc_roll = Column(String, nullable=False)
    hsc_board = Column(String, nullable=False)
    hsc_year = Column(Integer, nullable=False)
    hsc_registration_number = Column(String, nullable=False)
    ssc_roll = Column(String, nullable=False)
    ssc_board = Column(String, nullable=False)
    ssc_year = Column(Integer, nullable=False)
    
    # Personal Details
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    father_name = Column(String, nullable=False)
    mother_name = Column(String, nullable=False)
    date_of_birth = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    
    # Contact Information
    email = Column(String, nullable=False)
    mobile_number = Column(String, nullable=False)
    
    # Address
    present_address = Column(Text, nullable=False)
    permanent_address = Column(Text, nullable=True)
    city = Column(String, nullable=False)
    district = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)
    
    # Application Details
    quota = Column(String, nullable=True)  # Freedom Fighter, Tribal, etc.
    exam_center = Column(String, nullable=True)
    unit = Column(String, nullable=True)  # Science/Commerce/Arts
    
    # Photo
    photo_path = Column(String, nullable=True)
    
    # Payment
    payment_status = Column(String, default="pending")  # pending, completed, failed
    transaction_id = Column(String, nullable=True)
    payment_amount = Column(Float, default=500.0)
    
    # RPA Job Status
    job_status = Column(String, default="pending")  # pending, login, form_fill, otp_required, payment, downloading, completed, failed
    job_id = Column(String, nullable=True)
    current_stage = Column(String, default="created")
    stage_message = Column(Text, default="Application created successfully")
    sms_code = Column(String, nullable=True)  # 8-character SMS code to send to 16321

    
    # Documents
    receipt_path = Column(String, nullable=True)
    admit_card_path = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    documents = relationship("UniDocument", back_populates="application", cascade="all, delete-orphan")


class UniDocument(Base):
    __tablename__ = "uni_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(String, ForeignKey("uni_applications.id"), nullable=False)
    document_type = Column(String, nullable=False)  # receipt, admit_card
    file_path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    application = relationship("UniApplication", back_populates="documents")
