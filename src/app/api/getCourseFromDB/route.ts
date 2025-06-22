import { NextResponse, NextRequest } from "next/server";
import { createClient } from '@supabase/supabase-js';

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

    const { courseId, userId } = await req.json();

    if (!courseId) {
      return NextResponse.json({ 
        success: false, 
        message: "Course ID is required" 
      }, { status: 400 });
    }

    // Fetch course with all related data
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(`
        *,
        modules (
          *,
          videos (*),
          topics (*),
          assessments (*)
        ),
        enrollments!enrollments_courseId_fkey (
          *,
          progress_percentage,
          current_module_id,
          status
        )
      `)
      .eq('id', courseId)
      .single();

    if (courseError) {
      console.error('Error fetching course:', courseError);
      return NextResponse.json({ 
        success: false, 
        message: "Course not found",
        error: courseError.message 
      }, { status: 404 });
    }

    // Fetch user progress if userId provided
    let userProgress = null;
    if (userId) {
      const { data: progress } = await supabase
        .from('progress')
        .select('*')
        .eq('courseId', courseId)
        .eq('userId', userId);
      
      userProgress = progress || [];

      // Update last accessed time
      await supabase
        .from('progress')
        .upsert({
          userId,
          courseId,
          last_accessed: new Date().toISOString()
        });
    }

    // Organize modules by day
    const modulesByDay: { [key: string]: any[] } = {};
    
    if (course.modules) {
      course.modules.forEach((module: any) => {
        const dayKey = `Day ${module.dayNumber}`;
        if (!modulesByDay[dayKey]) {
          modulesByDay[dayKey] = [];
        }
        
        // Add videos and other content to module
        const moduleWithContent = {
          ...module,
          videos: module.videos || [],
          topics: module.topics || [],
          assessments: module.assessments || [],
          progress: userProgress?.find((p: any) => p.moduleId === module.id) || null
        };
        
        modulesByDay[dayKey].push(moduleWithContent);
      });
    }

    // Sort modules within each day by moduleNumber
    Object.keys(modulesByDay).forEach(day => {
      modulesByDay[day].sort((a, b) => a.moduleNumber - b.moduleNumber);
    });

    // Calculate overall progress
    let overallProgress = 0;
    if (userProgress && userProgress.length > 0) {
      const completedModules = userProgress.filter((p: any) => p.status === 'completed').length;
      const totalModules = course.modules?.length || 1;
      overallProgress = (completedModules / totalModules) * 100;
    }

    // Enhanced response structure
    const enhancedCourse = {
      id: course.id,
      name: course.courseName,
      domain: course.domain,
      subtopics: course.subtopics,
      numberOfDays: course.numberOfDays,
      difficulty_level: course.difficulty_level,
      estimated_hours: course.estimated_hours,
      Introduction: course.Introduction,
      structure: course.structure,
      YouTubeReferences: course.YouTubeReferences || [],
      ReferenceBooks: course.ReferenceBooks || [],
      tags: course.tags || [],
      category: course.category,
      rating: course.rating,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      
      // Enhanced data
      modulesByDay,
      totalModules: course.modules?.length || 0,
      userProgress: userProgress || [],
      overallProgress,
      enrollment: course.enrollments?.[0] || null,
      
      // Legacy structure for backward compatibility
      modules: course.modules || [],
      ...generateLegacyDayStructure(modulesByDay)
    };

    return NextResponse.json({
      success: true,
      course: enhancedCourse,
      message: "Course fetched successfully"
    });

  } catch (error) {
    console.error('Error in getCourseFromDB:', error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// Generate legacy day structure for backward compatibility
function generateLegacyDayStructure(modulesByDay: { [key: string]: any[] }) {
  const legacyStructure: { [key: string]: string[] } = {};
  
  Object.keys(modulesByDay).forEach(day => {
    legacyStructure[day] = modulesByDay[day].map((module, index) => 
      `Module ${index + 1}: ${module.title}`
    );
  });
  
  return legacyStructure;
}

// GET method for direct URL access
export async function GET(req: NextRequest) {
  // Initialize Supabase client inside the function to avoid build-time errors
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ 
      success: false, 
      message: "Supabase configuration is missing" 
    }, { status: 500 });
  }

  const url = new URL(req.url);
  const courseId = url.searchParams.get('courseId');
  const userId = url.searchParams.get('userId');

  if (!courseId) {
    return NextResponse.json({ 
      success: false, 
      message: "Course ID is required" 
    }, { status: 400 });
  }

  // Redirect to POST method
  return POST(new NextRequest(req.url, {
    method: 'POST',
    body: JSON.stringify({ courseId, userId }),
    headers: { 'Content-Type': 'application/json' }
  }));
} 