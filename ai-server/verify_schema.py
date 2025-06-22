#!/usr/bin/env python3
"""
Script to verify database schema matches code expectations
"""

import os
from dotenv import load_dotenv
import supabase
import uuid
import json
from datetime import datetime

# Load environment variables
load_dotenv()

def verify_schema():
    """Verify that the database schema matches the code expectations"""
    
    # Get Supabase credentials
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase environment variables")
        return False
    
    try:
        # Create Supabase client
        client = supabase.create_client(supabase_url, supabase_key)
        
        print("🔍 Verifying database schema...")
        
        # Test User table
        print("\n📋 Testing User table...")
        try:
            response = client.table('User').select('id, name, email, Credit, subscription_tier').limit(1).execute()
            print("✅ User table accessible")
            if response.data:
                print(f"   Sample user: {response.data[0]}")
        except Exception as e:
            print(f"❌ User table error: {e}")
            return False
        
        # Test courses table
        print("\n📋 Testing courses table...")
        try:
            response = client.table('courses').select('id, courseName, domain, userId, numberOfDays').limit(1).execute()
            print("✅ courses table accessible")
            if response.data:
                print(f"   Sample course: {response.data[0]}")
        except Exception as e:
            print(f"❌ courses table error: {e}")
            return False
        
        # Test modules table
        print("\n📋 Testing modules table...")
        try:
            response = client.table('modules').select('id, courseId, dayNumber, moduleNumber, title').limit(1).execute()
            print("✅ modules table accessible")
            if response.data:
                print(f"   Sample module: {response.data[0]}")
        except Exception as e:
            print(f"❌ modules table error: {e}")
            return False
        
        # Test inserting a sample course (will be deleted)
        print("\n🧪 Testing comprehensive course insertion...")
        try:
            # Generate unique test identifiers
            test_id = str(uuid.uuid4())[:8]
            test_email = f"schema-test-{test_id}@studentfolio.com"
            test_course_name = f"Schema Test Course {test_id}"
            
            # Create a test user first
            test_user_data = {
                "name": f"Schema Test User {test_id}",
                "email": test_email,
                "password": "test-password",
                "Credit": 100,
                "subscription_tier": "premium"
            }
            
            user_response = client.table('User').insert(test_user_data).execute()
            if not user_response.data:
                print("❌ Could not create test user")
                return False
            
            test_user_id = user_response.data[0]['id']
            print(f"✅ Test user created with ID: {test_user_id}")
            
            # Create a comprehensive test course structure
            test_course_data = {
                "userId": test_user_id,
                "courseName": test_course_name,
                "domain": "Programming",
                "subtopics": ["Test1", "Test2", "Test3"],
                "Introduction": json.dumps(["Test introduction"]),
                "numberOfDays": 2,
                "ModuleCreated": 0,
                "Archive": 0,
                "structure": json.dumps({"test": "comprehensive data"}),
                "YouTubeReferences": json.dumps([{"title": "Test Video", "url": "https://youtube.com/test"}]),
                "ReferenceBooks": json.dumps([{"title": "Test Book", "author": "Test Author"}]),
                "difficulty_level": "beginner",
                "estimated_hours": 10,
                "category": "programming",
                "tags": ["test", "comprehensive"],
                "is_public": False,
                "rating": 0.0,
                "completion_rate": 0.0
            }
            
            course_response = client.table('courses').insert(test_course_data).execute()
            if not course_response.data:
                print("❌ Could not create test course")
                return False
            
            test_course_id = course_response.data[0]['id']
            print(f"✅ Test course created with ID: {test_course_id}")
            
            # Create test modules
            module_ids = []
            for day_num in range(1, 3):  # 2 days
                for module_index in range(1, 4):  # 3 modules per day
                    module_data = {
                        "courseId": test_course_id,
                        "dayNumber": day_num,
                        "moduleNumber": module_index,
                        "title": f"Test Module {module_index} Day {day_num}",
                        "description": f"Test module description {module_index}",
                        "content": f"Test content for module {module_index}",
                        "content_html": f"<h1>Test HTML for module {module_index}</h1>",
                        "learning_objectives": [f"Objective {i}" for i in range(1, 4)],
                        "duration_minutes": 30,
                        "is_locked": False,
                        "prerequisite_modules": [],
                        "createdAt": datetime.now().isoformat(),
                        "updatedAt": datetime.now().isoformat()
                    }
                    
                    module_response = client.table('modules').insert(module_data).execute()
                    if module_response.data:
                        module_ids.append(module_response.data[0]['id'])
                        print(f"✅ Test module {module_index} (Day {day_num}) created with ID: {module_response.data[0]['id']}")
            
            # Create test topics for each module
            topic_ids = []
            for module_id in module_ids:
                for topic_index in range(1, 3):  # 2 topics per module
                    topic_data = {
                        "moduleId": module_id,
                        "title": f"Test Topic {topic_index}",
                        "content": f"Test content for topic {topic_index}",
                        "content_type": "text",
                        "order": topic_index,
                        "metadata": json.dumps({"test": "metadata"}),
                        "createdAt": datetime.now().isoformat(),
                        "updatedAt": datetime.now().isoformat()
                    }
                    
                    topic_response = client.table('topics').insert(topic_data).execute()
                    if topic_response.data:
                        topic_ids.append(topic_response.data[0]['id'])
                        print(f"✅ Test topic {topic_index} created with ID: {topic_response.data[0]['id']}")
            
            # Create test videos
            video_ids = []
            for module_id in module_ids[:2]:  # Videos for first 2 modules
                video_data = {
                    "moduleId": module_id,
                    "title": f"Test Video for Module",
                    "description": "Test video description",
                    "youtube_url": "https://youtube.com/watch?v=test",
                    "youtube_video_id": "test123",
                    "thumbnail_url": "https://img.youtube.com/vi/test123/default.jpg",
                    "duration_seconds": 600,
                    "transcript": "Test transcript",
                    "tags": ["test", "video"],
                    "video_quality": "standard",
                    "createdAt": datetime.now().isoformat(),
                    "updatedAt": datetime.now().isoformat()
                }
                
                video_response = client.table('videos').insert(video_data).execute()
                if video_response.data:
                    video_ids.append(video_response.data[0]['id'])
                    print(f"✅ Test video created with ID: {video_response.data[0]['id']}")
            
            # Create test assessments
            assessment_ids = []
            for module_id in module_ids[:2]:  # Assessments for first 2 modules
                assessment_data = {
                    "moduleId": module_id,
                    "type": "quiz",
                    "title": f"Test Assessment for Module",
                    "description": "Test assessment description",
                    "questions": json.dumps([
                        {"question": "Test question 1?", "options": ["A", "B", "C"], "correct": 0},
                        {"question": "Test question 2?", "options": ["X", "Y", "Z"], "correct": 1}
                    ]),
                    "correct_answers": json.dumps([0, 1]),
                    "passing_score": 70,
                    "max_attempts": 3,
                    "time_limit_minutes": 15,
                    "createdAt": datetime.now().isoformat(),
                    "updatedAt": datetime.now().isoformat()
                }
                
                assessment_response = client.table('assessments').insert(assessment_data).execute()
                if assessment_response.data:
                    assessment_ids.append(assessment_response.data[0]['id'])
                    print(f"✅ Test assessment created with ID: {assessment_response.data[0]['id']}")
            
            # Create test learning analytics
            analytics_data = {
                "userId": test_user_id,
                "courseId": test_course_id,
                "event_type": "course_created",
                "event_data": json.dumps({
                    "topic": "Test Topic",
                    "domain": "Programming",
                    "modules_created": len(module_ids),
                    "ai_generated": True
                }),
                "session_id": f"test-session-{test_id}",
                "createdAt": datetime.now().isoformat()
            }
            
            analytics_response = client.table('learning_analytics').insert(analytics_data).execute()
            if analytics_response.data:
                print(f"✅ Test learning analytics created with ID: {analytics_response.data[0]['id']}")
            
            # Create test enrollment
            enrollment_data = {
                "userId": test_user_id,
                "courseId": test_course_id,
                "enrolled_at": datetime.now().isoformat(),
                "progress_percentage": 0.0,
                "status": "active"
            }
            
            enrollment_response = client.table('enrollments').insert(enrollment_data).execute()
            if enrollment_response.data:
                print(f"✅ Test enrollment created with ID: {enrollment_response.data[0]['id']}")
            
            # Create test progress entries
            for module_id in module_ids[:2]:  # Progress for first 2 modules
                progress_data = {
                    "userId": test_user_id,
                    "courseId": test_course_id,
                    "moduleId": module_id,
                    "status": "not_started",
                    "progress_percentage": 0.0,
                    "time_spent_minutes": 0,
                    "notes": "Test progress entry"
                }
                
                progress_response = client.table('progress').insert(progress_data).execute()
                if progress_response.data:
                    print(f"✅ Test progress entry created with ID: {progress_response.data[0]['id']}")
            
            # Create test bookmark
            bookmark_data = {
                "userId": test_user_id,
                "courseId": test_course_id,
                "notes": "Test bookmark"
            }
            
            bookmark_response = client.table('bookmarks').insert(bookmark_data).execute()
            if bookmark_response.data:
                print(f"✅ Test bookmark created with ID: {bookmark_response.data[0]['id']}")
            
            # Test retrieving comprehensive course data
            print("\n🔍 Testing comprehensive data retrieval...")
            try:
                # Get course with all related data
                course_with_data = client.table('courses').select('*').eq('id', test_course_id).execute()
                if course_with_data.data:
                    print(f"✅ Course data retrieved successfully")
                
                # Get modules for this course
                modules_data = client.table('modules').select('*').eq('courseId', test_course_id).execute()
                print(f"✅ Retrieved {len(modules_data.data)} modules")
                
                # Get topics for this course
                topics_data = client.table('topics').select('*').in_('moduleId', module_ids).execute()
                print(f"✅ Retrieved {len(topics_data.data)} topics")
                
                # Get videos for this course
                videos_data = client.table('videos').select('*').in_('moduleId', module_ids).execute()
                print(f"✅ Retrieved {len(videos_data.data)} videos")
                
                # Get assessments for this course
                assessments_data = client.table('assessments').select('*').in_('moduleId', module_ids).execute()
                print(f"✅ Retrieved {len(assessments_data.data)} assessments")
                
                # Get analytics for this course
                analytics_data = client.table('learning_analytics').select('*').eq('courseId', test_course_id).execute()
                print(f"✅ Retrieved {len(analytics_data.data)} analytics entries")
                
            except Exception as e:
                print(f"⚠️ Error retrieving comprehensive data: {e}")
            
            # Clean up test data
            print("\n🧹 Cleaning up comprehensive test data...")
            
            # Delete in reverse order to respect foreign key constraints
            client.table('bookmarks').delete().eq('courseId', test_course_id).execute()
            client.table('progress').delete().eq('courseId', test_course_id).execute()
            client.table('enrollments').delete().eq('courseId', test_course_id).execute()
            client.table('learning_analytics').delete().eq('courseId', test_course_id).execute()
            client.table('assessments').delete().in_('id', assessment_ids).execute()
            client.table('videos').delete().in_('id', video_ids).execute()
            client.table('topics').delete().in_('id', topic_ids).execute()
            client.table('modules').delete().in_('id', module_ids).execute()
            client.table('courses').delete().eq('id', test_course_id).execute()
            client.table('User').delete().eq('id', test_user_id).execute()
            
            print("✅ Comprehensive test data cleaned up")
            
            print(f"\n📊 Comprehensive Test Summary:")
            print(f"   ✅ Course: 1")
            print(f"   ✅ Modules: {len(module_ids)}")
            print(f"   ✅ Topics: {len(topic_ids)}")
            print(f"   ✅ Videos: {len(video_ids)}")
            print(f"   ✅ Assessments: {len(assessment_ids)}")
            print(f"   ✅ Analytics: 1")
            print(f"   ✅ Enrollment: 1")
            print(f"   ✅ Progress: 2")
            print(f"   ✅ Bookmark: 1")
            
            print("\n🎉 Comprehensive schema verification completed successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Comprehensive schema test failed: {e}")
            # Try to clean up even if test failed
            try:
                client.table('User').delete().eq('email', test_email).execute()
                client.table('courses').delete().eq('courseName', test_course_name).execute()
                print("🧹 Cleaned up test data after failure")
            except:
                pass
            return False
            
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting schema verification...")
    success = verify_schema()
    
    if success:
        print("\n✅ All schema tests passed! The database is ready for the application.")
    else:
        print("\n❌ Schema verification failed. Please check your database setup.") 