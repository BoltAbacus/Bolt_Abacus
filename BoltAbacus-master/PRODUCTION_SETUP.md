# BoltAbacus Production Setup Guide

This guide will help you set up BoltAbacus for production use with PostgreSQL database.

## 🚀 Quick Start

### 1. Environment Setup

First, set up your environment variables:

```bash
# Set your actual database password
export DB_PASSWORD="your-actual-password"

# Set a secure secret key
export SECRET_KEY="your-secure-secret-key-here"

# Optional: Set other environment variables
export DEBUG="False"
export ALLOWED_HOSTS="your-domain.com,www.your-domain.com"
```

### 2. Database Configuration

The application is configured to use the production PostgreSQL database:

- **Host**: `boltabacusdb.cxoohqadjgtz.ap-south-1.rds.amazonaws.com`
- **Database**: `boltabacusdb`
- **User**: `postgres`
- **Port**: `5432`
- **SSL**: Required

### 3. Run Production Setup

```bash
# Make the deployment script executable
chmod +x deploy_production.sh

# Run the production deployment
./deploy_production.sh
```

Or use the Python setup script:

```bash
python setup_production.py
```

## 📋 Detailed Setup Instructions

### Prerequisites

1. **Python 3.8+** installed
2. **pip** package manager
3. **PostgreSQL client libraries**
4. **Redis** (for WebSocket support)

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 2: Configure Database

The application supports multiple database types. For production, it's configured to use PostgreSQL:

```python
# In settings.py
DATABASE_TYPE = 'production_postgresql'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'boltabacusdb',
        'USER': 'postgres',
        'PASSWORD': 'YOUR_PASSWORD',  # Set via environment variable
        'HOST': 'boltabacusdb.cxoohqadjgtz.ap-south-1.rds.amazonaws.com',
        'PORT': '5432',
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
}
```

### Step 3: Run Migrations

```bash
python manage.py migrate
```

### Step 4: Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### Step 5: Create Superuser

```bash
python manage.py createsuperuser
```

### Step 6: Test the Setup

```bash
# Test database connection
python manage.py shell -c "
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute('SELECT 1')
print('Database connection successful!')
"

# Test streak functionality
python manage.py shell -c "
from Authentication.models import UserDetails, UserStreak
user = UserDetails.objects.first()
if user:
    streak, created = UserStreak.get_or_create_streak(user)
    print(f'Streak test successful! User: {user.firstName}, Streak: {streak.current_streak}')
"
```

## 🔧 Production Deployment

### Using Gunicorn (Recommended)

1. Install Gunicorn:
```bash
pip install gunicorn
```

2. Create a Gunicorn configuration file (`gunicorn.conf.py`):
```python
bind = "0.0.0.0:8000"
workers = 3
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2
max_requests = 1000
max_requests_jitter = 100
preload_app = True
```

3. Start the application:
```bash
gunicorn -c gunicorn.conf.py BoltAbacus.wsgi:application
```

### Using Docker

1. Build the Docker image:
```bash
docker build -t bolt-abacus .
```

2. Run the container:
```bash
docker run -d \
  -p 8000:8000 \
  -e DB_PASSWORD="your-password" \
  -e SECRET_KEY="your-secret-key" \
  -e DATABASE_TYPE="production_postgresql" \
  bolt-abacus
```

## 🔒 Security Considerations

### Environment Variables

Never commit sensitive information to version control. Use environment variables:

```bash
# .env file (not committed to git)
DB_PASSWORD=your-actual-password
SECRET_KEY=your-secure-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com
```

### SSL/TLS

Configure SSL certificates for your domain:

```nginx
# nginx configuration example
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Database Security

1. Use strong passwords
2. Enable SSL connections
3. Restrict database access to application servers only
4. Regular security updates

## 📊 Monitoring and Logging

### Django Logging Configuration

Add to `settings.py`:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/bolt-abacus/django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### Health Checks

Create a health check endpoint:

```python
# In views.py
from django.http import JsonResponse
from django.db import connection

def health_check(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return JsonResponse({'status': 'healthy', 'database': 'connected'})
    except Exception as e:
        return JsonResponse({'status': 'unhealthy', 'error': str(e)}, status=500)
```

## 🔄 Streak Feature Production Configuration

The streak feature has been enhanced for production use:

### Enhanced Features

1. **Database Indexes**: Added indexes for better query performance
2. **Error Handling**: Improved error handling and logging
3. **Optimized Queries**: Using `update_fields` for efficient updates
4. **Timezone Support**: Proper handling of timezone-aware dates

### API Endpoints

- `GET /streak/` - Get user streak information
- `POST /streak/update/` - Update user streak
- `POST /streak/reset/` - Reset user streak

### Usage Example

```javascript
// Frontend usage
const updateStreak = async () => {
  try {
    const response = await fetch('/streak/update/', {
      method: 'POST',
      headers: {
        'AUTH-TOKEN': authToken,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    console.log('Streak updated:', data);
  } catch (error) {
    console.error('Error updating streak:', error);
  }
};
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check if the database password is correct
   - Verify network connectivity to the database host
   - Ensure SSL is properly configured

2. **Migration Errors**
   - Check if all dependencies are installed
   - Verify database permissions
   - Check for conflicting migrations

3. **Static Files Not Loading**
   - Run `python manage.py collectstatic`
   - Check static file configuration in web server
   - Verify file permissions

### Debug Mode

For debugging, temporarily enable debug mode:

```bash
export DEBUG="True"
python manage.py runserver 0.0.0.0:8000
```

### Logs

Check application logs:

```bash
# Django logs
tail -f /var/log/bolt-abacus/django.log

# System logs
journalctl -u bolt-abacus -f
```

## 📞 Support

If you encounter issues:

1. Check the logs for error messages
2. Verify all environment variables are set correctly
3. Test database connectivity manually
4. Review the troubleshooting section above

For additional support, please refer to the project documentation or create an issue in the repository.

## 🔄 Updates and Maintenance

### Regular Maintenance Tasks

1. **Database Backups**: Set up automated database backups
2. **Security Updates**: Keep dependencies updated
3. **Log Rotation**: Configure log rotation to prevent disk space issues
4. **Monitoring**: Set up monitoring for application health

### Update Process

1. Pull the latest code
2. Update dependencies: `pip install -r requirements.txt`
3. Run migrations: `python manage.py migrate`
4. Collect static files: `python manage.py collectstatic --noinput`
5. Restart the application

---

**Note**: This setup guide assumes you have the necessary permissions and access to configure the production environment. Always follow your organization's security policies and procedures.
