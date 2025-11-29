#!/bin/bash

# Script to recreate database with new schema
# This adds the sms_code field to the database

echo "Recreating database with SMS code field..."

# Remove old database
rm -f du_admission.db

echo "Old database removed"
echo "The database will be recreated automatically when the server starts"
echo ""
echo "Restart the server with: ./start.sh"
