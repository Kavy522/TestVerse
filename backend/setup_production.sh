#!/bin/bash
# Render deployment setup script
# This script runs migrations and creates a superuser

echo "Running Django migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Deployment setup complete!"
