#!/usr/bin/env python3
"""
Production Setup Script for BoltAbacus
This script configures the application for production use with PostgreSQL.
"""

import os
import sys
import django
from pathlib import Path

# Add the project directory to the Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'BoltAbacus.settings')

# Configure production environment variables
os.environ['DATABASE_TYPE'] = 'production_postgresql'
os.environ['DB_NAME'] = 'boltabacusdb'
os.environ['DB_USER'] = 'postgres'
os.environ['DB_PASSWORD'] = 'YOUR_PASSWORD'  # Replace with actual password
os.environ['DB_HOST'] = 'boltabacusdb.cxoohqadjgtz.ap-south-1.rds.amazonaws.com'
os.environ['DB_PORT'] = '5432'
os.environ['DEBUG'] = 'False'

# Initialize Django
django.setup()

from django.core.management import execute_from_command_line
from django.db import connection
from Authentication.models import UserStreak

def test_database_connection():
    """Test the database connection"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            print("✅ Database connection successful!")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def run_migrations():
    """Run database migrations"""
    try:
        print("🔄 Running migrations...")
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ Migrations completed successfully!")
        return True
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

def create_superuser():
    """Create a superuser if needed"""
    try:
        print("🔄 Creating superuser...")
        execute_from_command_line(['manage.py', 'createsuperuser'])
        print("✅ Superuser created successfully!")
        return True
    except Exception as e:
        print(f"⚠️  Superuser creation failed or skipped: {e}")
        return False

def test_streak_functionality():
    """Test the streak functionality"""
    try:
        print("🔄 Testing streak functionality...")
        
        # Test creating a streak object
        from Authentication.models import UserDetails
        
        # Get the first user (for testing)
        user = UserDetails.objects.first()
        if user:
            streak, created = UserStreak.get_or_create_streak(user)
            print(f"✅ Streak test successful! User: {user.firstName}, Streak: {streak.current_streak}")
            return True
        else:
            print("⚠️  No users found for streak testing")
            return True
    except Exception as e:
        print(f"❌ Streak functionality test failed: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 Starting BoltAbacus Production Setup...")
    print("=" * 50)
    
    # Test database connection
    if not test_database_connection():
        print("❌ Setup failed: Cannot connect to database")
        sys.exit(1)
    
    # Run migrations
    if not run_migrations():
        print("❌ Setup failed: Migrations failed")
        sys.exit(1)
    
    # Test streak functionality
    if not test_streak_functionality():
        print("❌ Setup failed: Streak functionality test failed")
        sys.exit(1)
    
    # Optionally create superuser
    create_superuser()
    
    print("=" * 50)
    print("✅ BoltAbacus Production Setup Completed Successfully!")
    print("\n📋 Next Steps:")
    print("1. Update the DB_PASSWORD in your environment variables")
    print("2. Configure your web server (nginx, Apache, etc.)")
    print("3. Set up SSL certificates")
    print("4. Configure static file serving")
    print("5. Set up monitoring and logging")
    print("\n🔧 To run the server in production:")
    print("   python manage.py runserver 0.0.0.0:8000")
    print("   (Consider using gunicorn or uwsgi for production)")

if __name__ == "__main__":
    main()
