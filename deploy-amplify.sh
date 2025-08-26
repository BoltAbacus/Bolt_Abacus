#!/bin/bash

echo "🚀 Starting AWS Amplify Deployment..."

# Frontend build
echo "📦 Building frontend..."
npm ci
npm run build

# Backend setup
echo "🐍 Setting up Django backend..."
cd BoltAbacus-master

# Install Python dependencies
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

# Run migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ Deployment setup complete!"
echo "🔗 Deploy to AWS Amplify using:"
echo "   amplify push"
