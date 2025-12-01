# BUP Admission Automation - Complete Guide

## Overview

The BUP (Bangladesh University of Professionals) admission automation has been completely rewritten based on actual form inspection. All field IDs, selectors, and dropdown values are now accurate and match the real BUP admission website.

## Key Improvements

### 1. **Accurate Field IDs**
All form fields now use the correct ASP.NET control IDs:
- SSC Exam: `MainContent_ddlSSCExam`
- SSC Roll: `MainContent_txtSSCRoll`
- SSC Registration: `MainContent_txtSSCReg`
- SSC Year: `MainContent_ddlSSCYear`
- SSC Board: `MainContent_ddlSSCBoard`
- HSC Exam: `MainContent_ddlHSCExam`
- HSC Roll: `MainContent_txtHSCRoll`
- And many more...

### 2. **Correct Dropdown Values**
Dropdown options now use the actual values from the BUP website:

**Exam Types:**
- SSC → `'ssc'`
- HSC → `'hsc'`
- O-Level → `'olevel'`
- A-Level → `'alevel'`

**Boards:**
- Dhaka → `'2'`
- Rajshahi → `'3'`
- Comilla → `'4'`
- Jessore → `'5'`
- **Chittagong/Chattagram → `'6'`**
- Barisal → `'7'`
- Sylhet → `'8'`
- Dinajpur → `'9'`
- Mymensingh → `'16'`

**Divisions:**
- Dhaka → `'Dhaka'`
- **Chattagram/Chittagong → `'Chittagong'`**
- Rajshahi → `'Rajshahi'`
- Khulna → `'Khulna'`
- Barisal → `'Barisal'`
- Sylhet → `'Sylhet'`
- Rangpur → `'Rangpur'`
- Mymensingh → `'Mymensingh'`

### 3. **Proper Form Flow**
The automation now follows the exact BUP form flow:
1. Navigate to admission page
2. Select faculty/program
3. Click Apply button
4. Select education type (SSC/HSC)
5. Fill SSC information
6. Fill HSC information
7. Click "Verify Information" (triggers board verification API)
8. Wait for verification (10-30 seconds)
9. Fill personal information
10. Fill present address (cascading dropdowns)
11. Handle permanent address (same as present or fill separately)
12. Upload photo
13. Upload signature
14. Submit application
15. Get payment information

## Test Student Data

The automation has been tested with the following student data:

```python
{
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
    'date_of_birth': '2006-10-10',
    'gender': 'MALE',
    'nationality': 'Bangladeshi',
    'religion': 'ISLAM',
    
    # Contact
    'mobile_number': '01614742727',
    'email': 'jamilahmediiuc@gmail.com',
    
    # Address
    'present_division': 'CHATTAGRAM',
    'present_district': 'CHATTAGRAM',
    'present_thana': 'PORT',
    'present_village': 'CHATTAGRAM',
    'present_zip': '3321',
    'same_as_present': True
}
```

## Running the Test

To test the BUP automation:

```bash
cd backend
source venv/bin/activate
python test_bup_automation.py
```

The test script will:
- Initialize the browser (visible mode for debugging)
- Navigate through the entire BUP admission form
- Fill all fields with the test student data
- Upload photo and signature
- Submit the application
- Display payment information
- Keep the browser open for 60 seconds for manual inspection

## Files Modified

1. **`bup_rpa.py`** - Complete rewrite with accurate selectors
2. **`test_bup_automation.py`** - New test script with sample data

## Integration with Backend

The BUP automation is already integrated into the backend:
- API endpoint: `POST /api/bup/apply`
- Background task: `bup_tasks.py`
- Database models: `bup_models.py`
- Schemas: `bup_schemas.py`
- CRUD operations: `bup_crud.py`

## Important Notes

1. **Verification Wait Time**: After clicking "Verify Information", the system waits 15 seconds for the education board verification API to complete. This may need adjustment based on actual response times.

2. **Cascading Dropdowns**: Division, District, and Thana dropdowns are cascading. The automation waits 3 seconds after each selection to allow the next dropdown to populate.

3. **Photo/Signature Requirements**:
   - Photo: 300x300px, max 100KB
   - Signature: 300x80px, max 60KB
   - Files are processed by `bup_photo_utils.py`

4. **Same as Present Address**: The automation can handle both scenarios:
   - Checking "Same as Present Address" checkbox
   - Filling permanent address fields separately

## Browser Inspection Screenshots

The following screenshots were captured during form inspection:

- Faculty selection page
- Education type selection
- SSC/HSC information form
- Personal information section
- Address sections
- Photo/signature upload

These are available in the artifacts directory for reference.

## Next Steps

1. Test the automation with real BUP website
2. Adjust wait times if needed
3. Handle any edge cases or validation errors
4. Integrate payment flow
5. Test document download functionality

## Troubleshooting

If the automation fails:

1. Check the error screenshots in `./uploads/logs/`
2. Verify field IDs haven't changed on the BUP website
3. Check dropdown values match the current options
4. Ensure photo/signature files exist and meet requirements
5. Verify network connectivity and page load times
