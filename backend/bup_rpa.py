"""
BUP Admission RPA Automation - COMPLETE REWRITE
Playwright-based automation for Bangladesh University of Professionals admission
Based on actual form inspection and field analysis
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


# Field mapping based on actual BUP form inspection
BOARD_MAPPING = {
    'DHAKA': '2',
    'RAJSHAHI': '3',
    'COMILLA': '4',
    'JESSORE': '5',
    'CHITTAGONG': '6',
    'CHATTAGRAM': '6',  # Alternative spelling
    'BARISAL': '7',
    'SYLHET': '8',
    'DINAJPUR': '9',
    'MYMENSINGH': '16',
    'MADRASAH': '10',
    'TEC': '14',
    'DIBS(DHAKA)': '15',
    'CAMBRIDGE': '13',
    'EDEXEL': '12',
    'OTHER': '11'
}

EXAM_TYPE_MAPPING = {
    'SSC': 'ssc',
    'HSC': 'hsc',
    'O-LEVEL': 'olevel',
    'A-LEVEL': 'alevel'
}

DIVISION_MAPPING = {
    'DHAKA': 'Dhaka',
    'CHATTAGRAM': 'Chittagong',
    'CHITTAGONG': 'Chittagong',
    'RAJSHAHI': 'Rajshahi',
    'KHULNA': 'Khulna',
    'BARISAL': 'Barisal',
    'SYLHET': 'Sylhet',
    'RANGPUR': 'Rangpur',
    'MYMENSINGH': 'Mymensingh'
}


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
                headless=False,  # Run in visible mode for CAPTCHA solving
                args=['--no-sandbox', '--disable-setuid-sandbox']
            )
            self.page = await self.browser.new_page(
                viewport={'width': 1920, 'height': 1080},
                locale='en-BD',
                timezone_id='Asia/Dhaka'
            )
            logger.info("BUP automation browser initialized (visible mode for CAPTCHA)")
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
    
    async def navigate_and_select_faculty(self, faculty: str) -> Dict:
        """
        Navigate to BUP admission page and select faculty
        URL: https://admission.bup.edu.bd/Admission/Candidate/SelectProgramV3?ecat=4
        """
        try:
            logger.info(f"Navigating to BUP admission page and selecting: {faculty}")
            await self.page.goto(
                'https://admission.bup.edu.bd/Admission/Candidate/SelectProgramV3?ecat=4',
                wait_until='networkidle',
                timeout=60000
            )
            
            # Wait for page to load
            await self.page.wait_for_selector('input[type="checkbox"]', timeout=15000)
            await asyncio.sleep(2)
            
            # Find the program by text and click its checkbox
            # Programs are in a table with checkboxes having IDs like MainContent_lvAdmSetup_CheckBox1_0, _1, _2, etc.
            program_found = False
            
            # Get all program name spans
            program_spans = await self.page.query_selector_all('span.fw-medium')
            
            for i, span in enumerate(program_spans):
                span_text = await span.inner_text()
                logger.info(f"Program {i}: {span_text}")
                
                if faculty.lower() in span_text.lower():
                    # Click the checkbox for this program
                    checkbox_id = f'MainContent_lvAdmSetup_CheckBox1_{i}'
                    logger.info(f"Found program at index {i}, clicking checkbox: {checkbox_id}")
                    
                    # Click checkbox using JavaScript (more reliable)
                    await self.page.evaluate(f'document.getElementById("{checkbox_id}").click()')
                    await asyncio.sleep(2)
                    
                    # Wait for postback
                    await self.page.wait_for_load_state('networkidle', timeout=15000)
                    await asyncio.sleep(2)
                    
                    program_found = True
                    break
            
            if not program_found:
                raise Exception(f"Program not found: {faculty}")
            
            # Click Apply/Proceed button
            apply_btn = await self.page.wait_for_selector('input#MainContent_btnApply1', timeout=10000)
            await apply_btn.click()
            logger.info("Clicked Apply button")
            
            # Wait for next page
            await self.page.wait_for_load_state('networkidle', timeout=30000)
            await asyncio.sleep(3)
            
            # Log current URL for debugging
            current_url = self.page.url
            logger.info(f"Current URL after Apply: {current_url}")
            
            # Take screenshot for debugging
            await self._capture_screenshot("after_apply_button")
            
            return {"success": True, "message": f"Selected faculty: {faculty}"}
            
        except Exception as e:
            logger.error(f"Faculty selection error: {str(e)}")
            await self._capture_screenshot("faculty_selection_error")
            return {"success": False, "message": f"Faculty selection failed: {str(e)}"}
    
    async def select_education_type_ssc_hsc(self) -> Dict:
        """
        Select SSC/HSC education type on Purchase Form page
        """
        try:
            logger.info("Selecting SSC/HSC education type...")
            
            # Wait for the page to be fully loaded first
            await self.page.wait_for_load_state('networkidle', timeout=30000)
            await asyncio.sleep(2)
            
            # Click SSC/HSC button (MainContent_btnSSCHSC)
            logger.info("Looking for SSC/HSC button...")
            ssc_hsc_btn = await self.page.wait_for_selector('input#MainContent_btnSSCHSC', timeout=15000)
            
            if not ssc_hsc_btn:
                raise Exception("SSC/HSC button not found")
            
            # Check if button is visible
            is_visible = await ssc_hsc_btn.is_visible()
            logger.info(f"SSC/HSC button visible: {is_visible}")
            
            await ssc_hsc_btn.click()
            logger.info("Clicked SSC/HSC button")
            
            # Wait for the form to load - this may take time as it's loaded via AJAX
            logger.info("Waiting for SSC/HSC form to load...")
            await asyncio.sleep(8)  # Give time for AJAX to complete
            
            # Wait for any of the SSC form elements to appear
            try:
                # Try multiple selectors to see which one appears
                await self.page.wait_for_selector(
                    'select#MainContent_ddlSSCExam, input#MainContent_txtSSCRoll, div:has-text("SSC Information")',
                    timeout=30000
                )
                logger.info("SSC form elements detected")
            except Exception as e:
                logger.error(f"SSC form did not load: {str(e)}")
                # Take screenshot for debugging
                await self._capture_screenshot("ssc_form_not_loaded")
                
                # Check what's on the page
                page_content = await self.page.content()
                logger.info(f"Page content length: {len(page_content)}")
                
                # Try to find any form elements
                all_selects = await self.page.query_selector_all('select')
                logger.info(f"Found {len(all_selects)} select elements on page")
                
                all_inputs = await self.page.query_selector_all('input[type="text"]')
                logger.info(f"Found {len(all_inputs)} text input elements on page")
                
                raise Exception(f"SSC form elements did not appear after clicking button: {str(e)}")
            
            # Additional wait to ensure all form elements are ready
            await asyncio.sleep(3)
            
            return {"success": True, "message": "Selected SSC/HSC education type"}
            
        except Exception as e:
            logger.error(f"Education type selection error: {str(e)}")
            await self._capture_screenshot("education_type_error")
            return {"success": False, "message": f"Education type selection failed: {str(e)}"}

    
    async def fill_ssc_information(self, ssc_data: Dict) -> Dict:
        """
        Fill SSC examination information with correct field IDs
        """
        try:
            logger.info("Filling SSC information...")
            
            # SSC Examination dropdown (MainContent_ddlExamTypeSSC)
            exam_value = EXAM_TYPE_MAPPING.get(ssc_data['ssc_examination'].upper(), 'ssc')
            logger.info(f"Selecting SSC Exam: {exam_value}")
            
            try:
                await self.page.select_option('select#MainContent_ddlExamTypeSSC', value=exam_value)
            except Exception as select_err:
                logger.warning(f"Standard select failed, trying JS: {str(select_err)}")
                await self.page.evaluate(f'''
                    const select = document.getElementById('MainContent_ddlExamTypeSSC');
                    if (select) {{
                        select.value = '{exam_value}';
                        select.dispatchEvent(new Event('change', {{ bubbles: true }}));
                    }}
                ''')
            
            logger.info(f"Selected SSC Exam: {exam_value}")
            
            # Wait for postback/AJAX after exam selection
            logger.info("Waiting for form update after exam selection...")
            await asyncio.sleep(2)
            
            # SSC Roll (MainContent_txtRollSSC)
            logger.info("Filling SSC Roll...")
            await self.page.wait_for_selector('input#MainContent_txtRollSSC', state='visible', timeout=10000)
            await self.page.fill('input#MainContent_txtRollSSC', ssc_data['ssc_roll'])
            logger.info(f"Filled SSC Roll: {ssc_data['ssc_roll']}")
            
            # SSC Registration (MainContent_txtRegSSC)
            await self.page.fill('input#MainContent_txtRegSSC', ssc_data['ssc_registration'])
            logger.info(f"Filled SSC Registration: {ssc_data['ssc_registration']}")
            
            # SSC Passing Year (MainContent_ddlPassYearSSC)
            await self.page.select_option('select#MainContent_ddlPassYearSSC', value=str(ssc_data['ssc_passing_year']))
            logger.info(f"Selected SSC Year: {ssc_data['ssc_passing_year']}")
            await asyncio.sleep(1)
            
            # SSC Board (MainContent_ddlBoardSSC)
            board_value = BOARD_MAPPING.get(ssc_data['ssc_board'].upper(), '6')
            logger.info(f"Selecting SSC Board: {ssc_data['ssc_board']} (value: {board_value})")
            
            # Use JavaScript to select the board (more reliable for ASP.NET dropdowns)
            await self.page.evaluate(f'''
                const select = document.getElementById('MainContent_ddlBoardSSC');
                if (select) {{
                    select.value = '{board_value}';
                    select.dispatchEvent(new Event('change', {{ bubbles: true }}));
                }}
            ''')
            logger.info(f"Selected SSC Board: {ssc_data['ssc_board']} (value: {board_value})")
            await asyncio.sleep(2)
            
            return {"success": True, "message": "SSC information filled successfully"}
            
        except Exception as e:
            logger.error(f"SSC information error: {str(e)}")
            await self._capture_screenshot("ssc_info_error")
            return {"success": False, "message": f"SSC information failed: {str(e)}"}
    
    async def fill_hsc_information(self, hsc_data: Dict) -> Dict:
        """
        Fill HSC examination information with correct field IDs
        """
        try:
            logger.info("Filling HSC information...")
            
            # HSC Examination dropdown (MainContent_ddlExamTypeHSC)
            exam_value = EXAM_TYPE_MAPPING.get(hsc_data['hsc_examination'].upper(), 'hsc')
            logger.info(f"Selecting HSC Exam: {exam_value}")
            
            try:
                await self.page.select_option('select#MainContent_ddlExamTypeHSC', value=exam_value)
            except Exception as select_err:
                logger.warning(f"Standard select failed, trying JS: {str(select_err)}")
                await self.page.evaluate(f'''
                    const select = document.getElementById('MainContent_ddlExamTypeHSC');
                    if (select) {{
                        select.value = '{exam_value}';
                        select.dispatchEvent(new Event('change', {{ bubbles: true }}));
                    }}
                ''')
            
            logger.info(f"Selected HSC Exam: {exam_value}")
            
            # Wait for postback/AJAX after exam selection
            logger.info("Waiting for form update after HSC exam selection...")
            await asyncio.sleep(2)
            
            # HSC Roll (MainContent_txtRollHSC)
            logger.info("Filling HSC Roll...")
            await self.page.wait_for_selector('input#MainContent_txtRollHSC', state='visible', timeout=10000)
            await self.page.fill('input#MainContent_txtRollHSC', hsc_data['hsc_roll'])
            logger.info(f"Filled HSC Roll: {hsc_data['hsc_roll']}")
            
            # HSC Registration (MainContent_txtRegHSC)
            await self.page.fill('input#MainContent_txtRegHSC', hsc_data['hsc_registration'])
            logger.info(f"Filled HSC Registration: {hsc_data['hsc_registration']}")
            
            # HSC Passing Year (MainContent_ddlPassYearHSC)
            await self.page.select_option('select#MainContent_ddlPassYearHSC', value=str(hsc_data['hsc_passing_year']))
            logger.info(f"Selected HSC Year: {hsc_data['hsc_passing_year']}")
            await asyncio.sleep(1)
            
            # HSC Board (MainContent_ddlBoardHSC)
            board_value = BOARD_MAPPING.get(hsc_data['hsc_board'].upper(), '6')
            logger.info(f"Selecting HSC Board: {hsc_data['hsc_board']} (value: {board_value})")
            
            # Use JavaScript to select the board (more reliable for ASP.NET dropdowns)
            await self.page.evaluate(f'''
                const select = document.getElementById('MainContent_ddlBoardHSC');
                if (select) {{
                    select.value = '{board_value}';
                    select.dispatchEvent(new Event('change', {{ bubbles: true }}));
                }}
            ''')
            logger.info(f"Selected HSC Board: {hsc_data['hsc_board']} (value: {board_value})")
            await asyncio.sleep(2)
            
            return {"success": True, "message": "HSC information filled successfully"}
            
        except Exception as e:
            logger.error(f"HSC information error: {str(e)}")
            await self._capture_screenshot("hsc_info_error")
            return {"success": False, "message": f"HSC information failed: {str(e)}"}
    
    async def click_verify_information(self) -> Dict:
        """
        Click Verify Information button to validate SSC/HSC data
        Also handles CAPTCHA if present
        """
        try:
            logger.info("Clicking Verify Information button...")
            
            # Click Verify Information button (MainContent_btnVerifyInformation)
            verify_btn = await self.page.wait_for_selector('input#MainContent_btnVerifyInformation', timeout=10000)
            await verify_btn.click()
            logger.info("Clicked Verify Information")
            
            # Wait for verification (this may take 10-30 seconds)
            logger.info("Waiting for education board verification...")
            await asyncio.sleep(15)
            
            # Check for CAPTCHA
            from bup_captcha import handle_captcha_if_present
            
            logger.info("Checking for CAPTCHA...")
            captcha_result = await handle_captcha_if_present(self.page, timeout=300)
            
            if captcha_result["captcha_present"]:
                logger.warning(f"CAPTCHA detected: {captcha_result.get('captcha_type', 'unknown')}")
                
                if not captcha_result["success"]:
                    return {
                        "success": False,
                        "captcha_required": True,
                        "message": f"CAPTCHA solution required: {captcha_result['message']}"
                    }
                
                logger.info("CAPTCHA solved successfully")
            
            # Wait for Personal Information section to appear
            try:
                await self.page.wait_for_selector('input#MainContent_txtCandidateName', timeout=30000)
                logger.info("Personal Information section loaded")
            except:
                logger.warning("Personal Information section not found, but continuing...")
            
            return {"success": True, "message": "Information verified successfully"}
            
        except Exception as e:
            logger.error(f"Verification error: {str(e)}")
            await self._capture_screenshot("verification_error")
            return {"success": False, "message": f"Verification failed: {str(e)}"}
    
    async def fill_personal_information(self, personal_data: Dict) -> Dict:
        """
        Fill personal information on the form
        """
        try:
            logger.info("Filling personal information...")
            
            # Wait for the Personal Information section to be fully visible
            await self.page.wait_for_selector('input#MainContent_txtName', state='visible', timeout=30000)
            
            # Name is usually pre-filled/disabled, but we can check it
            name_val = await self.page.input_value('input#MainContent_txtName')
            logger.info(f"Candidate Name (pre-filled): {name_val}")
            
            # Date of Birth (Split into Day, Month, Year)
            dob = personal_data['date_of_birth'] # Format: YYYY-MM-DD
            year, month, day = dob.split('-')
            
            # Day (MainContent_ddlDay)
            await self.page.select_option('select#MainContent_ddlDay', value=day)
            logger.info(f"Selected Day: {day}")
            await asyncio.sleep(0.5)
            
            # Month (MainContent_ddlMonth)
            await self.page.select_option('select#MainContent_ddlMonth', value=month)
            logger.info(f"Selected Month: {month}")
            await asyncio.sleep(0.5)
            
            # Year (MainContent_ddlYear)
            await self.page.select_option('select#MainContent_ddlYear', value=year)
            logger.info(f"Selected Year: {year}")
            await asyncio.sleep(1)
            
            # Email (MainContent_txtEmail)
            await self.page.fill('input#MainContent_txtEmail', personal_data['email'])
            logger.info(f"Filled Email: {personal_data['email']}")
            
            # Gender (MainContent_ddlGender)
            gender_val = '2' if personal_data['gender'].upper() == 'MALE' else '3'
            await self.page.select_option('select#MainContent_ddlGender', value=gender_val)
            logger.info(f"Selected Gender: {personal_data['gender']} (value: {gender_val})")
            
            # Mobile Number (MainContent_txtSmsMobile)
            await self.page.fill('input#MainContent_txtSmsMobile', personal_data['mobile_number'])
            logger.info(f"Filled Mobile: {personal_data['mobile_number']}")
            
            # Guardian Mobile (MainContent_txtGuardianMobile)
            # Use same mobile if guardian mobile not provided
            guardian_mobile = personal_data.get('guardian_mobile', personal_data['mobile_number'])
            await self.page.fill('input#MainContent_txtGuardianMobile', guardian_mobile)
            logger.info(f"Filled Guardian Mobile: {guardian_mobile}")
            
            # Nationality and Religion might be on this page or next, checking user HTML...
            # User HTML didn't show Nationality/Religion, assuming they might be pre-filled or on next page
            # But previous code had them. Let's keep them if they exist, but wrap in try-catch
            
            try:
                if await self.page.is_visible('select#MainContent_ddlNationality'):
                     await self.page.select_option('select#MainContent_ddlNationality', label='Bangladeshi')
            except:
                pass

            try:
                if await self.page.is_visible('select#MainContent_ddlReligion'):
                     religion_map = {'ISLAM': 'Islam', 'HINDU': 'Hinduism', 'CHRISTIAN': 'Christianity', 'BUDDHIST': 'Buddhism'}
                     rel_val = religion_map.get(personal_data['religion'].upper(), 'Islam')
                     # Try to select by label or value if known
                     # For now, just logging as user HTML didn't show this field
                     logger.info(f"Religion field check: {personal_data['religion']}")
            except:
                pass

            return {"success": True, "message": "Personal information filled"}
            
        except Exception as e:
            logger.error(f"Personal information error: {str(e)}")
            await self._capture_screenshot("personal_info_error")
            return {"success": False, "message": f"Personal information failed: {str(e)}"}
    
    async def fill_present_address(self, address_data: Dict) -> Dict:
        """
        Fill present address with cascading dropdowns
        """
        try:
            logger.info("Filling present address...")
            
            # Division (MainContent_ddlPresentDivision) - Use JavaScript
            division_label = DIVISION_MAPPING.get(address_data['present_division'].upper(), address_data['present_division'])
            await self.page.evaluate(f'''
                const select = document.getElementById('MainContent_ddlPresentDivision');
                if (select) {{
                    for (let option of select.options) {{
                        if (option.text.includes('{division_label}')) {{
                            select.value = option.value;
                            select.dispatchEvent(new Event('change', {{ bubbles: true }}));
                            break;
                        }}
                    }}
                }}
            ''')
            logger.info(f"Selected Present Division: {division_label}")
            await asyncio.sleep(4)  # Wait for district dropdown to populate
            
            # District (MainContent_ddlPresentDistrict) - Use JavaScript
            await self.page.evaluate(f'''
                const select = document.getElementById('MainContent_ddlPresentDistrict');
                if (select) {{
                    for (let option of select.options) {{
                        if (option.text.includes('{address_data['present_district']}')) {{
                            select.value = option.value;
                            select.dispatchEvent(new Event('change', {{ bubbles: true }}));
                            break;
                        }}
                    }}
                }}
            ''')
            logger.info(f"Selected Present District: {address_data['present_district']}")
            await asyncio.sleep(4)  # Wait for thana dropdown to populate
            
            # Thana/Upazila (MainContent_ddlPresentThana or text input)
            try:
                await self.page.evaluate(f'''
                    const select = document.getElementById('MainContent_ddlPresentThana');
                    if (select) {{
                        for (let option of select.options) {{
                            if (option.text.includes('{address_data['present_thana']}')) {{
                                select.value = option.value;
                                select.dispatchEvent(new Event('change', {{ bubbles: true }}));
                                break;
                            }}
                        }}
                    }}
                ''')
                logger.info(f"Selected Present Thana: {address_data['present_thana']}")
            except:
                # If dropdown doesn't exist, try text input
                await self.page.fill('input#MainContent_txtPresentThana', address_data['present_thana'])
                logger.info(f"Filled Present Thana: {address_data['present_thana']}")
            
            # Post Office (MainContent_txtPresentPostOffice) - optional
            if address_data.get('present_post_office'):
                await self.page.fill('input#MainContent_txtPresentPostOffice', address_data['present_post_office'])
                logger.info(f"Filled Present Post Office: {address_data['present_post_office']}")
            
            # Village/Road/House (MainContent_txtPresentVillage)
            await self.page.fill('input#MainContent_txtPresentVillage', address_data['present_village'])
            logger.info(f"Filled Present Village: {address_data['present_village']}")
            
            # ZIP Code (MainContent_txtPresentZIP) - optional
            if address_data.get('present_zip'):
                await self.page.fill('input#MainContent_txtPresentZIP', address_data['present_zip'])
                logger.info(f"Filled Present ZIP: {address_data['present_zip']}")
            
            await asyncio.sleep(2)
            
            return {"success": True, "message": "Present address filled successfully"}
            
        except Exception as e:
            logger.error(f"Present address error: {str(e)}")
            await self._capture_screenshot("present_address_error")
            return {"success": False, "message": f"Present address failed: {str(e)}"}
    
    async def handle_permanent_address(self, address_data: Dict, same_as_present: bool = False) -> Dict:
        """
        Fill permanent address or check \"same as present\"
        """
        try:
            logger.info("Handling permanent address...")
            
            if same_as_present:
                # Check \"Same as Present Address\" checkbox (MainContent_chkSameAsPresent or similar)
                try:
                    same_checkbox = await self.page.wait_for_selector('input[type="checkbox"][id*="Same"]', timeout=5000)
                    await same_checkbox.click()
                    logger.info("Checked 'Same as Present Address'")
                    await asyncio.sleep(1)
                    return {"success": True, "message": "Permanent address set to same as present"}
                except:
                    logger.warning("Same as present checkbox not found, filling permanent address manually")
            
            # Fill permanent address fields (similar to present address) - Use JavaScript
            division_label = DIVISION_MAPPING.get(address_data.get('permanent_division', address_data['present_division']).upper(), 
                                                   address_data.get('permanent_division', address_data['present_division']))
            await self.page.evaluate(f'''
                const select = document.getElementById('MainContent_ddlPermanentDivision');
                if (select) {{
                    for (let option of select.options) {{
                        if (option.text.includes('{division_label}')) {{
                            select.value = option.value;
                            select.dispatchEvent(new Event('change', {{ bubbles: true }}));
                            break;
                        }}
                    }}
                }}
            ''')
            logger.info(f"Selected Permanent Division: {division_label}")
            await asyncio.sleep(4)
            
            district_label = address_data.get('permanent_district', address_data['present_district'])
            await self.page.evaluate(f'''
                const select = document.getElementById('MainContent_ddlPermanentDistrict');
                if (select) {{
                    for (let option of select.options) {{
                        if (option.text.includes('{district_label}')) {{
                            select.value = option.value;
                            select.dispatchEvent(new Event('change', {{ bubbles: true }}));
                            break;
                        }}
                    }}
                }}
            ''')
            logger.info(f"Selected Permanent District: {district_label}")
            await asyncio.sleep(4)
            
            try:
                thana_label = address_data.get('permanent_thana', address_data['present_thana'])
                await self.page.evaluate(f'''
                    const select = document.getElementById('MainContent_ddlPermanentThana');
                    if (select) {{
                        for (let option of select.options) {{
                            if (option.text.includes('{thana_label}')) {{
                                select.value = option.value;
                                select.dispatchEvent(new Event('change', {{ bubbles: true }}));
                                break;
                            }}
                        }}
                    }}
                ''')
            except:
                await self.page.fill('input#MainContent_txtPermanentThana', 
                                    address_data.get('permanent_thana', address_data['present_thana']))
            
            if address_data.get('permanent_post_office') or address_data.get('present_post_office'):
                await self.page.fill('input#MainContent_txtPermanentPostOffice', 
                                    address_data.get('permanent_post_office', address_data.get('present_post_office', '')))
            
            await self.page.fill('input#MainContent_txtPermanentVillage', 
                                address_data.get('permanent_village', address_data['present_village']))
            
            if address_data.get('permanent_zip') or address_data.get('present_zip'):
                await self.page.fill('input#MainContent_txtPermanentZIP', 
                                    address_data.get('permanent_zip', address_data.get('present_zip', '')))
            
            await asyncio.sleep(2)
            
            return {"success": True, "message": "Permanent address filled successfully"}
            
        except Exception as e:
            logger.error(f"Permanent address error: {str(e)}")
            await self._capture_screenshot("permanent_address_error")
            return {"success": False, "message": f"Permanent address failed: {str(e)}"}
    
    async def upload_photo(self, photo_path: str) -> Dict:
        """
        Upload candidate photo
        """
        try:
            logger.info(f"Uploading photo: {photo_path}")
            
            # Find photo file input (MainContent_fuPhoto or first file input)
            file_input = await self.page.wait_for_selector('input[type="file"]', timeout=10000)
            await file_input.set_input_files(photo_path)
            logger.info("Photo uploaded successfully")
            await asyncio.sleep(3)  # Wait for preview
            
            return {"success": True, "message": "Photo uploaded successfully"}
            
        except Exception as e:
            logger.error(f"Photo upload error: {str(e)}")
            await self._capture_screenshot("photo_upload_error")
            return {"success": False, "message": f"Photo upload failed: {str(e)}"}
    
    async def upload_signature(self, signature_path: str) -> Dict:
        """
        Upload candidate signature
        """
        try:
            logger.info(f"Uploading signature: {signature_path}")
            
            # Find signature file input (usually second file input)
            all_file_inputs = await self.page.query_selector_all('input[type="file"]')
            if len(all_file_inputs) >= 2:
                await all_file_inputs[1].set_input_files(signature_path)
                logger.info("Signature uploaded successfully")
                await asyncio.sleep(3)
                return {"success": True, "message": "Signature uploaded successfully"}
            else:
                raise Exception("Signature upload input not found")
            
        except Exception as e:
            logger.error(f"Signature upload error: {str(e)}")
            await self._capture_screenshot("signature_upload_error")
            return {"success": False, "message": f"Signature upload failed: {str(e)}"}
    
    async def submit_application(self) -> Dict:
        """
        Submit the application form
        """
        try:
            logger.info("Submitting application...")
            
            # Find and click final submit button
            submit_btn = await self.page.wait_for_selector('input[type="submit"][value*="Submit"], button:has-text("Submit")', timeout=10000)
            await submit_btn.click()
            logger.info("Clicked submit button")
            
            # Wait for submission processing
            await asyncio.sleep(5)
            await self.page.wait_for_load_state('networkidle', timeout=30000)
            
            return {"success": True, "message": "Application submitted successfully"}
            
        except Exception as e:
            logger.error(f"Application submission error: {str(e)}")
            await self._capture_screenshot("submission_error")
            return {"success": False, "message": f"Application submission failed: {str(e)}"}
    
    async def get_payment_info(self) -> Dict:
        """
        Extract payment information from page
        """
        try:
            logger.info("Extracting payment information...")
            
            current_url = self.page.url
            
            # Try to extract payment amount
            payment_amount = 1000.00  # Default BUP fee
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
                "amount": payment_amount,
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
            try:
                async with self.page.expect_download(timeout=30000) as download_info:
                    await self.page.click('a:has-text("Admission Slip"), a:has-text("Download")', timeout=5000)
                download = await download_info.value
                admission_slip_path = os.path.join(docs_dir, f"{application_id}_admission_slip.pdf")
                await download.save_as(admission_slip_path)
                logger.info(f"Admission slip downloaded: {admission_slip_path}")
            except:
                logger.warning("Admission slip download failed")
            
            # Download receipt
            try:
                async with self.page.expect_download(timeout=30000) as download_info:
                    await self.page.click('a:has-text("Receipt")', timeout=5000)
                download = await download_info.value
                receipt_path = os.path.join(docs_dir, f"{application_id}_receipt.pdf")
                await download.save_as(receipt_path)
                logger.info(f"Receipt downloaded: {receipt_path}")
            except:
                logger.warning("Receipt download failed")
            
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
    
    async def _capture_screenshot(self, stage: str):
        """Capture screenshot on error"""
        try:
            screenshot_path = f"./uploads/logs/bup_error_{stage}_{int(asyncio.get_event_loop().time())}.png"
            await self.page.screenshot(path=screenshot_path, full_page=True)
            logger.info(f"Error screenshot saved: {screenshot_path}")
            return screenshot_path
        except:
            return None
