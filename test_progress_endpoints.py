import requests
import json

# Test the progress tracking endpoints
BASE_URL = "http://localhost:8000"

def test_progress_endpoints():
    print("Testing Progress Tracking Endpoints...")
    
    # Test data
    test_data = {
        "practiceType": "flashcards",
        "operation": "addition",
        "currentQuestion": 5,
        "totalQuestions": 10,
        "correctAnswers": 4,
        "incorrectAnswers": 1,
        "timeElapsed": 120,
        "isCompleted": False,
        "numberOfDigits": 2,
        "numberOfRows": 2,
        "zigZag": False,
        "includeSubtraction": False,
        "persistNumberOfDigits": False
    }
    
    # Test headers (you'll need a valid token)
    headers = {
        "Content-Type": "application/json",
        "AUTH-TOKEN": "your-auth-token-here"  # Replace with actual token
    }
    
    try:
        # Test UpdatePracticeProgress endpoint
        print("\n1. Testing UpdatePracticeProgress endpoint...")
        response = requests.post(
            f"{BASE_URL}/updatePracticeProgress/",
            json=test_data,
            headers=headers
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Test GetPracticeProgress endpoint
        print("\n2. Testing GetPracticeProgress endpoint...")
        get_data = {
            "practiceType": "flashcards",
            "operation": "addition"
        }
        response = requests.post(
            f"{BASE_URL}/getPracticeProgress/",
            json=get_data,
            headers=headers
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure Django server is running on localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_progress_endpoints()
