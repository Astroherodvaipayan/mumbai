import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Mock course for React Development Masterclass
const reactMasterclassCourse = {
  id: 'react-masterclass-2024',
  courseName: 'React Development Masterclass',
  domain: 'Web Development',
  numberOfDays: 5,
  estimatedHours: 20,
  difficulty: 'beginner',
  createdAt: '2024-01-10T00:00:00Z',
  progress: 30
};

// Force dynamic rendering to prevent caching and ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('=== COURSES API ===');
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Missing Supabase configuration, returning only React Masterclass');
      return NextResponse.json({
        success: true,
        courses: [reactMasterclassCourse],
        message: 'Supabase config missing, showing demo course only'
      });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch courses from database
    const { data: dbCourses, error: fetchError } = await supabase
      .from('courses')
      .select(`
        id,
        courseName,
        domain,
        numberOfDays,
        estimated_hours,
        difficulty_level,
        createdAt,
        userId,
        Archive
      `)
      .or('Archive.eq.0,Archive.is.null')
      .order('createdAt', { ascending: false });

    console.log('Database query result:', {
      coursesFound: dbCourses?.length || 0,
      error: fetchError
    });

    let transformedCourses = [];

    if (fetchError) {
      console.error('Primary query failed:', fetchError);
      
      // Try alternative query without Archive filter
      const { data: allCourses, error: altError } = await supabase
        .from('courses')
        .select(`
          id,
          courseName,
          domain,
          numberOfDays,
          estimated_hours,
          difficulty_level,
          createdAt,
          userId
        `)
        .order('createdAt', { ascending: false });
      
      if (altError) {
        console.error('Alternative query also failed:', altError);
        return NextResponse.json({
          success: true,
          courses: [reactMasterclassCourse],
          message: 'Database queries failed, showing demo course only',
          error: altError
        });
      }
      
      transformedCourses = allCourses?.map(course => ({
        id: course.id,
        courseName: course.courseName,
        domain: course.domain,
        numberOfDays: course.numberOfDays,
        estimatedHours: course.estimated_hours || 0,
        difficulty: course.difficulty_level || 'beginner',
        createdAt: course.createdAt,
        userId: course.userId,
        progress: Math.floor(Math.random() * 100) // Mock progress
      })) || [];
    } else {
      transformedCourses = dbCourses?.map(course => ({
        id: course.id,
        courseName: course.courseName,
        domain: course.domain,
        numberOfDays: course.numberOfDays,
        estimatedHours: course.estimated_hours || 0,
        difficulty: course.difficulty_level || 'beginner',
        createdAt: course.createdAt,
        userId: course.userId,
        progress: Math.floor(Math.random() * 100) // Mock progress
      })) || [];
    }

    // Always include React Masterclass at the beginning
    const allCourses = [reactMasterclassCourse, ...transformedCourses];
    
    console.log('Returning courses:', allCourses.length);

    // Create response with cache-busting headers
    const response = NextResponse.json({
      success: true,
      courses: allCourses,
      message: `Successfully fetched ${allCourses.length} courses`,
      timestamp: new Date().toISOString() // Add timestamp for freshness verification
    });

    // Add headers to prevent caching and ensure fresh data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    return response;

  } catch (error) {
    console.error('Courses API error:', error);
    return NextResponse.json({
      success: false,
      courses: [reactMasterclassCourse],
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Error occurred, returning demo course only'
    }, { status: 500 });
  }
} 