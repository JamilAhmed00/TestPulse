# TestPulse Backend - DU Admission Automation

FastAPI backend that automates University of Dhaka admission applications using Playwright RPA.

## Features

- ✅ Complete DU admission automation (login, form fill, photo upload, OTP, payment, documents)
- ✅ Photo processing (resize/compress to DU requirements: 460-480x600-620px, 30-200KB)
- ✅ SSLCommerz sandbox payment integration
- ✅ OTP pause/resume functionality
- ✅ Background job management
- ✅ Document download (receipt & admit card)
- ✅ SQLite database with SQLAlchemy ORM
- ✅ RESTful API with FastAPI

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Install Playwright Browsers

```bash
playwright install chromium
```

### 3. Configure Environment

The `.env.example` file is provided. Default sandbox credentials are already configured in `config.py`.

### 4. Run the Server

```bash
uvicorn main:app --reload
```

The server will start at `http://localhost:8000`

- API Documentation: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc

## API Endpoints

### POST `/api/uni/apply`
Create new DU application with student data and photo (multipart/form-data)

### POST `/api/uni/start-automation`
Start RPA automation for an application

### GET `/api/uni/status/{application_id}`
Get current automation status and stage

### POST `/api/uni/submit-otp`
Submit OTP to resume automation

### GET `/api/uni/get-payment-url`
Get SSLCommerz payment redirect URL

### POST `/api/uni/payment/callback`
Handle payment callback from SSLCommerz

### GET `/api/uni/documents/{application_id}`
Get document URLs (receipt & admit card)

## Directory Structure

```
backend/
├── main.py                 # FastAPI app with all endpoints
├── config.py              # Configuration management
├── database.py            # SQLAlchemy setup
├── models.py              # Database models
├── schemas.py             # Pydantic schemas
├── crud.py                # Database operations
├── rpa.py                 # Playwright automation engine
├── tasks.py               # Background job management
├── photo_utils.py         # Photo processing with Pillow
├── ssl_commerz.py         # Payment integration
├── utils.py               # Helper functions
├── requirements.txt       # Python dependencies
└── uploads/
    ├── photos/            # Processed student photos
    ├── docs/              # Downloaded documents
    └── logs/              # Application logs
```

## Automation Flow

1. **Create Application** → Student submits form with photo
2. **Start Automation** → Backend logs into DU portal
3. **Fill Form** → Automated form filling with student data
4. **Upload Photo** → Processed photo uploaded
5. **Submit & OTP** → Form submitted, OTP sent to student's phone
6. **Wait for OTP** → Automation pauses, user enters OTP via frontend
7. **Verify OTP** → Automation resumes, OTP verified
8. **Payment** → User completes payment via SSLCommerz
9. **Download Documents** → Receipt & admit card downloaded
10. **Complete** → Application marked as completed

## Database Schema

### UniApplication
- Student credentials (HSC/SSC)
- Personal details
- Contact information
- Address
- Photo path
- Payment status
- Job status & stage
- Document paths

### UniDocument
- Application reference
- Document type (receipt/admit_card)
- File path

## Notes

- **DU-Specific**: Only automates University of Dhaka
- **OTP Manual**: User must enter OTP from their phone
- **Sandbox Payment**: Uses SSLCommerz sandbox mode
- **Headless Browser**: Playwright runs in headless mode
- **Error Handling**: Screenshots saved on automation errors

## Development

### Run with auto-reload
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### View logs
```bash
tail -f uploads/logs/app_*.log
```

### Database
SQLite database file: `du_admission.db` (auto-created on first run)

## Production Deployment

1. Update SSLCommerz credentials in config
2. Set proper CORS origins
3. Use production database (PostgreSQL recommended)
4. Configure proper logging
5. Use process manager (PM2, systemd, etc.)
6. Set up reverse proxy (nginx)
7. Enable HTTPS

## Troubleshooting

**Browser not found**: Run `playwright install chromium`

**Photo processing fails**: Check image format (JPEG only) and size

**Automation fails**: Check DU website selectors (may need updates)

**Payment fails**: Verify SSLCommerz credentials and callback URLs
