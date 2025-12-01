"""
CAPTCHA Handling for BUP Admission Automation

This module provides methods to detect and handle CAPTCHA challenges
during the BUP admission process.
"""

import asyncio
import logging
from typing import Dict, Optional
from playwright.async_api import Page

logger = logging.getLogger(__name__)


async def detect_captcha(page: Page) -> Dict:
    """
    Detect if CAPTCHA is present on the current page
    
    Returns:
        Dict with 'present' (bool) and 'type' (str) keys
    """
    try:
        logger.info("Checking for CAPTCHA...")
        
        # Common CAPTCHA selectors
        captcha_selectors = [
            'img[src*="captcha"]',
            'img[src*="Captcha"]',
            'img[src*="CAPTCHA"]',
            'input[name*="captcha"]',
            'input[id*="captcha"]',
            'input[id*="Captcha"]',
            'div:has-text("Enter the code")',
            'div:has-text("Enter code")',
            'div:has-text("Captcha")',
            'canvas',  # For canvas-based CAPTCHAs
            '.g-recaptcha',  # Google reCAPTCHA
            'iframe[src*="recaptcha"]',  # reCAPTCHA iframe
        ]
        
        for selector in captcha_selectors:
            try:
                element = await page.query_selector(selector)
                if element:
                    is_visible = await element.is_visible()
                    if is_visible:
                        logger.info(f"CAPTCHA detected using selector: {selector}")
                        
                        # Determine CAPTCHA type
                        captcha_type = "unknown"
                        if "recaptcha" in selector.lower():
                            captcha_type = "recaptcha"
                        elif "canvas" in selector:
                            captcha_type = "canvas"
                        elif "img" in selector:
                            captcha_type = "image"
                        else:
                            captcha_type = "text"
                        
                        return {
                            "present": True,
                            "type": captcha_type,
                            "selector": selector
                        }
            except:
                continue
        
        logger.info("No CAPTCHA detected")
        return {"present": False, "type": None, "selector": None}
        
    except Exception as e:
        logger.error(f"Error detecting CAPTCHA: {str(e)}")
        return {"present": False, "type": None, "selector": None}


async def wait_for_captcha_solution(page: Page, timeout: int = 300) -> Dict:
    """
    Wait for user to solve CAPTCHA manually
    
    Args:
        page: Playwright page object
        timeout: Maximum time to wait in seconds (default 5 minutes)
    
    Returns:
        Dict with 'success' and 'message' keys
    """
    try:
        logger.info(f"Waiting for user to solve CAPTCHA (timeout: {timeout}s)...")
        
        start_time = asyncio.get_event_loop().time()
        check_interval = 2  # Check every 2 seconds
        
        while True:
            # Check if timeout exceeded
            elapsed = asyncio.get_event_loop().time() - start_time
            if elapsed > timeout:
                return {
                    "success": False,
                    "message": f"CAPTCHA solution timeout after {timeout} seconds"
                }
            
            # Check if we've moved to the next page (Personal Info)
            # If the Name field is visible, we've passed the CAPTCHA
            try:
                if await page.is_visible('input#MainContent_txtName'):
                    logger.info("Personal Information page detected - CAPTCHA passed!")
                    return {
                        "success": True,
                        "message": "CAPTCHA solved successfully (Next page detected)"
                    }
            except:
                pass
            
            # Check if CAPTCHA is still present
            captcha_status = await detect_captcha(page)
            
            if not captcha_status["present"]:
                # Double check if we are really past it or just can't see it
                # Wait a bit and check for next page element again
                await asyncio.sleep(1)
                try:
                    if await page.is_visible('input#MainContent_txtName'):
                        logger.info("CAPTCHA solved and next page loaded")
                        return {
                            "success": True,
                            "message": "CAPTCHA solved successfully"
                        }
                except:
                    pass
                
                # If we can't see CAPTCHA but also can't see next page, 
                # we might be in transition or it's just hidden. 
                # Let's assume solved if it's gone for a few checks, but for now just continue loop
                # unless we are sure.
                # Actually, if CAPTCHA is gone, we should probably return success 
                # BUT the user reported infinite loop, so maybe detect_captcha is false positive/negative?
                # Let's rely on Next Page detection as the primary success indicator if possible.
                
                logger.info("CAPTCHA not detected, waiting for next page...")
            
            # Wait before next check
            await asyncio.sleep(check_interval)
            
    except Exception as e:
        logger.error(f"Error waiting for CAPTCHA solution: {str(e)}")
        return {
            "success": False,
            "message": f"Error waiting for CAPTCHA: {str(e)}"
        }


async def handle_captcha_if_present(page: Page, timeout: int = 300) -> Dict:
    """
    Detect and handle CAPTCHA if present
    
    This function:
    1. Detects if CAPTCHA is present
    2. If present, waits for user to solve it manually
    3. Returns success/failure status
    
    Args:
        page: Playwright page object
        timeout: Maximum time to wait for solution (default 5 minutes)
    
    Returns:
        Dict with 'captcha_present', 'success', and 'message' keys
    """
    try:
        # Detect CAPTCHA
        captcha_status = await detect_captcha(page)
        
        if not captcha_status["present"]:
            return {
                "captcha_present": False,
                "success": True,
                "message": "No CAPTCHA detected"
            }
        
        # CAPTCHA is present
        logger.warning(f"CAPTCHA detected: {captcha_status['type']}")
        
        # Wait for user to solve it
        solution_result = await wait_for_captcha_solution(page, timeout)
        
        return {
            "captcha_present": True,
            "captcha_type": captcha_status["type"],
            "success": solution_result["success"],
            "message": solution_result["message"]
        }
        
    except Exception as e:
        logger.error(f"Error handling CAPTCHA: {str(e)}")
        return {
            "captcha_present": False,
            "success": False,
            "message": f"Error handling CAPTCHA: {str(e)}"
        }
