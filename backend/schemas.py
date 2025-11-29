from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class ApplicationCreate(BaseModel):
    # Student Credentials
    hsc_roll: str
    hsc_board: str
    hsc_year: int
    hsc_registration_number: str
    ssc_roll: str
    ssc_board: str
    ssc_year: int
    
    # Personal Details
    first_name: str
    last_name: str
    father_name: str
    mother_name: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    
    # Contact Information
    email: EmailStr
    mobile_number: str
    
    # Address
    present_address: str
    permanent_address: Optional[str] = None
    city: str
    district: Optional[str] = None
    postal_code: Optional[str] = None
    
    # Application Details
    quota: Optional[str] = None
    exam_center: Optional[str] = None
    unit: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: str
    job_status: str
    current_stage: str
    stage_message: str
    payment_status: str
    transaction_id: Optional[str]
    receipt_path: Optional[str]
    admit_card_path: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class AutomationStart(BaseModel):
    application_id: str


class StatusResponse(BaseModel):
    application_id: str
    job_status: str
    current_stage: str
    stage_message: str
    next_step: Optional[str] = None
    sms_code: Optional[str] = None  # 8-character SMS code to send to 16321
    documents: Optional[dict] = None



class OTPSubmit(BaseModel):
    application_id: str
    job_id: str
    otp_code: str


class PaymentURLResponse(BaseModel):
    payment_url: str
    transaction_id: str
    amount: float


class DocumentResponse(BaseModel):
    receipt_url: Optional[str]
    admit_card_url: Optional[str]
