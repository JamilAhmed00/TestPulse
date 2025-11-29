#!/bin/bash

# TestPulse Backend Startup Script

echo "Starting TestPulse Backend..."

# Navigate to backend directory
cd "$(dirname "$0")"

# Activate virtual environment
source venv/bin/activate

# Start uvicorn server
echo "Starting server on http://localhost:8000"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Note: Use Ctrl+C to stop the server
