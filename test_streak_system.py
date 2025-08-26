#!/usr/bin/env python3
"""
Test script for the streak system
"""

import os
import sys
import django
from datetime import date, timedelta

# Add the Django project to the Python path
sys.path.append('BoltAbacus-master')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'BoltAbacus.settings')
django.setup()

from Authentication.models import UserDetails, UserStreak

def test_streak_system():
    """Test the streak system functionality"""
    print("🧪 Testing Streak System...")
    
    # Create a test user if it doesn't exist
    test_email = "streak_test@example.com"
    
    # First, get or create an organization tag
    from Authentication.models import OrganizationTag
    org_tag, org_created = OrganizationTag.objects.get_or_create(
        tagName="TestOrg",
        defaults={
            'organizationName': 'Test Organization',
            'isIndividualTeacher': False,
            'numberOfTeachers': 1,
            'numberOfStudents': 1,
            'expirationDate': date.today() + timedelta(days=365),
            'totalNumberOfStudents': 1,
            'maxLevel': 10,
            'maxClass': 10,
        }
    )
    
    user, created = UserDetails.objects.get_or_create(
        email=test_email,
        defaults={
            'firstName': 'Streak',
            'lastName': 'Test',
            'phoneNumber': '1234567890',
            'role': 'student',
            'encryptedPassword': 'test123',
            'created_date': date.today(),
            'blocked': False,
            'tag': org_tag,
        }
    )
    
    if created:
        print(f"✅ Created test user: {user.firstName} {user.lastName}")
    else:
        print(f"✅ Using existing test user: {user.firstName} {user.lastName}")
    
    # Get or create user streak
    user_streak, created = UserStreak.objects.get_or_create(user=user)
    if created:
        print(f"✅ Created UserStreak for user {user.userId}")
    else:
        print(f"✅ Found existing UserStreak for user {user.userId}")
    
    print(f"\n📊 Current Streak Data:")
    print(f"   Current Streak: {user_streak.current_streak}")
    print(f"   Max Streak: {user_streak.max_streak}")
    print(f"   Last Activity: {user_streak.last_activity_date}")
    
    # Test streak updates
    print(f"\n🔥 Testing Streak Updates:")
    
    # Test 1: First activity
    print("   Test 1: First activity")
    user_streak.update_streak()
    print(f"   Result: Current Streak = {user_streak.current_streak}, Max Streak = {user_streak.max_streak}")
    
    # Test 2: Same day activity (should not change)
    print("   Test 2: Same day activity")
    user_streak.update_streak()
    print(f"   Result: Current Streak = {user_streak.current_streak}, Max Streak = {user_streak.max_streak}")
    
    # Test 3: Simulate consecutive day
    print("   Test 3: Consecutive day")
    user_streak.last_activity_date = date.today() - timedelta(days=1)
    user_streak.save()
    user_streak.update_streak()
    print(f"   Result: Current Streak = {user_streak.current_streak}, Max Streak = {user_streak.max_streak}")
    
    # Test 4: Simulate broken streak
    print("   Test 4: Broken streak (2 days gap)")
    user_streak.last_activity_date = date.today() - timedelta(days=2)
    user_streak.save()
    user_streak.update_streak()
    print(f"   Result: Current Streak = {user_streak.current_streak}, Max Streak = {user_streak.max_streak}")
    
    # Test 5: Build up a longer streak
    print("   Test 5: Building longer streak")
    for i in range(1, 6):  # 5 consecutive days
        user_streak.last_activity_date = date.today() - timedelta(days=i)
        user_streak.save()
        user_streak.update_streak()
        print(f"   Day {i}: Current Streak = {user_streak.current_streak}, Max Streak = {user_streak.max_streak}")
    
    print(f"\n✅ Streak System Test Complete!")
    print(f"   Final Current Streak: {user_streak.current_streak}")
    print(f"   Final Max Streak: {user_streak.max_streak}")
    print(f"   Final Last Activity: {user_streak.last_activity_date}")

if __name__ == "__main__":
    test_streak_system()
