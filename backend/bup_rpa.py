"""
BUP Admission RPA Automation
Playwright-based automation for Bangladesh University of Professionals admission
"""

import sys
import asyncio

# Fix for Windows Playwright async issue
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from playwright.async_api import async_playwright, Page, Browser
from config import get_settings
import logging
from typing import Optional, Dict
import os

settings = get_settings()
logger = logging.getLogger(__name__)


class BUPAutomation:
    """Playwright automation for BUP admission process"""
    
    def __init__(self):
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        self.playwright = None
        
    async def initialize(self):
        """Initialize browser and page"""
        try:
            self.playwright = await async_playwright().start()
            self.browser = await self.playwright.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-setuid-sandbox']
            )
            self.page = await self.browser.new_page(
                viewport={'width': 1920, 'height': 1080},
                locale='en-BD',
                timezone_id='Asia/Dhaka'
            )
            logger.info("BUP automation browser initialized")
        except Exception as e:
            logger.error(f"Browser initialization error: {str(e)}")
            raise
            
    async def close(self):
        """Close browser"""
        try:
            if self.browser:
                await self.browser.close()
            if self.playwright:
                await self.playwright.stop()
            logger.info("BUP automation browser closed")
        except Exception as e:
            logger.error(f"Browser close error: {str(e)}")
    
    async def navigate_to_admission_page(self) -> Dict:
        """
        Navigate to BUP admission page
        URL: https://admission.bup.edu.bd/Admission/Candidate/SelectProgramV3?ecat=4
        """
        try:
            logger.info("Navigating to BUP admission page...")
            await self.page.goto(
                'https://admission.bup.edu.bd/Admission/Candidate/SelectProgramV3?ecat=4',
                wait_until='networkidle',
                timeout=60000
            )
            
            # Wait for faculty cards to load
            await self.page.wait_for_selector('input[type="checkbox"]', timeout=15000)
            await asyncio.sleep(2)  # Stabilization wait
            
            return {"success": True, "message": "Navigated to admission page"}
            
        except Exception as e:
            logger.error(f"Navigation error: {str(e)}")
            return {"success": False, "message": f"Navigation failed: {str(e)}"}
    
    async def select_faculty(self, faculty: str) -> Dict:
        """
        Select faculty/program
        Faculty parameter should be the exact program name from the website
        """
        try:
            logger.info(f"Selecting program: {faculty}")
            
            # The faculty parameter should be the exact program name like:
            # "Bachelor of Business Administration (General)"
            # "Bachelor of Arts in English"
            # etc.
            
            # Find checkbox by looking for the program name in the card
            selectors = [
                # Try to find checkbox near the program name text
                f'text="{faculty}" >> xpath=ancestor::div[contains(@class, "card") or contains(@class, "program")] >> input[type="checkbox"]',
                f'text="{faculty}" >> xpath=preceding::input[@type="checkbox"][1]',
                # Try to find by partial text match
                f'text=/{faculty.split("(")[0].strip()}/ >> xpath=ancestor::div >> input[type="checkbox"]',
                # Generic approach - find all checkboxes and match by nearby text
                f'input[type="checkbox"]:near(:text("{faculty}"))',
            ]
            
            clicked = False
            for selector in selectors:
                try:
                    checkbox = await self.page.wait_for_selector(selector, timeout=5000)
                    if checkbox:
                        await checkbox.click()
                        logger.info(f"Clicked program checkbox using selector: {selector}")
                        clicked = True
                        break
                except Exception as e:
                    logger.debug(f"Selector failed: {selector}, error: {str(e)}")
                    continue
            
            if not clicked:
                # Fallback: Get all checkboxes and find the right one by examining nearby text
                logger.info("Trying fallback method: examining all checkboxes")
                checkboxes = await self.page.query_selector_all('input[type="checkbox"]')
                
                for checkbox in checkboxes:
                    try:
                        # Get parent element and check if it contains the program name
                        parent = await checkbox.evaluate_handle('el => el.closest(".card, .program-card, div")')
                        parent_text = await parent.inner_text() if parent else ""
                        
                        if faculty in parent_text or faculty.split("(")[0].strip() in parent_text:
                            await checkbox.click()
                            logger.info(f"Clicked checkbox using fallback method")
                            clicked = True
                            break
                    except:
                        continue
            
            if not clicked:
                raise Exception(f"Could not find checkbox for program: {faculty}")
            
            # Wait for selection to register
            await asyncio.sleep(2)
            
            # Look for and click Apply/Continue/Next button
            apply_selectors = [
                'button:has-text("Apply")',
                'input[value="Apply"]',
                'a:has-text("Apply")',
                'button:has-text("Continue")',
                'button:has-text("Next")',
                'a.btn:has-text("Apply")'
            ]
            
            for selector in apply_selectors:
                try:
                    apply_btn = await self.page.wait_for_selector(selector, timeout=5000)
                    if apply_btn:
                        # Check if button is visible
                        is_visible = await apply_btn.is_visible()
                        if is_visible:
                            await apply_btn.click()
                            logger.info(f"Clicked Apply button using: {selector}")
                            break
                except:
                    continue
            
            # Wait for next page/section to load
            await asyncio.sleep(3)
            
            # Check if we're on a new page or if form appeared
            current_url = self.page.url
            logger.info(f"Current URL after selection: {current_url}")
            
            return {"success": True, "message": f"Selected program: {faculty}"}
            
        except Exception as e:
            logger.error(f"Faculty selection error: {str(e)}")
            await self._capture_error_screenshot("faculty_selection")
            return {"success": False, "message": f"Faculty selection failed: {str(e)}"}
    
    async def select_education_type(self, edu_type: str = "SSC/HSC") -> Dict:
        """
        Select education type (SSC/HSC, O-Level/A-Level, Diploma)
        """
        try:
            logger.info(f"Selecting education type: {edu_type}")
            
            # Click SSC/HSC button/radio
            selectors = [
                f'button:has-text("{edu_type}")',
                f'input[type="radio"][value="{edu_type}"]',
                f'text={edu_type}'
            ]
            
            for selector in selectors:
                try:
                    element = await self.page.wait_for_selector(selector, timeout=5000)
                    if element:
                        await element.click()
                        logger.info(f"Clicked {edu_type} using selector: {selector}")
                        break
                except:
                    continue
            
            # Wait for SSC Information section to appear
            await self.page.wait_for_selector('text=SSC Information', timeout=15000)
            await asyncio.sleep(3)  # Wait for form fields to load
            
            return {"success": True, "message": f"Selected education type: {edu_type}"}
            
        except Exception as e:
            logger.error(f"Education type selection error: {str(e)}")
            return {"success": False, "message": f"Education type selection failed: {str(e)}"}
    
    async def fill_ssc_information(self, ssc_data: Dict) -> Dict:
        """
        Fill SSC examination information
        """
        try:
            logger.info("Filling SSC information...")
            
            # SSC Examination dropdown
            await self._select_dropdown('ssc.*exam', ssc_data['ssc_examination'])
            
            # SSC Roll
            await self._fill_field('ssc.*roll', ssc_data['ssc_roll'])
            
            # SSC Registration
            await self._fill_field('ssc.*reg', ssc_data['ssc_registration'])
            
            # SSC Passing Year
            await self._select_dropdown('ssc.*year', str(ssc_data['ssc_passing_year']))
            
            # SSC Board
            await self._select_dropdown('ssc.*board', ssc_data['ssc_board'])
            
            await asyncio.sleep(2)
            
            return {"success": True, "message": "SSC information filled successfully"}
            
        except Exception as e:
            logger.error(f"SSC information error: {str(e)}")
            await self._capture_error_screenshot("ssc_information")
            return {"success": False, "message": f"SSC information failed: {str(e)}"}
    
    async def fill_hsc_information(self, hsc_data: Dict) -> Dict:
        """
        Fill HSC examination information
        """
        try:
            logger.info("Filling HSC information...")
            
            # HSC Examination dropdown
            await self._select_dropdown('hsc.*exam', hsc_data['hsc_examination'])
            
            # HSC Roll
            await self._fill_field('hsc.*roll', hsc_data['hsc_roll'])
            
            # HSC Registration
            await self._fill_field('hsc.*reg', hsc_data['hsc_registration'])
            
            # HSC Passing Year
            await self._select_dropdown('hsc.*year', str(hsc_data['hsc_passing_year']))
            
            # HSC Board
            await self._select_dropdown('hsc.*board', hsc_data['hsc_board'])
            
            await asyncio.sleep(2)
            
            # Click Verify Information button
            verify_selectors = [
                'button:has-text("Verify")',
                'button:has-text("Verify Information")',
                'input[value*="Verify"]'
            ]
            
            for selector in verify_selectors:
                try:
                    btn = await self.page.wait_for_selector(selector, timeout=5000)
                    if btn:
                        await btn.click()
                        logger.info("Clicked Verify Information button")
                        break
                except:
                    continue
            
            # Wait for verification (may take 10-30 seconds)
            logger.info("Waiting for education board verification...")
            await asyncio.sleep(15)  # Wait for verification API call
            
            # Check for verification success or personal info section
            await self.page.wait_for_selector('text=Personal Information', timeout=30000)
            
            return {"success": True, "message": "HSC information filled and verified"}
            
        except Exception as e:
            logger.error(f"HSC information error: {str(e)}")
            await self._capture_error_screenshot("hsc_information")
            return {"success": False, "message": f"HSC information failed: {str(e)}"}
    
    async def fill_personal_information(self, personal_data: Dict) -> Dict:
        """
        Fill personal information section
        """
        try:
            logger.info("Filling personal information...")
            
            # Candidate Name (may be pre-filled from verification)
            await self._fill_field('candidate.*name|name.*candidate', personal_data['candidate_name'])
            
            # Father's Name
            await self._fill_field('father.*name', personal_data['father_name'])
            
            # Mother's Name
            await self._fill_field('mother.*name', personal_data['mother_name'])
            
            # Date of Birth
            dob_str = personal_data['date_of_birth'].strftime('%Y-%m-%d')
            await self._fill_field('birth|dob', dob_str)
            
            # Gender
            await self._select_dropdown('gender', personal_data['gender'])
            
            # Nationality
            await self._select_dropdown('nationality', personal_data['nationality'])
            
            # Religion
            await self._select_dropdown('religion', personal_data['religion'])
            
            # Mobile Number
            await self._fill_field('mobile|phone', personal_data['mobile_number'])
            
            # Email
            await self._fill_field('email', personal_data['email'])
            
            # NID/Birth Certificate (if provided)
            if personal_data.get('nid_birth_cert'):
                await self._fill_field('nid|birth.*cert', personal_data['nid_birth_cert'])
            
            await asyncio.sleep(2)
            
            return {"success": True, "message": "Personal information filled successfully"}
            
        except Exception as e:
            logger.error(f"Personal information error: {str(e)}")
            await self._capture_error_screenshot("personal_information")
            return {"success": False, "message": f"Personal information failed: {str(e)}"}
    
    async def fill_present_address(self, address_data: Dict) -> Dict:
        """
        Fill present address with cascading dropdowns
        """
        try:
            logger.info("Filling present address...")
            
            # Division
            await self._select_dropdown('present.*division', address_data['present_division'])
            await asyncio.sleep(3)  # Wait for district dropdown to populate
            
            # District
            await self._select_dropdown('present.*district', address_data['present_district'])
            await asyncio.sleep(3)  # Wait for thana dropdown to populate
            
            # Thana/Upazila
            await self._fill_or_select('present.*thana|present.*upazila', address_data['present_thana'])
            
            # Post Office
            if address_data.get('present_post_office'):
                await self._fill_field('present.*post', address_data['present_post_office'])
            
            # Village/Road/House
            await self._fill_field('present.*village|present.*address', address_data['present_village'])
            
            # ZIP Code
            if address_data.get('present_zip'):
                await self._fill_field('present.*zip', address_data['present_zip'])
            
            await asyncio.sleep(2)
            
            return {"success": True, "message": "Present address filled successfully"}
            
        except Exception as e:
            logger.error(f"Present address error: {str(e)}")
            await self._capture_error_screenshot("present_address")
            return {"success": False, "message": f"Present address failed: {str(e)}"}
    
    async def fill_permanent_address(self, address_data: Dict, same_as_present: bool = False) -> Dict:
        """
        Fill permanent address or check "same as present"
        """
        try:
            logger.info("Filling permanent address...")
            
            if same_as_present:
                # Find and click "Same as Present Address" checkbox
                same_checkbox_selectors = [
                    'input[type="checkbox"]:near(text="Same as Present")',
                    'input[type="checkbox"]:near(text="same as present")',
                    'label:has-text("Same") >> input[type="checkbox"]'
                ]
                
                for selector in same_checkbox_selectors:
                    try:
                        checkbox = await self.page.wait_for_selector(selector, timeout=5000)
                        if checkbox:
                            await checkbox.click()
                            logger.info("Checked 'Same as Present Address'")
                            await asyncio.sleep(1)
                            return {"success": True, "message": "Permanent address set to same as present"}
                    except:
                        continue
            
            # Fill permanent address fields
            await self._select_dropdown('permanent.*division', address_data['permanent_division'])
            await asyncio.sleep(3)
            
            await self._select_dropdown('permanent.*district', address_data['permanent_district'])
            await asyncio.sleep(3)
            
            await self._fill_or_select('permanent.*thana|permanent.*upazila', address_data['permanent_thana'])
            
            if address_data.get('permanent_post_office'):
                await self._fill_field('permanent.*post', address_data['permanent_post_office'])
            
            await self._fill_field('permanent.*village|permanent.*address', address_data['permanent_village'])
            
            if address_data.get('permanent_zip'):
                await self._fill_field('permanent.*zip', address_data['permanent_zip'])
            
            await asyncio.sleep(2)
            
            return {"success": True, "message": "Permanent address filled successfully"}
            
        except Exception as e:
            logger.error(f"Permanent address error: {str(e)}")
            await self._capture_error_screenshot("permanent_address")
            return {"success": False, "message": f"Permanent address failed: {str(e)}"}
    
    async def upload_photo(self, photo_path: str) -> Dict:
        """
        Upload candidate photo (300x300px, max 100KB)
        """
        try:
            logger.info(f"Uploading photo: {photo_path}")
            
            # Find photo file input
            file_input_selectors = [
                'input[type="file"][name*="photo"]',
                'input[type="file"][accept*="image"]',
                'input[type="file"]'  # First file input
            ]
            
            for selector in file_input_selectors:
                try:
                    file_input = await self.page.wait_for_selector(selector, timeout=5000)
                    if file_input:
                        await file_input.set_input_files(photo_path)
                        logger.info(f"Photo uploaded using selector: {selector}")
                        await asyncio.sleep(2)  # Wait for preview
                        return {"success": True, "message": "Photo uploaded successfully"}
                except:
                    continue
            
            raise Exception("Could not find photo upload input")
            
        except Exception as e:
            logger.error(f"Photo upload error: {str(e)}")
            await self._capture_error_screenshot("photo_upload")
            return {"success": False, "message": f"Photo upload failed: {str(e)}"}
    
    async def upload_signature(self, signature_path: str) -> Dict:
        """
        Upload candidate signature (300x80px, max 60KB)
        """
        try:
            logger.info(f"Uploading signature: {signature_path}")
            
            # Find signature file input (usually second file input)
            file_input_selectors = [
                'input[type="file"][name*="signature"]',
                'input[type="file"][name*="sign"]',
            ]
            
            # Try specific selectors first
            for selector in file_input_selectors:
                try:
                    file_input = await self.page.wait_for_selector(selector, timeout=5000)
                    if file_input:
                        await file_input.set_input_files(signature_path)
                        logger.info(f"Signature uploaded using selector: {selector}")
                        await asyncio.sleep(2)
                        return {"success": True, "message": "Signature uploaded successfully"}
                except:
                    continue
            
            # Fallback: Get all file inputs and use second one
            all_file_inputs = await self.page.query_selector_all('input[type="file"]')
            if len(all_file_inputs) >= 2:
                await all_file_inputs[1].set_input_files(signature_path)
                logger.info("Signature uploaded using second file input")
                await asyncio.sleep(2)
                return {"success": True, "message": "Signature uploaded successfully"}
            
            raise Exception("Could not find signature upload input")
            
        except Exception as e:
            logger.error(f"Signature upload error: {str(e)}")
            await self._capture_error_screenshot("signature_upload")
            return {"success": False, "message": f"Signature upload failed: {str(e)}"}
    
    async def submit_application(self) -> Dict:
        """
        Submit the application form
        """
        try:
            logger.info("Submitting application...")
            
            # Find and click final submit/verify button
            submit_selectors = [
                'button:has-text("Verify Information")',
                'button:has-text("Submit")',
                'button[type="submit"]',
                'input[type="submit"]'
            ]
            
            for selector in submit_selectors:
                try:
                    submit_btn = await self.page.wait_for_selector(selector, timeout=5000)
                    if submit_btn:
                        await submit_btn.click()
                        logger.info(f"Clicked submit button: {selector}")
                        break
                except:
                    continue
            
            # Wait for submission processing
            await asyncio.sleep(5)
            
            # Wait for payment page or confirmation
            await self.page.wait_for_load_state('networkidle', timeout=30000)
            
            return {"success": True, "message": "Application submitted successfully"}
            
        except Exception as e:
            logger.error(f"Application submission error: {str(e)}")
            await self._capture_error_screenshot("application_submission")
            return {"success": False, "message": f"Application submission failed: {str(e)}"}
    
    async def get_payment_info(self) -> Dict:
        """
        Extract payment information from page
        """
        try:
            logger.info("Extracting payment information...")
            
            # Get current URL (may contain payment info)
            current_url = self.page.url
            
            # Try to extract payment amount from page
            payment_amount = None
            try:
                amount_text = await self.page.text_content('text=/BDT|Tk|Amount/')
                if amount_text:
                    import re
                    amount_match = re.search(r'(\d+(?:\.\d{2})?)', amount_text)
                    if amount_match:
                        payment_amount = float(amount_match.group(1))
            except:
                pass
            
            return {
                "success": True,
                "payment_required": True,
                "payment_url": current_url,
                "amount": payment_amount or 1000.00,  # Default BUP fee
                "message": "Payment information extracted"
            }
            
        except Exception as e:
            logger.error(f"Payment info error: {str(e)}")
            return {"success": False, "message": f"Payment info extraction failed: {str(e)}"}
    
    async def download_documents(self, application_id: str) -> Dict:
        """
        Download admission slip and receipt
        """
        try:
            logger.info("Downloading documents...")
            
            docs_dir = "./uploads/docs"
            os.makedirs(docs_dir, exist_ok=True)
            
            admission_slip_path = None
            receipt_path = None
            
            # Download admission slip
            download_selectors = [
                'a:has-text("Admission Slip")',
                'a:has-text("Download")',
                'button:has-text("Download")'
            ]
            
            for selector in download_selectors:
                try:
                    async with self.page.expect_download(timeout=30000) as download_info:
                        await self.page.click(selector, timeout=5000)
                    download = await download_info.value
                    admission_slip_path = os.path.join(docs_dir, f"{application_id}_admission_slip.pdf")
                    await download.save_as(admission_slip_path)
                    logger.info(f"Admission slip downloaded: {admission_slip_path}")
                    break
                except:
                    continue
            
            # Download receipt
            receipt_selectors = [
                'a:has-text("Receipt")',
                'a:has-text("Payment Receipt")'
            ]
            
            for selector in receipt_selectors:
                try:
                    async with self.page.expect_download(timeout=30000) as download_info:
                        await self.page.click(selector, timeout=5000)
                    download = await download_info.value
                    receipt_path = os.path.join(docs_dir, f"{application_id}_receipt.pdf")
                    await download.save_as(receipt_path)
                    logger.info(f"Receipt downloaded: {receipt_path}")
                    break
                except:
                    continue
            
            if admission_slip_path or receipt_path:
                return {
                    "success": True,
                    "admission_slip_path": admission_slip_path,
                    "receipt_path": receipt_path,
                    "message": "Documents downloaded"
                }
            else:
                return {
                    "success": False,
                    "message": "Could not find download links"
                }
            
        except Exception as e:
            logger.error(f"Document download error: {str(e)}")
            return {"success": False, "message": f"Document download failed: {str(e)}"}
    
    # Helper methods
    
    async def _fill_field(self, field_pattern: str, value: str):
        """Fill input field using regex pattern for name/id"""
        selectors = [
            f'input[name~="{field_pattern}" i]',
            f'input[id~="{field_pattern}" i]',
            f'input[placeholder*="{field_pattern.split(".*")[0]}" i]',
            f'textarea[name~="{field_pattern}" i]'
        ]
        
        for selector in selectors:
            try:
                element = await self.page.wait_for_selector(selector, timeout=3000)
                if element:
                    await element.fill(str(value))
                    logger.debug(f"Filled field {field_pattern} using {selector}")
                    return
            except:
                continue
        
        raise Exception(f"Could not find field matching pattern: {field_pattern}")
    
    async def _select_dropdown(self, field_pattern: str, value: str):
        """Select dropdown option using regex pattern"""
        selectors = [
            f'select[name~="{field_pattern}" i]',
            f'select[id~="{field_pattern}" i]'
        ]
        
        for selector in selectors:
            try:
                element = await self.page.wait_for_selector(selector, timeout=3000)
                if element:
                    await element.select_option(label=value)
                    logger.debug(f"Selected {value} in dropdown {field_pattern}")
                    return
            except:
                try:
                    # Try by value
                    await element.select_option(value=value)
                    return
                except:
                    continue
        
        raise Exception(f"Could not find dropdown matching pattern: {field_pattern}")
    
    async def _fill_or_select(self, field_pattern: str, value: str):
        """Try to fill as input or select as dropdown"""
        try:
            await self._fill_field(field_pattern, value)
        except:
            try:
                await self._select_dropdown(field_pattern, value)
            except:
                raise Exception(f"Could not fill or select field: {field_pattern}")
    
    async def _capture_error_screenshot(self, stage: str):
        """Capture screenshot on error"""
        try:
            screenshot_path = f"./uploads/logs/bup_error_{stage}_{int(asyncio.get_event_loop().time())}.png"
            await self.page.screenshot(path=screenshot_path, full_page=True)
            logger.info(f"Error screenshot saved: {screenshot_path}")
            return screenshot_path
        except:
            return None
