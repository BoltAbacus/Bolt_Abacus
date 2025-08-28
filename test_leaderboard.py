#!/usr/bin/env python3
"""
Simple test script to verify the leaderboard API is working
"""

import requests
import json

def test_leaderboard_api():
    """Test the leaderboard API endpoint"""
    try:
        # Test the leaderboard endpoint
        response = requests.get('http://localhost:8000/leaderboard/')
        
        if response.status_code == 200:
            data = response.json()
            leaderboard = data.get('leaderboard', [])
            
            print("✅ Leaderboard API is working!")
            print(f"📊 Found {len(leaderboard)} students in leaderboard")
            
            if leaderboard:
                print("\n🏆 Top 10 Leaderboard:")
                print("Rank | Name | XP | Level | Streak")
                print("-" * 50)
                for i, student in enumerate(leaderboard[:10], 1):
                    print(f"{i:4} | {student['name']:20} | {student['xp']:4} | {student['level']:5} | {student['streak']:2}")
            else:
                print("❌ No leaderboard data found")
                
        else:
            print(f"❌ API returned status code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API. Make sure the Django server is running on localhost:8000")
    except Exception as e:
        print(f"❌ Error testing API: {e}")

if __name__ == "__main__":
    test_leaderboard_api()
