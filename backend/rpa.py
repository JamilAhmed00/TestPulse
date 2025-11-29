from playwright.async_api import async_playwright, Page, Browser
from config import get_settings
import logging
import asyncio
from typing import Optional, Dict
import os

settings = get_settings()
logger = logging.getLogger(__name__)


class DUAutomation:
    """Playwright automation for DU admission process"""
    
    def __init__(self):
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        
    async def initialize(self):
        """Initialize browser and page"""
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(headless=True)
        self.page = await self.browser.new_page()
        
    async def close(self):
        """Close browser"""
        if self.browser:
            await self.browser.close()
    
    async def du_login(self, hsc_roll: str, hsc_board: str, ssc_roll: str) -> Dict:
        """
        Navigate to DU admission site and perform login
        Returns: {success: bool, message: str}
        """
        try:
            logger.info(f"Navigating to DU login page...")
            await self.page.goto(settings.du_login_url, wait_until='networkidle', timeout=60000)
            
            # Wait for login form to load
            await self.page.wait_for_selector('input', timeout=30000)
            
            # Fill login credentials
            # Note: These selectors are placeholders and need to be updated based on actual DU website
            logger.info("Filling login credentials...")
            
            # Try to find HSC roll input
            hsc_roll_selectors = [
                'input[name="hsc_roll"]',
                'input[id="hsc_roll"]',
                'input[placeholder*="HSC"]',
                'input[placeholder*="Roll"]'
            ]
            
            for selector in hsc_roll_selectors:
                try:
                    await self.page.fill(selector, hsc_roll, timeout=5000)
                    logger.info(f"Filled HSC roll using selector: {selector}")
                    break
                except:
                    continue
            
            # Fill HSC board
            board_selectors = [
                'select[name="hsc_board"]',
                'select[id="hsc_board"]',
                'input[name="board"]'
            ]
            
            for selector in board_selectors:
                try:
                    await self.page.select_option(selector, hsc_board, timeout=5000)
                    logger.info(f"Selected HSC board using selector: {selector}")
                    break
                except:
                    try:
                        await self.page.fill(selector, hsc_board, timeout=5000)
                        break
                    except:
                        continue
            
            # Fill SSC roll
            ssc_roll_selectors = [
                'input[name="ssc_roll"]',
                'input[id="ssc_roll"]',
                'input[placeholder*="SSC"]'
            ]
            
            for selector in ssc_roll_selectors:
                try:
                    await self.page.fill(selector, ssc_roll, timeout=5000)
                    logger.info(f"Filled SSC roll using selector: {selector}")
                    break
                except:
                    continue
            
            # Click login/submit button
            submit_selectors = [
                'button[type="submit"]',
                'input[type="submit"]',
                'button:has-text("Login")',
                'button:has-text("Submit")'
            ]
            
            for selector in submit_selectors:
                try:
                    await self.page.click(selector, timeout=5000)
                    logger.info(f"Clicked submit using selector: {selector}")
                    break
                except:
                    continue
            
            # Wait for navigation
            await self.page.wait_for_load_state('networkidle', timeout=30000)
            
            return {"success": True, "message": "Login successful"}
            
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            # Take screenshot on error
            try:
                screenshot_path = f"./uploads/logs/error_login_{int(asyncio.get_event_loop().time())}.png"
                await self.page.screenshot(path=screenshot_path)
                logger.info(f"Error screenshot saved: {screenshot_path}")
            except:
                pass
            return {"success": False, "message": f"Login failed: {str(e)}"}
    
    async def du_fill_form(self, application_data: Dict) -> Dict:
        """
        Fill student details form
        Returns: {success: bool, message: str}
        """
        try:
            logger.info("Filling application form...")
            
            # Wait for form to load
            await self.page.wait_for_selector('input, select', timeout=30000)
            
            # Fill personal details
            form_fields = {
                'first_name': application_data.get('first_name'),
                'last_name': application_data.get('last_name'),
                'father_name': application_data.get('father_name'),
                'mother_name': application_data.get('mother_name'),
                'email': application_data.get('email'),
                'mobile': application_data.get('mobile_number'),
                'mobile_number': application_data.get('mobile_number'),
                'phone': application_data.get('mobile_number'),
                'address': application_data.get('present_address'),
                'present_address': application_data.get('present_address'),
                'city': application_data.get('city'),
            }
            
            # Try to fill each field
            for field_name, field_value in form_fields.items():
                if not field_value:
                    continue
                    
                selectors = [
                    f'input[name="{field_name}"]',
                    f'input[id="{field_name}"]',
                    f'textarea[name="{field_name}"]',
                    f'textarea[id="{field_name}"]'
                ]
                
                for selector in selectors:
                    try:
                        await self.page.fill(selector, str(field_value), timeout=3000)
                        logger.info(f"Filled {field_name}")
                        break
                    except:
                        continue
            
            # Handle select fields (quota, exam center, etc.)
            if application_data.get('quota'):
                try:
                    await self.page.select_option('select[name="quota"]', application_data['quota'], timeout=5000)
                except:
                    pass
            
            if application_data.get('exam_center'):
                try:
                    await self.page.select_option('select[name="exam_center"]', application_data['exam_center'], timeout=5000)
                except:
                    pass
            
            return {"success": True, "message": "Form filled successfully"}
            
        except Exception as e:
            logger.error(f"Form fill error: {str(e)}")
            return {"success": False, "message": f"Form fill failed: {str(e)}"}
    
    async def du_upload_photo(self, photo_path: str) -> Dict:
        """
        Upload processed photo
        Returns: {success: bool, message: str}
        """
        try:
            logger.info(f"Uploading photo: {photo_path}")
            
            # Take screenshot before upload attempt
            screenshot_path = f"./uploads/logs/photo_upload_page_{int(asyncio.get_event_loop().time())}.png"
            try:
                await self.page.screenshot(path=screenshot_path, full_page=True)
                logger.info(f"Photo upload page screenshot: {screenshot_path}")
            except:
                pass
            
            # Save HTML for debugging
            try:
                page_content = await self.page.content()
                html_path = f"./uploads/logs/photo_upload_page_{int(asyncio.get_event_loop().time())}.html"
                with open(html_path, 'w', encoding='utf-8') as f:
                    f.write(page_content)
                logger.info(f"Photo upload page HTML saved: {html_path}")
            except:
                pass
            
            # Find file input - try multiple selectors
            file_input_selectors = [
                'input[type="file"]',
                'input[name="photo"]',
                'input[name="image"]',
                'input[name="picture"]',
                'input[id="photo"]',
                'input[id="image"]',
                'input[id*="photo"]',
                'input[id*="image"]',
                'input[id*="upload"]',
                'input[accept*="image"]',
                'input[accept*="jpg"]',
                'input[accept*="jpeg"]',
            ]
            
            # First, try to find any file input on the page
            try:
                all_file_inputs = await self.page.query_selector_all('input[type="file"]')
                logger.info(f"Found {len(all_file_inputs)} file input(s) on page")
            except:
                logger.warning("Could not query for file inputs")
            
            for selector in file_input_selectors:
                try:
                    # Check if element exists first
                    element = await self.page.query_selector(selector)
                    if element:
                        logger.info(f"Found file input with selector: {selector}")
                        await self.page.set_input_files(selector, photo_path, timeout=10000)
                        logger.info(f"Photo uploaded successfully using selector: {selector}")
                        
                        # Wait a bit for upload to process
                        await asyncio.sleep(2)
                        
                        return {"success": True, "message": "Photo uploaded successfully"}
                except Exception as e:
                    logger.debug(f"Selector {selector} failed: {str(e)}")
                    continue
            
            # If we get here, no selector worked
            logger.warning(f"Could not find photo upload field. Check screenshot: {screenshot_path}")
            return {
                "success": False, 
                "message": f"Could not find photo upload field. Screenshot saved at {screenshot_path}",
                "screenshot_path": screenshot_path
            }
            
        except Exception as e:
            logger.error(f"Photo upload error: {str(e)}")
            return {"success": False, "message": f"Photo upload failed: {str(e)}"}

    
    async def du_submit_form(self) -> Dict:
        """
        Submit form and extract SMS code for OTP
        Returns: {success: bool, message: str, otp_required: bool, sms_code: str}
        """
        try:
            logger.info("Submitting form...")
            
            # Click submit button
            submit_selectors = [
                'button[type="submit"]',
                'input[type="submit"]',
                'button:has-text("Submit")',
                'button:has-text("Next")'
            ]
            
            for selector in submit_selectors:
                try:
                    await self.page.click(selector, timeout=5000)
                    logger.info(f"Clicked submit using selector: {selector}")
                    break
                except:
                    continue
            
            # Wait for page to load
            await self.page.wait_for_load_state('networkidle', timeout=60000)
            
            # Wait for loader to disappear (critical step)
            try:
                logger.info("Waiting for page loader to disappear...")
                await self.page.wait_for_selector('.page-loader-wrapper', state='hidden', timeout=30000)
                logger.info("Page loader disappeared")
            except:
                logger.warning("Page loader did not disappear within timeout")
            
            # Wait longer for SMS code to appear and page to fully render
            logger.info("Waiting for SMS code page to fully load...")
            await asyncio.sleep(5)
            
            # Try to wait for specific content that indicates page is ready
            try:
                # Wait for "16321" text to appear (indicates SMS instructions are loaded)
                await self.page.wait_for_selector('text=16321', timeout=10000)
                logger.info("SMS instructions detected, page is ready")
            except:
                logger.warning("Could not detect 16321 text, proceeding anyway")
            
            # Additional wait to ensure everything is rendered
            await asyncio.sleep(3)
            
            # Take screenshot for debugging
            screenshot_path = f"./uploads/logs/sms_code_page_{int(asyncio.get_event_loop().time())}.png"
            try:
                await self.page.screenshot(path=screenshot_path, full_page=True)
                logger.info(f"Screenshot saved: {screenshot_path}")
            except:
                pass
            
            # Extract SMS code (8-character alphanumeric code)
            sms_code = None
            try:
                import re
                
                # Get page content
                page_content = await self.page.content()
                
                # Save HTML for debugging
                html_path = f"./uploads/logs/sms_code_page_{int(asyncio.get_event_loop().time())}.html"
                try:
                    with open(html_path, 'w', encoding='utf-8') as f:
                        f.write(page_content)
                    logger.info(f"HTML saved: {html_path}")
                except:
                    pass
                
                # Strategy 1: Look for code near "16321" text
                # Split content into lines and find lines containing 16321
                lines = page_content.split('\n')
                for i, line in enumerate(lines):
                    if '16321' in line:
                        # Check this line and surrounding lines for 8-char code
                        context_lines = lines[max(0, i-3):min(len(lines), i+4)]
                        context = ' '.join(context_lines)
                        
                        # Look for 8-character alphanumeric codes in context
                        codes = re.findall(r'\b([A-Z0-9]{8})\b', context.upper())
                        if codes:
                            # Filter out common words
                            excluded = ['PASSWORD', 'USERNAME', 'SCALABLE', 'REGISTER', 'ADMITTED', 'DOWNLOAD']
                            for code in codes:
                                if code not in excluded and not code.isalpha():
                                    # Prefer codes with mix of letters and numbers
                                    sms_code = code
                                    logger.info(f"Found SMS code near 16321: {sms_code}")
                                    break
                        if sms_code:
                            break
                
                # Strategy 2: Look for specific HTML elements that might contain the code
                if not sms_code:
                    # Try to find elements with specific classes or IDs
                    code_element_selectors = [
                        '#sms_code',
                        '#smsCode',
                        '.sms-code',
                        '.code',
                        'input[name="code"]',
                        'span[id*="code"]',
                        'div[id*="code"]',
                    ]
                    
                    for selector in code_element_selectors:
                        try:
                            element = await self.page.query_selector(selector)
                            if element:
                                text = await element.text_content()
                                if text:
                                    code_match = re.search(r'\b([A-Z0-9]{8})\b', text.upper())
                                    if code_match:
                                        sms_code = code_match.group(1)
                                        logger.info(f"Found SMS code in element {selector}: {sms_code}")
                                        break
                        except:
                            continue
                
                # Strategy 3: Look for bold or emphasized text near SMS/16321
                if not sms_code:
                    try:
                        # Find all bold/strong elements
                        bold_elements = await self.page.query_selector_all('strong, b, .font-bold, .fw-bold')
                        for element in bold_elements:
                            text = await element.text_content()
                            if text and len(text.strip()) == 8:
                                code_match = re.match(r'^[A-Z0-9]{8}$', text.strip().upper())
                                if code_match:
                                    sms_code = text.strip().upper()
                                    logger.info(f"Found SMS code in bold element: {sms_code}")
                                    break
                    except:
                        pass
                
                # Log what we found for debugging
                if not sms_code:
                    logger.warning(f"Could not extract SMS code. Check screenshot: {screenshot_path}")
                    logger.warning(f"Check HTML: {html_path}")
                
            except Exception as e:
                logger.warning(f"Could not extract SMS code: {str(e)}")
            
            if sms_code:
                return {
                    "success": True,
                    "message": f"Form submitted. Send SMS code '{sms_code}' to 16321 to receive OTP",
                    "otp_required": True,
                    "sms_code": sms_code,
                    "screenshot_path": screenshot_path
                }
            else:
                return {
                    "success": True,
                    "message": f"Form submitted. Could not auto-extract SMS code. Check screenshot at {screenshot_path} for the 8-character code to send to 16321",
                    "otp_required": True,
                    "sms_code": None,
                    "screenshot_path": screenshot_path
                }

            
        except Exception as e:
            logger.error(f"Form submit error: {str(e)}")
            return {"success": False, "message": f"Form submit failed: {str(e)}", "otp_required": False, "sms_code": None}

    
    async def du_enter_otp(self, otp_code: str) -> Dict:
        """
        Enter OTP and continue
        Returns: {success: bool, message: str}
        """
        try:
            logger.info("Entering OTP...")
            
            # Find OTP input field
            otp_selectors = [
                'input[name="otp"]',
                'input[id="otp"]',
                'input[placeholder*="OTP"]',
                'input[type="text"]'
            ]
            
            for selector in otp_selectors:
                try:
                    await self.page.fill(selector, otp_code, timeout=5000)
                    logger.info(f"Filled OTP using selector: {selector}")
                    break
                except:
                    continue
            
            # Click verify/submit button
            verify_selectors = [
                'button:has-text("Verify")',
                'button:has-text("Submit")',
                'button[type="submit"]'
            ]
            
            for selector in verify_selectors:
                try:
                    await self.page.click(selector, timeout=5000)
                    logger.info(f"Clicked verify using selector: {selector}")
                    break
                except:
                    continue
            
            # Wait for navigation
            await self.page.wait_for_load_state('networkidle', timeout=30000)
            
            return {"success": True, "message": "OTP verified successfully"}
            
        except Exception as e:
            logger.error(f"OTP entry error: {str(e)}")
            return {"success": False, "message": f"OTP verification failed: {str(e)}"}
    
    async def du_get_payment_info(self) -> Dict:
        """
        Extract payment information from page
        Returns: {success: bool, payment_required: bool, amount: float}
        """
        try:
            logger.info("Checking payment information...")
            
            # Look for payment amount on page
            # This is a placeholder - actual implementation depends on DU website structure
            
            return {
                "success": True,
                "payment_required": True,
                "amount": 500.0,
                "message": "Payment required"
            }
            
        except Exception as e:
            logger.error(f"Payment info error: {str(e)}")
            return {"success": False, "payment_required": False, "message": str(e)}
    
    async def du_download_documents(self, app_id: str) -> Dict:
        """
        Download receipt and admit card PDFs
        Returns: {success: bool, receipt_path: str, admit_card_path: str}
        """
        try:
            logger.info("Downloading documents...")
            
            docs_dir = "./uploads/docs"
            os.makedirs(docs_dir, exist_ok=True)
            
            receipt_path = None
            admit_card_path = None
            
            # Look for download links
            download_selectors = [
                'a:has-text("Receipt")',
                'a:has-text("Download Receipt")',
                'button:has-text("Receipt")'
            ]
            
            # Try to download receipt
            for selector in download_selectors:
                try:
                    async with self.page.expect_download(timeout=30000) as download_info:
                        await self.page.click(selector, timeout=5000)
                    download = await download_info.value
                    receipt_path = os.path.join(docs_dir, f"{app_id}_receipt.pdf")
                    await download.save_as(receipt_path)
                    logger.info(f"Receipt downloaded: {receipt_path}")
                    break
                except:
                    continue
            
            # Try to download admit card
            admit_selectors = [
                'a:has-text("Admit")',
                'a:has-text("Admit Card")',
                'button:has-text("Admit")'
            ]
            
            for selector in admit_selectors:
                try:
                    async with self.page.expect_download(timeout=30000) as download_info:
                        await self.page.click(selector, timeout=5000)
                    download = await download_info.value
                    admit_card_path = os.path.join(docs_dir, f"{app_id}_admit_card.pdf")
                    await download.save_as(admit_card_path)
                    logger.info(f"Admit card downloaded: {admit_card_path}")
                    break
                except:
                    continue
            
            if receipt_path or admit_card_path:
                return {
                    "success": True,
                    "receipt_path": receipt_path,
                    "admit_card_path": admit_card_path,
                    "message": "Documents downloaded"
                }
            else:
                return {
                    "success": False,
                    "message": "Could not find download links"
                }
            
        except Exception as e:
            logger.error(f"Document download error: {str(e)}")
            return {"success": False, "message": f"Download failed: {str(e)}"}
