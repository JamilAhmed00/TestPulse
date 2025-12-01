"""
BUP Automation Test Script
Test the complete BUP admission automation with sample student data
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from bup_rpa import BUPAutomation
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def test_bup_automation():
    """
    Test BUP automation with sample student data
    """
    
    # Student data from user
    student_data = {
        # Academic Information
        'faculty': 'Bachelor of Business Administration (General)',
        
        # SSC Details
        'ssc_examination': 'SSC',
        'ssc_roll': '116735',
        'ssc_registration': '2014614701',
        'ssc_passing_year': 2023,
        'ssc_board': 'CHATTAGRAM',
        
        # HSC Details
        'hsc_examination': 'HSC',
        'hsc_roll': '120606',
        'hsc_registration': '2014614701',
        'hsc_passing_year': 2025,
        'hsc_board': 'CHATTAGRAM',
        
        # Personal Information
        'candidate_name': 'MD FAHMID TALUKDER',
        'father_name': 'MD HELAL UDDIN TALUKDER',
        'mother_name': 'UMMA SALMA BEGUM',
        'date_of_birth': datetime(2006, 10, 10),
        'gender': 'MALE',
        'nationality': 'Bangladeshi',
        'religion': 'ISLAM',
        'nid_birth_cert': '',
        
        # Contact Information
        'mobile_number': '01614742727',
        'email': 'jamilahmediiuc@gmail.com',
        
        # Present Address
        'present_division': 'CHATTAGRAM',
        'present_district': 'CHATTAGRAM',
        'present_thana': 'PORT',
        'present_post_office': '',
        'present_village': 'CHATTAGRAM',
        'present_zip': '3321',
        
        # Permanent Address (same as present)
        'same_as_present': True,
    }
    
    # File paths (use existing photos/signatures from uploads folder)
    photo_path = './uploads/photos/BUP-DU-20251130154032-fa052cac_photo.jpg'
    signature_path = './uploads/signatures/BUP-DU-20251130154032-fa052cac_signature.jpg'
    
    # Verify files exist
    if not os.path.exists(photo_path):
        logger.error(f"Photo not found: {photo_path}")
        return
    if not os.path.exists(signature_path):
        logger.error(f"Signature not found: {signature_path}")
        return
    
    automation = BUPAutomation()
    
    try:
        logger.info("=" * 80)
        logger.info("BUP ADMISSION AUTOMATION TEST")
        logger.info("=" * 80)
        
        # Step 1: Initialize browser
        logger.info("\n[STEP 1] Initializing browser...")
        await automation.initialize()
        logger.info("✓ Browser initialized")
        
        # Step 2: Navigate and select faculty
        logger.info(f"\n[STEP 2] Navigating to BUP admission page and selecting faculty...")
        result = await automation.navigate_and_select_faculty(student_data['faculty'])
        if not result['success']:
            raise Exception(result['message'])
        logger.info(f"✓ {result['message']}")
        
        # Step 3: Select education type (SSC/HSC)
        logger.info("\n[STEP 3] Selecting SSC/HSC education type...")
        result = await automation.select_education_type_ssc_hsc()
        if not result['success']:
            raise Exception(result['message'])
        logger.info(f"✓ {result['message']}")
        
        # Step 4: Fill SSC information
        logger.info("\n[STEP 4] Filling SSC information...")
        ssc_data = {
            'ssc_examination': student_data['ssc_examination'],
            'ssc_roll': student_data['ssc_roll'],
            'ssc_registration': student_data['ssc_registration'],
            'ssc_passing_year': student_data['ssc_passing_year'],
            'ssc_board': student_data['ssc_board']
        }
        result = await automation.fill_ssc_information(ssc_data)
        if not result['success']:
            raise Exception(result['message'])
        logger.info(f"✓ {result['message']}")
        
        # Step 5: Fill HSC information
        logger.info("\n[STEP 5] Filling HSC information...")
        hsc_data = {
            'hsc_examination': student_data['hsc_examination'],
            'hsc_roll': student_data['hsc_roll'],
            'hsc_registration': student_data['hsc_registration'],
            'hsc_passing_year': student_data['hsc_passing_year'],
            'hsc_board': student_data['hsc_board']
        }
        result = await automation.fill_hsc_information(hsc_data)
        if not result['success']:
            raise Exception(result['message'])
        logger.info(f"✓ {result['message']}")
        
        # Step 6: Click Verify Information
        logger.info("\n[STEP 6] Verifying SSC/HSC information...")
        result = await automation.click_verify_information()
        if not result['success']:
            raise Exception(result['message'])
        logger.info(f"✓ {result['message']}")
        
        # Step 7: Fill personal information
        logger.info("\n[STEP 7] Filling personal information...")
        result = await automation.fill_personal_information(student_data)
        if not result['success']:
            raise Exception(result['message'])
        logger.info(f"✓ {result['message']}")
        
        # Step 8: Fill present address
        logger.info("\n[STEP 8] Filling present address...")
        result = await automation.fill_present_address(student_data)
        if not result['success']:
            raise Exception(result['message'])
        logger.info(f"✓ {result['message']}")
        
        # Step 9: Handle permanent address
        logger.info("\n[STEP 9] Handling permanent address...")
        result = await automation.handle_permanent_address(student_data, same_as_present=student_data['same_as_present'])
        if not result['success']:
            raise Exception(result['message'])
        logger.info(f"✓ {result['message']}")
        
        # Step 10: Upload photo
        logger.info(f"\n[STEP 10] Uploading photo...")
        result = await automation.upload_photo(photo_path)
        if not result['success']:
            logger.warning(f"⚠ {result['message']}")
        else:
            logger.info(f"✓ {result['message']}")
        
        # Step 11: Upload signature
        logger.info(f"\n[STEP 11] Uploading signature...")
        result = await automation.upload_signature(signature_path)
        if not result['success']:
            logger.warning(f"⚠ {result['message']}")
        else:
            logger.info(f"✓ {result['message']}")
        
        # Step 12: Submit application
        logger.info("\n[STEP 12] Submitting application...")
        result = await automation.submit_application()
        if not result['success']:
            raise Exception(result['message'])
        logger.info(f"✓ {result['message']}")
        
        # Step 13: Get payment info
        logger.info("\n[STEP 13] Getting payment information...")
        result = await automation.get_payment_info()
        if result['success']:
            logger.info(f"✓ Payment URL: {result['payment_url']}")
            logger.info(f"  Amount: BDT {result['amount']}")
        
        logger.info("\n" + "=" * 80)
        logger.info("BUP AUTOMATION TEST COMPLETED SUCCESSFULLY!")
        logger.info("=" * 80)
        
        # Keep browser open for manual inspection
        logger.info("\nBrowser will remain open for 60 seconds for manual inspection...")
        await asyncio.sleep(60)
        
    except Exception as e:
        logger.error(f"\n❌ AUTOMATION FAILED: {str(e)}")
        logger.info("\nBrowser will remain open for 30 seconds for debugging...")
        await asyncio.sleep(30)
        
    finally:
        # Close browser
        logger.info("\nClosing browser...")
        await automation.close()
        logger.info("✓ Browser closed")


if __name__ == "__main__":
    asyncio.run(test_bup_automation())
