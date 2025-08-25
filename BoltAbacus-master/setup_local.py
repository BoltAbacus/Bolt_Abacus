#!/usr/bin/env python
"""
Setup script for local development
This script handles database setup and migrations for the BoltAbacus project
"""

import os
import sys
import django
from django.core.management import execute_from_command_line
from django.db import connection
from django.core.management.base import CommandError

def setup_environment():
    """Set up environment variables for local development"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'BoltAbacus.settings')
    os.environ.setdefault('DATABASE_TYPE', 'local')
    os.environ.setdefault('DEBUG', 'True')
    os.environ.setdefault('REDIS_HOST', '127.0.0.1')
    os.environ.setdefault('REDIS_PORT', '6379')

def create_migrations():
    """Create database migrations"""
    print("Creating migrations...")
    try:
        execute_from_command_line(['manage.py', 'makemigrations', 'Authentication'])
        print("✓ Migrations created successfully")
    except CommandError as e:
        print(f"✗ Error creating migrations: {e}")
        return False
    return True

def apply_migrations():
    """Apply database migrations"""
    print("Applying migrations...")
    try:
        execute_from_command_line(['manage.py', 'migrate'])
        print("✓ Migrations applied successfully")
    except CommandError as e:
        print(f"✗ Error applying migrations: {e}")
        return False
    return True

def create_superuser():
    """Create a superuser for admin access"""
    print("Creating superuser...")
    try:
        execute_from_command_line(['manage.py', 'createsuperuser'])
        print("✓ Superuser created successfully")
    except CommandError as e:
        print(f"✗ Error creating superuser: {e}")
        return False
    return True

def collect_static():
    """Collect static files"""
    print("Collecting static files...")
    try:
        execute_from_command_line(['manage.py', 'collectstatic', '--noinput'])
        print("✓ Static files collected successfully")
    except CommandError as e:
        print(f"✗ Error collecting static files: {e}")
        return False
    return True

def check_database():
    """Check database connection"""
    print("Checking database connection...")
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✓ Database connection successful")
        return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 Setting up BoltAbacus for local development...")
    
    # Setup environment
    setup_environment()
    
    # Initialize Django
    django.setup()
    
    # Check database connection
    if not check_database():
        print("Please ensure your database is running and accessible")
        sys.exit(1)
    
    # Create migrations
    if not create_migrations():
        print("Failed to create migrations")
        sys.exit(1)
    
    # Apply migrations
    if not apply_migrations():
        print("Failed to apply migrations")
        sys.exit(1)
    
    # Collect static files
    if not collect_static():
        print("Failed to collect static files")
        sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("\nNext steps:")
    print("1. Start Redis server: redis-server")
    print("2. Start Django development server: python manage.py runserver")
    print("3. Start your React frontend: npm run dev")
    print("\nFor WebSocket support, use: python manage.py runserver --noreload")

if __name__ == '__main__':
    main()
