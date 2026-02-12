import os
import django
from decouple import config

# Set the correct settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_system.settings')

django.setup()

from accounts.models import User

def create_staff():
    if not User.objects.filter(email='staff@test.com').exists():
        user = User.objects.create_user(
            email='staff@test.com',
            username='admin_staff',
            name='Test Staff',
            password='Password123!',
            role='staff'
        )
        print("Staff user created")
    else:
        print("Staff user already exists")

if __name__ == '__main__':
    create_staff()
