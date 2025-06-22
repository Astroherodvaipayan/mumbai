import os
from dotenv import load_dotenv
import supabase
from datetime import datetime
import json

# Load environment variables
load_dotenv()

# Get Supabase credentials
supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase environment variables")

# Create Supabase client
supabase_client = supabase.create_client(supabase_url, supabase_key)

def get_courses():
    """Get all courses from Supabase"""
    response = supabase_client.table('courses').select('*').execute()
    return response.data

def get_course_by_id(course_id):
    """Get a course by ID"""
    response = supabase_client.table('courses').select('*').eq('id', course_id).execute()
    if response.data:
        return response.data[0]
    return None

def get_modules_by_course_id(course_id):
    """Get modules for a course"""
    response = supabase_client.table('modules').select('*').eq('courseId', course_id).execute()
    return response.data

def get_topics_by_module_id(module_id):
    """Get topics for a module"""
    response = supabase_client.table('topics').select('*').eq('moduleId', module_id).execute()
    return response.data

def save_course(course_data):
    """Save a course to the database"""
    try:
        # Ensure required fields are present
        required_fields = ["userId", "courseName", "domain", "subtopics", "Introduction", "numberOfDays", "structure"]
        for field in required_fields:
            if field not in course_data:
                print(f"Warning: Missing required field '{field}' in course data")
        
        response = supabase_client.table('courses').insert(course_data).execute()
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error saving course: {e}")
        return None

def save_module(module_data):
    """Save a module to the database"""
    try:
        # Ensure required fields are present
        required_fields = ["courseId", "dayNumber", "moduleNumber", "title"]
        for field in required_fields:
            if field not in module_data:
                print(f"Warning: Missing required field '{field}' in module data")
        
        response = supabase_client.table('modules').insert(module_data).execute()
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error saving module: {e}")
        return None

def update_course(course_id, update_data):
    """Update a course in the database"""
    try:
        response = supabase_client.table('courses').update(update_data).eq('id', course_id).execute()
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error updating course: {e}")
        return None

def get_courses_by_user(user_id):
    """Get all courses for a specific user"""
    try:
        response = supabase_client.table('courses').select('*').eq('userId', user_id).execute()
        return response.data
    except Exception as e:
        print(f"Error getting courses for user: {e}")
        return []

def get_course_with_modules(course_id):
    """Get a course with all its modules"""
    try:
        # Get course
        course_response = supabase_client.table('courses').select('*').eq('id', course_id).execute()
        if not course_response.data:
            return None
        
        course = course_response.data[0]
        
        # Get modules for this course
        modules_response = supabase_client.table('modules').select('*').eq('courseId', course_id).order('dayNumber').order('moduleNumber').execute()
        course['modules'] = modules_response.data
        
        return course
    except Exception as e:
        print(f"Error getting course with modules: {e}")
        return None 

def save_topic(topic_data):
    """Save a topic to the database"""
    try:
        required_fields = ["moduleId", "title", "content", "order"]
        for field in required_fields:
            if field not in topic_data:
                print(f"Warning: Missing required field '{field}' in topic data")
        
        response = supabase_client.table('topics').insert(topic_data).execute()
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error saving topic: {e}")
        return None

def save_video(video_data):
    """Save a video to the database"""
    try:
        required_fields = ["title"]
        for field in required_fields:
            if field not in video_data:
                print(f"Warning: Missing required field '{field}' in video data")
        
        response = supabase_client.table('videos').insert(video_data).execute()
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error saving video: {e}")
        return None

def save_assessment(assessment_data):
    """Save an assessment to the database"""
    try:
        required_fields = ["moduleId", "type", "title", "questions", "correct_answers"]
        for field in required_fields:
            if field not in assessment_data:
                print(f"Warning: Missing required field '{field}' in assessment data")
        
        response = supabase_client.table('assessments').insert(assessment_data).execute()
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error saving assessment: {e}")
        return None

def save_learning_analytics(analytics_data):
    """Save learning analytics to the database"""
    try:
        required_fields = ["userId", "event_type"]
        for field in required_fields:
            if field not in analytics_data:
                print(f"Warning: Missing required field '{field}' in analytics data")
        
        response = supabase_client.table('learning_analytics').insert(analytics_data).execute()
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error saving learning analytics: {e}")
        return None

def save_enrollment(enrollment_data):
    """Save an enrollment to the database"""
    try:
        required_fields = ["userId", "courseId"]
        for field in required_fields:
            if field not in enrollment_data:
                print(f"Warning: Missing required field '{field}' in enrollment data")
        
        response = supabase_client.table('enrollments').insert(enrollment_data).execute()
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error saving enrollment: {e}")
        return None

def save_progress(progress_data):
    """Save progress to the database"""
    try:
        required_fields = ["userId", "courseId", "status"]
        for field in required_fields:
            if field not in progress_data:
                print(f"Warning: Missing required field '{field}' in progress data")
        
        response = supabase_client.table('progress').insert(progress_data).execute()
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error saving progress: {e}")
        return None

def save_bookmark(bookmark_data):
    """Save a bookmark to the database"""
    try:
        required_fields = ["userId"]
        for field in required_fields:
            if field not in bookmark_data:
                print(f"Warning: Missing required field '{field}' in bookmark data")
        
        response = supabase_client.table('bookmarks').insert(bookmark_data).execute()
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error saving bookmark: {e}")
        return None

def get_course_with_all_data(course_id):
    """Get a course with all related data (modules, topics, videos, assessments)"""
    try:
        # Get course
        course_response = supabase_client.table('courses').select('*').eq('id', course_id).execute()
        if not course_response.data:
            return None
        
        course = course_response.data[0]
        
        # Get modules for this course
        modules_response = supabase_client.table('modules').select('*').eq('courseId', course_id).order('dayNumber').order('moduleNumber').execute()
        course['modules'] = modules_response.data
        
        # Get topics for each module
        for module in course['modules']:
            topics_response = supabase_client.table('topics').select('*').eq('moduleId', module['id']).order('order').execute()
            module['topics'] = topics_response.data
        
        # Get videos for this course
        videos_response = supabase_client.table('videos').select('*').eq('moduleId', 
            [module['id'] for module in course['modules']]
        ).execute()
        course['videos'] = videos_response.data
        
        # Get assessments for this course
        assessments_response = supabase_client.table('assessments').select('*').eq('moduleId', 
            [module['id'] for module in course['modules']]
        ).execute()
        course['assessments'] = assessments_response.data
        
        return course
    except Exception as e:
        print(f"Error getting course with all data: {e}")
        return None 