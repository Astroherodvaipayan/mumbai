#!/usr/bin/env python3
"""
Test script to verify comprehensive course data generation
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_comprehensive_generation():
    """Test the comprehensive course generation with topics, videos, and assessments"""
    
    # Test data
    test_data = {
        "input_text": "PYTHON WEB DEVELOPMENT"
    }
    
    # API endpoint
    url = "http://localhost:5000/v1/course-genration-outline"
    
    try:
        print("🧪 Testing comprehensive course generation...")
        print(f"📤 Sending request to: {url}")
        print(f"📝 Test data: {test_data}")
        
        # Send POST request
        response = requests.post(url, json=test_data, timeout=120)  # Increased timeout
        
        print(f"📥 Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success! Course generated successfully")
            print(f"📚 Course name: {result.get('name', 'N/A')}")
            print(f"🏷️ Domain: {result.get('domain', 'N/A')}")
            print(f"🆔 Course ID: {result.get('course_id', 'N/A')}")
            print(f"💾 Saved to database: {result.get('saved_to_database', 'N/A')}")
            print(f"📅 Number of days: {result.get('numberofdays', 'N/A')}")
            print(f"📖 Subtopics: {result.get('subtopics', [])}")
            print(f"📺 YouTube references: {len(result.get('YouTubeReferences', []))}")
            print(f"📚 Reference books: {len(result.get('ReferenceBooks', []))}")
            
            # Check for comprehensive data structures
            print("\n🔍 Checking comprehensive data structures:")
            
            if 'topics' in result:
                topics = result.get('topics', [])
                print(f"📝 Topics: {len(topics)}")
                if topics:
                    print(f"   Sample topic: {topics[0].get('title', 'N/A')}")
                    print(f"   Topic content type: {topics[0].get('content_type', 'N/A')}")
            else:
                print("❌ No topics found in response")
            
            if 'videos' in result:
                videos = result.get('videos', [])
                print(f"🎥 Videos: {len(videos)}")
                if videos:
                    print(f"   Sample video: {videos[0].get('title', 'N/A')}")
                    print(f"   Video URL: {videos[0].get('youtube_url', 'N/A')}")
            else:
                print("❌ No videos found in response")
            
            if 'assessments' in result:
                assessments = result.get('assessments', [])
                print(f"📋 Assessments: {len(assessments)}")
                if assessments:
                    print(f"   Sample assessment: {assessments[0].get('title', 'N/A')}")
                    print(f"   Assessment type: {assessments[0].get('type', 'N/A')}")
                    questions = assessments[0].get('questions', [])
                    print(f"   Number of questions: {len(questions)}")
            else:
                print("❌ No assessments found in response")
            
            if 'prerequisites' in result:
                print(f"📋 Prerequisites: {len(result.get('prerequisites', []))}")
            
            if 'target_audience' in result:
                print(f"👥 Target audience: {len(result.get('target_audience', []))}")
            
            if 'learning_objectives' in result:
                print(f"🎯 Learning objectives: {len(result.get('learning_objectives', []))}")
            
            # Check if it's valid JSON
            try:
                json.dumps(result)
                print("\n✅ Response is valid JSON")
            except Exception as e:
                print(f"\n❌ Response is not valid JSON: {e}")
            
            # Check database save status
            if result.get('course_id'):
                print("\n✅ Course was saved to database")
                
                # Test retrieving the saved course
                try:
                    from supabase_client import get_course_with_all_data
                    saved_course = get_course_with_all_data(result.get('course_id'))
                    if saved_course:
                        print(f"✅ Successfully retrieved saved course from database")
                        print(f"   📊 Modules saved: {len(saved_course.get('modules', []))}")
                        print(f"   📝 Topics saved: {sum(len(module.get('topics', [])) for module in saved_course.get('modules', []))}")
                        print(f"   🎥 Videos saved: {len(saved_course.get('videos', []))}")
                        print(f"   📋 Assessments saved: {len(saved_course.get('assessments', []))}")
                    else:
                        print("⚠️ Could not retrieve saved course from database")
                except Exception as e:
                    print(f"⚠️ Error retrieving saved course: {e}")
            else:
                print("\n⚠️ Course was not saved to database (course_id is None)")
                
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"📄 Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    print("🚀 Starting comprehensive course generation test...")
    test_comprehensive_generation()
    print("\n✨ Test completed!") 