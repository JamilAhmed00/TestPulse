# CAPTCHA Handling in BUP Automation

## Overview

The BUP admission form includes a CAPTCHA challenge on page 3 (after clicking "Verify Information"). This document explains how the automation handles it.

## CAPTCHA Detection

The automation automatically detects CAPTCHA using multiple strategies:

```python
# Common CAPTCHA indicators
- img[src*="captcha"]
- input[name*="captcha"]
- div:has-text("Enter the code")
- canvas elements
- Google reCAPTCHA iframes
```

## Handling Strategy: Manual Solving

**Why Manual?**
- 100% reliable
- No risk of being blocked by BUP
- Legal and ethical
- Works with any CAPTCHA type
- No additional costs

**How It Works:**

1. **Automation Detects CAPTCHA**
   ```
   After clicking "Verify Information" → Wait 15s → Check for CAPTCHA
   ```

2. **Browser Stays Visible**
   - Browser runs in visible mode (`headless=False`)
   - User can see the CAPTCHA challenge

3. **Automation Pauses**
   - Waits up to 5 minutes (300 seconds) for user to solve
   - Checks every 2 seconds if CAPTCHA is still present

4. **User Solves CAPTCHA**
   - User manually enters the CAPTCHA code
   - User clicks submit/verify button

5. **Automation Resumes**
   - Once CAPTCHA disappears, automation continues
   - Proceeds to fill Personal Information

## Flow Diagram

```
Fill SSC Info → Fill HSC Info → Click "Verify Information"
                                        ↓
                                Wait 15 seconds
                                        ↓
                                Check for CAPTCHA
                                        ↓
                        ┌───────────────┴───────────────┐
                        ↓                               ↓
                  CAPTCHA Present                 No CAPTCHA
                        ↓                               ↓
              Pause Automation                   Continue to
              Wait for User                  Personal Information
              (max 5 minutes)
                        ↓
              User Solves CAPTCHA
                        ↓
              Automation Resumes
                        ↓
              Continue to Personal Information
```

## API Status Updates

When CAPTCHA is detected, the API status will show:

```json
{
  "job_status": "captcha_required",
  "current_stage": "verification",
  "stage_message": "CAPTCHA detected. Please solve the CAPTCHA in the browser window and wait for automation to continue.",
  "next_step": "Solve CAPTCHA manually in browser"
}
```

## User Instructions

When CAPTCHA appears:

1. **Look at the Browser Window**
   - A browser window will be visible on your screen
   - You'll see the BUP admission form with a CAPTCHA

2. **Solve the CAPTCHA**
   - Enter the CAPTCHA code in the input field
   - Click the verify/submit button

3. **Wait for Automation**
   - Don't close the browser
   - Automation will automatically detect when CAPTCHA is solved
   - It will continue filling the form

4. **Timeout**
   - If you don't solve within 5 minutes, automation will fail
   - You can restart the automation

## Technical Details

### CAPTCHA Detection Code

```python
from bup_captcha import detect_captcha, handle_captcha_if_present

# After clicking Verify Information
captcha_result = await handle_captcha_if_present(page, timeout=300)

if captcha_result["captcha_present"]:
    if not captcha_result["success"]:
        # CAPTCHA not solved in time
        return {"success": False, "captcha_required": True}
    # CAPTCHA solved, continue
```

### Wait Loop

```python
while True:
    # Check if CAPTCHA still present
    captcha_status = await detect_captcha(page)
    
    if not captcha_status["present"]:
        # CAPTCHA solved!
        break
    
    # Wait 2 seconds and check again
    await asyncio.sleep(2)
```

## Alternative Approaches (Not Implemented)

### 1. CAPTCHA Solving Services
- **Services**: 2Captcha, Anti-Captcha, DeathByCaptcha
- **Cost**: $1-3 per 1000 solves
- **Speed**: 20-60 seconds per solve
- **Reliability**: 85-95%
- **Issues**: 
  - May violate BUP terms of service
  - Additional cost
  - Not 100% reliable

### 2. OCR-based Solving
- **Method**: Use Tesseract OCR to read CAPTCHA
- **Reliability**: 30-60% for simple CAPTCHAs
- **Issues**:
  - Very unreliable
  - Doesn't work for complex CAPTCHAs
  - May get IP blocked

### 3. Machine Learning Models
- **Method**: Train custom model to solve CAPTCHAs
- **Complexity**: Very high
- **Issues**:
  - Requires large dataset
  - Time-consuming to train
  - May not work for new CAPTCHA types

## Troubleshooting

### CAPTCHA Not Detected
- Check browser window is visible
- Verify CAPTCHA selectors in `bup_captcha.py`
- Check logs for detection attempts

### Automation Doesn't Resume
- Ensure CAPTCHA is fully solved
- Check if submit button was clicked
- Verify page has loaded after CAPTCHA

### Timeout Errors
- Increase timeout in `handle_captcha_if_present(page, timeout=600)`
- Default is 300 seconds (5 minutes)

## Configuration

To change CAPTCHA timeout, edit `bup_rpa.py`:

```python
# In click_verify_information method
captcha_result = await handle_captcha_if_present(
    self.page, 
    timeout=600  # 10 minutes instead of 5
)
```

## Logs

CAPTCHA handling produces detailed logs:

```
INFO: Checking for CAPTCHA...
WARNING: CAPTCHA detected: image
INFO: Waiting for user to solve CAPTCHA (timeout: 300s)...
INFO: CAPTCHA appears to be solved!
INFO: CAPTCHA solved successfully
```

## Best Practices

1. **Keep Browser Visible**: Don't minimize or hide the browser window
2. **Solve Quickly**: Don't wait until timeout
3. **Don't Refresh**: Let automation handle page navigation
4. **Check Logs**: Monitor logs for CAPTCHA detection
5. **Test First**: Try with test data before real applications

## Future Enhancements

Possible improvements:
- Email/SMS notification when CAPTCHA appears
- Browser window auto-focus when CAPTCHA detected
- Audio alert when CAPTCHA appears
- Screenshot of CAPTCHA sent to user
- Integration with CAPTCHA solving services (optional)
