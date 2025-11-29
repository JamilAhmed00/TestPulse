import uuid
from datetime import datetime
import logging
import os


def generate_application_id() -> str:
    """Generate unique application ID"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    return f"DU-{timestamp}-{unique_id}"


def generate_transaction_id() -> str:
    """Generate unique transaction ID"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    unique_id = str(uuid.uuid4())[:6]
    return f"TXN-{timestamp}-{unique_id}"


def generate_job_id() -> str:
    """Generate unique job ID for RPA tracking"""
    return f"JOB-{str(uuid.uuid4())}"


def setup_logging():
    """Configure logging for the application"""
    log_dir = "./uploads/logs"
    os.makedirs(log_dir, exist_ok=True)
    
    log_file = os.path.join(log_dir, f"app_{datetime.now().strftime('%Y%m%d')}.log")
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler()
        ]
    )
    
    return logging.getLogger(__name__)


def ensure_upload_dirs():
    """Ensure all upload directories exist"""
    dirs = [
        "./uploads/photos",
        "./uploads/docs",
        "./uploads/logs"
    ]
    for dir_path in dirs:
        os.makedirs(dir_path, exist_ok=True)
