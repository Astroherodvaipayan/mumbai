#!/usr/bin/env python3
"""
Test script to verify the JSON parsing and database saving fixes
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_course_generation():
    """Test the course generation endpoint"""
    
    # Test data
    test_data = {
        "input_text": "WEB DEV IN PYTHON"
    }
    
    # API endpoint
    url = "http://localhost:5000/v1/course-genration-outline"
    
    try:
        print("🧪 Testing course generation...")
        print(f"📤 Sending request to: {url}")
        print(f"📝 Test data: {test_data}")
        
        # Send POST request
        response = requests.post(url, json=test_data, timeout=60)
        
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
            
            # Check for additional data structures
            if 'topics' in result:
                print(f"📝 Topics: {len(result.get('topics', []))}")
            if 'videos' in result:
                print(f"🎥 Videos: {len(result.get('videos', []))}")
            if 'assessments' in result:
                print(f"📋 Assessments: {len(result.get('assessments', []))}")
            if 'prerequisites' in result:
                print(f"📋 Prerequisites: {len(result.get('prerequisites', []))}")
            if 'target_audience' in result:
                print(f"👥 Target audience: {len(result.get('target_audience', []))}")
            
            # Check if it's valid JSON
            try:
                json.dumps(result)
                print("✅ Response is valid JSON")
            except Exception as e:
                print(f"❌ Response is not valid JSON: {e}")
            
            # Check database save status
            if result.get('course_id'):
                print("✅ Course was saved to database")
                
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
                print("⚠️ Course was not saved to database (course_id is None)")
                
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"📄 Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

def test_health_check():
    """Test the health check endpoint"""
    
    url = "http://localhost:5000/health"
    
    try:
        print("\n🏥 Testing health check...")
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"📄 Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Health check error: {e}")

def test_database_connection():
    """Test database connection and schema"""
    
    try:
        print("\n🗄️ Testing database connection...")
        
        # Test if we can query the courses table
        response = supabase_client.table('courses').select('id').limit(1).execute()
        print("✅ Database connection successful")
        print(f"📊 Found {len(response.data)} courses in database")
        
        # Test if we can query the modules table
        response = supabase_client.table('modules').select('id').limit(1).execute()
        print(f"📊 Found {len(response.data)} modules in database")
        
        # Test if we can query the User table
        response = supabase_client.table('User').select('id').limit(1).execute()
        print(f"📊 Found {len(response.data)} users in database")
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

if __name__ == "__main__":
    print("🚀 Starting API tests...")
    
    # Import supabase client for database testing
    try:
        from supabase_client import supabase_client
        test_database_connection()
    except ImportError:
        print("⚠️ Could not import supabase_client, skipping database tests")
    
    # Test health check first
    test_health_check()
    
    # Test course generation
    test_course_generation()
    
    print("\n✨ Tests completed!") 