#!/usr/bin/env python3
"""
Test script to verify the progress integration is working
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
TEST_TOKEN = "your_test_token_here"  # Replace with actual test token

def test_get_student_progress():
    """Test the updated student progress endpoint"""
    url = f"{BASE_URL}/getStudentProgressStudent/"
    headers = {
        'AUTH-TOKEN': TEST_TOKEN,
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.post(url, headers=headers, json={})
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Student Progress Response:")
            print(f"  - First Name: {data.get('firstName', 'N/A')}")
            print(f"  - Last Name: {data.get('lastName', 'N/A')}")
            print(f"  - Batch Name: {data.get('batchName', 'N/A')}")
            print(f"  - Levels Count: {len(data.get('levels', []))}")
            
            # Check for practice stats
            practice_stats = data.get('practiceStats')
            if practice_stats:
                print("✅ Practice Stats Found:")
                print(f"  - Total Sessions: {practice_stats.get('totalSessions', 0)}")
                print(f"  - Total Practice Time: {practice_stats.get('totalPracticeTime', 0)} seconds")
                print(f"  - Total Problems Solved: {practice_stats.get('totalProblemsSolved', 0)}")
                print(f"  - Recent Sessions: {practice_stats.get('recentSessions', 0)}")
                print(f"  - Practice Sessions Count: {len(practice_stats.get('practiceSessions', []))}")
            else:
                print("⚠️  No practice stats found (this is normal for new users)")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_update_practice_progress():
    """Test the practice progress update endpoint"""
    url = f"{BASE_URL}/updatePracticeProgress/"
    headers = {
        'AUTH-TOKEN': TEST_TOKEN,
        'Content-Type': 'application/json'
    }
    
    test_data = {
        'practiceType': 'flashcards',
        'operation': 'addition',
        'currentQuestion': 5,
        'totalQuestions': 10,
        'correctAnswers': 4,
        'incorrectAnswers': 1,
        'timeElapsed': 120,
        'isCompleted': False,
        'numberOfDigits': 2,
        'numberOfRows': 1,
        'zigZag': False,
        'includeSubtraction': False,
        'persistNumberOfDigits': False
    }
    
    try:
        response = requests.post(url, headers=headers, json=test_data)
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Practice Progress Update Response:")
            print(f"  - Message: {data.get('message', 'N/A')}")
            progress = data.get('progress', {})
            print(f"  - Progress Percentage: {progress.get('progressPercentage', 0)}%")
            print(f"  - Accuracy Percentage: {progress.get('accuracyPercentage', 0)}%")
            print(f"  - Correct Answers: {progress.get('correctAnswers', 0)}")
            print(f"  - Time Elapsed: {progress.get('timeElapsed', 0)} seconds")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    print("🧪 Testing Progress Integration...")
    print("=" * 50)
    
    print("\n1. Testing Student Progress Endpoint:")
    test_get_student_progress()
    
    print("\n2. Testing Practice Progress Update:")
    test_update_practice_progress()
    
    print("\n" + "=" * 50)
    print("✅ Test completed!")
    print("\nNote: To run with real data, replace TEST_TOKEN with an actual user token")
