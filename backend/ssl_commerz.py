import httpx
from config import get_settings
from typing import Dict, Optional
import logging

settings = get_settings()
logger = logging.getLogger(__name__)


async def init_payment(
    amount: float,
    transaction_id: str,
    customer_name: str,
    customer_email: str,
    customer_phone: str,
    application_id: str
) -> Dict:
    """
    Initialize SSLCommerz payment session
    Returns payment URL and session info
    """
    try:
        # Prepare payment data
        payment_data = {
            'store_id': settings.sslcommerz_store_id,
            'store_passwd': settings.sslcommerz_store_password,
            'total_amount': amount,
            'currency': 'BDT',
            'tran_id': transaction_id,
            'success_url': f'{settings.backend_url}/api/uni/payment/callback?status=success',
            'fail_url': f'{settings.backend_url}/api/uni/payment/callback?status=failed',
            'cancel_url': f'{settings.backend_url}/api/uni/payment/callback?status=cancelled',
            'ipn_url': f'{settings.backend_url}/api/uni/payment/ipn',
            
            # Customer information
            'cus_name': customer_name,
            'cus_email': customer_email,
            'cus_phone': customer_phone,
            'cus_add1': 'Dhaka',
            'cus_city': 'Dhaka',
            'cus_country': 'Bangladesh',
            
            # Product information
            'product_name': 'DU Admission Application Fee',
            'product_category': 'Education',
            'product_profile': 'general',
            
            # Additional fields
            'value_a': application_id,  # Store application ID for reference
            'shipping_method': 'NO',
            'num_of_item': 1,
        }
        
        # Make request to SSLCommerz
        async with httpx.AsyncClient() as client:
            response = await client.post(
                settings.sslcommerz_api_url,
                data=payment_data,
                timeout=30.0
            )
            
            result = response.json()
            
            if result.get('status') == 'SUCCESS':
                return {
                    'success': True,
                    'payment_url': result.get('GatewayPageURL'),
                    'session_key': result.get('sessionkey'),
                    'transaction_id': transaction_id
                }
            else:
                logger.error(f"SSLCommerz init failed: {result}")
                return {
                    'success': False,
                    'error': result.get('failedreason', 'Payment initialization failed')
                }
                
    except Exception as e:
        logger.error(f"Error initializing payment: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }


async def verify_payment(transaction_id: str, val_id: str) -> Dict:
    """
    Verify payment with SSLCommerz
    """
    try:
        validation_url = f"{settings.sslcommerz_validation_url}?val_id={val_id}&store_id={settings.sslcommerz_store_id}&store_passwd={settings.sslcommerz_store_password}&format=json"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(validation_url, timeout=30.0)
            result = response.json()
            
            if result.get('status') == 'VALID' or result.get('status') == 'VALIDATED':
                return {
                    'success': True,
                    'transaction_id': result.get('tran_id'),
                    'amount': result.get('amount'),
                    'currency': result.get('currency'),
                    'card_type': result.get('card_type'),
                    'bank_tran_id': result.get('bank_tran_id')
                }
            else:
                return {
                    'success': False,
                    'error': 'Payment validation failed',
                    'status': result.get('status')
                }
                
    except Exception as e:
        logger.error(f"Error verifying payment: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }
