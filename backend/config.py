from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./du_admission.db"
    
    # DU Website URLs
    du_admission_url: str = "https://admission.eis.du.ac.bd/en/408b7c8ad06e4d9954fa2d948a01f508"
    du_login_url: str = "https://admission.eis.du.ac.bd/en/hask5de047fde9454fldkjdae3cfaget464"
    
    # SSLCommerz Sandbox Credentials
    sslcommerz_store_id: str = "testbox"
    sslcommerz_store_password: str = "qwerty"
    sslcommerz_api_url: str = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
    sslcommerz_validation_url: str = "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php"
    
    # Application Settings
    upload_dir: str = "./uploads"
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings():
    return Settings()
