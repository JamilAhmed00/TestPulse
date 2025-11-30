"""
BUP Admission Pydantic Schemas
Request/Response schemas for BUP admission API
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, date


class BUPApplicationCreate(BaseModel):
    """Schema for creating BUP application"""
    # Faculty/Program - should be exact program name from website
    # Examples: "Bachelor of Business Administration (General)", "Bachelor of Arts in English", etc.
    faculty: str = Field(..., description="Exact program name from BUP website")
    
    # SSC Information
    ssc_examination: str
    ssc_roll: str = Field(..., min_length=6, max_length=6)
    ssc_registration: str = Field(..., min_length=10, max_length=13)
    ssc_passing_year: int = Field(..., ge=2015, le=2024)
    ssc_board: str
    
    # HSC Information
    hsc_examination: str
    hsc_roll: str = Field(..., min_length=6, max_length=6)
    hsc_registration: str = Field(..., min_length=10, max_length=13)
    hsc_passing_year: int = Field(..., ge=2015, le=2024)
    hsc_board: str
    
    # Personal Information
    candidate_name: str = Field(..., min_length=3, max_length=100)
    father_name: str = Field(..., min_length=3, max_length=100)
    mother_name: str = Field(..., min_length=3, max_length=100)
    date_of_birth: date
    gender: str = Field(..., pattern="^(Male|Female|Other)$")
    nationality: str = "Bangladeshi"
    religion: str
    mobile_number: str = Field(..., pattern="^01[0-9]{9}$")
    email: EmailStr
    nid_birth_cert: Optional[str] = None
    
    # Present Address
    present_division: str
    present_district: str
    present_thana: str
    present_post_office: Optional[str] = None
    present_village: str
    present_zip: Optional[str] = None
    
    # Permanent Address
    permanent_division: Optional[str] = None
    permanent_district: Optional[str] = None
    permanent_thana: Optional[str] = None
    permanent_post_office: Optional[str] = None
    permanent_village: Optional[str] = None
    permanent_zip: Optional[str] = None
    same_as_present: bool = False


class BUPApplicationResponse(BaseModel):
    """Schema for BUP application response"""
    id: str
    faculty: str
    candidate_name: str
    mobile_number: str
    email: str
    job_status: str
    current_stage: str
    stage_message: Optional[str]
    payment_status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class BUPAutomationStart(BaseModel):
    """Schema for starting BUP automation"""
    application_id: str


class BUPStatusResponse(BaseModel):
    """Schema for BUP automation status"""
    application_id: str
    job_status: str
    current_stage: str
    stage_message: Optional[str]
    next_step: Optional[str]
    documents: Optional[dict]


class BUPPaymentURLResponse(BaseModel):
    """Schema for payment URL response"""
    payment_url: str
    transaction_id: str
    amount: float


class BUPOTPSubmit(BaseModel):
    """Schema for OTP submission (if needed)"""
    application_id: str
    job_id: str
    otp_code: str
