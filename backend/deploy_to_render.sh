#!/bin/bash

# Deploy to Render Script
# This script helps migrate your local database to Render PostgreSQL

echo "🚀 Starting Render Deployment Process..."
echo "======================================"

# Check if we're in the right directory
if [ ! -f "manage.py" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

echo "✅ Found Django project"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set in environment"
    echo "💡 Make sure your .env file has the Render database URL"
    echo "📝 Loading .env file..."
    # Load .env file properly, skipping comments and empty lines
    export $(grep -v '^#' .env | grep -v '^$' | xargs)
fi

# Verify database connection
echo "🔍 Testing database connection..."
python manage.py shell -c "
import os
import django
from django.conf import settings
from django.db import connections

django.setup()

try:
    db_conn = connections['default']
    c = db_conn.cursor()
    c.execute('SELECT 1')
    print('✅ Database connection successful!')
    c.close()
except Exception as e:
    print(f'❌ Database connection failed: {e}')
    exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ Cannot connect to Render database"
    echo "💡 Please verify your DATABASE_URL in .env file"
    exit 1
fi

# Run migrations
echo "🔄 Running migrations..."
python manage.py makemigrations
python manage.py migrate

if [ $? -ne 0 ]; then
    echo "❌ Migration failed"
    exit 1
fi

echo "✅ Migrations completed successfully!"

# Collect static files
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput

if [ $? -ne 0 ]; then
    echo "❌ Static files collection failed"
    exit 1
fi

echo "✅ Static files collected!"

# Create superuser (optional)
echo "👤 Creating superuser (if needed)..."
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@testverse.com', 'admin123') if not User.objects.filter(username='admin').exists() else print('Superuser already exists')" | python manage.py shell

echo "✅ Superuser setup completed!"

echo ""
echo "🎉 Deployment preparation completed!"
echo "====================================="
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect your GitHub repo to Render"
echo "3. Set the DATABASE_URL environment variable in Render Dashboard"
echo "4. Deploy your application"
echo ""
echo "📝 Render Environment Variables needed:"
echo "   DATABASE_URL = postgresql://testverse_database_user:qG5mA1ZAv0ROiweT2kW5Q3ispSkcK8Kw@dpg-d67e79er433s73f4ertg-a.oregon-postgres.render.com:5432/testverse_database"
echo "   SECRET_KEY = your-production-secret-key"
echo "   DEBUG = False"
echo "   ALLOWED_HOSTS = your-render-app-name.onrender.com"
echo ""
echo "🔗 Render Dashboard: https://dashboard.render.com/"