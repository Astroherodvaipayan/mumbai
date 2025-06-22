import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    console.log('=== DEBUG COURSES API ===');
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('Environment check:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing');
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase environment variables',
        details: {
          supabaseUrl: supabaseUrl ? 'Present' : 'Missing',
          supabaseAnonKey: supabaseAnonKey ? 'Present' : 'Missing'
        }
      });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client created');

    // Test the exact query from the courses page
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

    console.log('Database query result:');
    console.log('- Courses found:', dbCourses?.length || 0);
    console.log('- Error:', fetchError);

    if (fetchError) {
      console.error('Primary query failed:', fetchError);
      
      // Try alternative query
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
      
      console.log('Alternative query result:');
      console.log('- Courses found:', allCourses?.length || 0);
      console.log('- Error:', altError);
      
      return NextResponse.json({
        success: !altError,
        primaryQuery: {
          error: fetchError,
          courses: 0
        },
        alternativeQuery: {
          error: altError,
          courses: allCourses?.length || 0,
          sampleCourses: allCourses?.slice(0, 3) || []
        }
      });
    }

    return NextResponse.json({
      success: true,
      courses: dbCourses?.length || 0,
      sampleCourses: dbCourses?.slice(0, 3) || [],
      message: 'Courses fetched successfully from API'
    });

  } catch (error) {
    console.error('Debug courses API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 });
  }
} 