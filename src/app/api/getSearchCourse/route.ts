import { createClient } from '@supabase/supabase-js';
import { NextResponse, NextRequest } from "next/server";

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    // Initialize Supabase client inside the function to avoid build-time errors
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        success: false, 
        message: "Supabase configuration is missing" 
      }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const data = await req.json();
    
    if (!data.courseId) {
      return NextResponse.json({ 
        success: false, 
        message: "Course ID is required" 
      }, { status: 400 });
    }
    
    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', data.courseId)
      .single();

    if (error) {
      console.error('Error fetching course:', error);
      return NextResponse.json({ 
        success: false, 
        message: "Course not found",
        error: error.message 
      }, { status: 404 });
    }

    return NextResponse.json(course, { status: 200 });
    
  } catch (error) {
    console.error('Error in getSearchCourse:', error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
