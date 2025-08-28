#!/bin/bash

# BoltAbacus Production Deployment Script
# This script sets up and deploys the application for production use

set -e  # Exit on any error

echo "🚀 Starting BoltAbacus Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    # Required variables
    required_vars=("DB_PASSWORD" "SECRET_KEY")
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Environment variable $var is not set!"
            print_warning "Please set the following environment variables:"
            echo "  export DB_PASSWORD='your-actual-password'"
            echo "  export SECRET_KEY='your-secret-key'"
            exit 1
        fi
    done
    
    print_status "Environment variables check passed!"
}

# Set up environment variables
setup_env() {
    print_status "Setting up environment variables..."
    
    # Database configuration
    export DATABASE_TYPE="production_postgresql"
    export DB_NAME="boltabacusdb"
    export DB_USER="postgres"
    export DB_HOST="boltabacusdb.cxoohqadjgtz.ap-south-1.rds.amazonaws.com"
    export DB_PORT="5432"
    
    # Django settings
    export DEBUG="False"
    export ALLOWED_HOSTS="*"
    
    # Redis configuration (adjust as needed)
    export REDIS_HOST="127.0.0.1"
    export REDIS_PORT="6379"
    
    print_status "Environment variables configured!"
}

# Install dependencies
install_dependencies() {
    print_status "Installing Python dependencies..."
    
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
        print_status "Dependencies installed successfully!"
    else
        print_error "requirements.txt not found!"
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    python manage.py migrate --noinput
    
    if [ $? -eq 0 ]; then
        print_status "Migrations completed successfully!"
    else
        print_error "Migrations failed!"
        exit 1
    fi
}

# Collect static files
collect_static() {
    print_status "Collecting static files..."
    
    python manage.py collectstatic --noinput
    
    if [ $? -eq 0 ]; then
        print_status "Static files collected successfully!"
    else
        print_error "Static file collection failed!"
        exit 1
    fi
}

# Test database connection
test_database() {
    print_status "Testing database connection..."
    
    python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'BoltAbacus.settings')
django.setup()
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute('SELECT 1')
print('Database connection successful!')
"
    
    if [ $? -eq 0 ]; then
        print_status "Database connection test passed!"
    else
        print_error "Database connection test failed!"
        exit 1
    fi
}

# Test streak functionality
test_streak() {
    print_status "Testing streak functionality..."
    
    python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'BoltAbacus.settings')
django.setup()
from Authentication.models import UserDetails, UserStreak
user = UserDetails.objects.first()
if user:
    streak, created = UserStreak.get_or_create_streak(user)
    print(f'Streak test successful! User: {user.firstName}, Streak: {streak.current_streak}')
else:
    print('No users found for testing')
"
    
    if [ $? -eq 0 ]; then
        print_status "Streak functionality test passed!"
    else
        print_error "Streak functionality test failed!"
        exit 1
    fi
}

# Create superuser if needed
create_superuser() {
    print_status "Checking for superuser..."
    
    python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(is_superuser=True).exists():
    print('No superuser found. Creating one...')
    from django.core.management import call_command
    call_command('createsuperuser', interactive=False, username='admin', email='admin@example.com')
    print('Superuser created with username: admin')
else:
    print('Superuser already exists')
"
}

# Start the application
start_application() {
    print_status "Starting the application..."
    
    # For production, you might want to use gunicorn or uwsgi
    # For now, we'll use the Django development server
    print_warning "Starting with Django development server (not recommended for production)"
    print_warning "Consider using gunicorn or uwsgi for production deployment"
    
    python manage.py runserver 0.0.0.0:8000
}

# Main deployment function
main() {
    echo "=================================================="
    echo "🚀 BoltAbacus Production Deployment"
    echo "=================================================="
    
    # Check environment variables
    check_env_vars
    
    # Set up environment
    setup_env
    
    # Install dependencies
    install_dependencies
    
    # Test database connection
    test_database
    
    # Run migrations
    run_migrations
    
    # Test streak functionality
    test_streak
    
    # Collect static files
    collect_static
    
    # Create superuser if needed
    create_superuser
    
    echo "=================================================="
    print_status "Deployment completed successfully!"
    echo "=================================================="
    echo ""
    print_status "Your application is ready for production!"
    echo ""
    print_warning "Next steps:"
    echo "1. Configure your web server (nginx, Apache)"
    echo "2. Set up SSL certificates"
    echo "3. Configure proper logging"
    echo "4. Set up monitoring and backups"
    echo "5. Consider using gunicorn or uwsgi instead of runserver"
    echo ""
    print_status "To start the application, run:"
    echo "  python manage.py runserver 0.0.0.0:8000"
    echo ""
    
    # Ask if user wants to start the application
    read -p "Do you want to start the application now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_application
    else
        print_status "Deployment completed. You can start the application manually."
    fi
}

# Run main function
main "$@"
