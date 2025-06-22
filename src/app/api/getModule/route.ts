import { NextResponse, NextRequest } from "next/server";
import { createClient } from '@supabase/supabase-js';

async function generateModuleContent(moduleTitle: string, courseName: string) {
  try {
    const url = "http://127.0.0.1:6000/v1/course-genration-module";
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        module_title: moduleTitle,
        course_name: courseName
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.data; // The HTML content
    } else {
      console.error("AI server returned error:", response.status);
      return generateFallbackContent(moduleTitle, courseName);
    }
  } catch (error) {
    console.error("Error calling AI server:", error);
    return generateFallbackContent(moduleTitle, courseName);
  }
}

function generateFallbackContent(moduleTitle: string, courseName: string): string {
  return `
    <div class="module-content">
      <h1 style="color: #8678F9; font-size: 2rem; margin-bottom: 1rem;">${moduleTitle}</h1>
      
      <hr style="border: 2px solid #8678F9; border-radius: 5px; margin: 1rem 0;">
      
      <h2 style="color: #8678F9; font-size: 1.5rem; margin: 1rem 0;">Module Overview</h2>
      <p style="color: white; line-height: 1.6;">
        Welcome to the ${moduleTitle} module of the ${courseName} course. This module is designed to provide you with comprehensive knowledge and practical skills.
      </p>
      
      <h2 style="color: #8678F9; font-size: 1.5rem; margin: 1rem 0;">Learning Objectives</h2>
      <ul style="color: white; line-height: 1.6;">
        <li>Understand the fundamental concepts of ${moduleTitle}</li>
        <li>Apply theoretical knowledge to solve practical problems</li>
        <li>Develop critical thinking and analytical skills</li>
        <li>Gain hands-on experience through exercises</li>
      </ul>
      
      <hr style="border: 2px solid #8678F9; border-radius: 5px; margin: 1rem 0;">
      
      <h2 style="color: #8678F9; font-size: 1.5rem; margin: 1rem 0;">Key Concepts</h2>
      <p style="color: white; line-height: 1.6;">
        This section covers the essential concepts that form the foundation of ${moduleTitle}. Understanding these concepts is crucial for mastering the subject matter.
      </p>
      
      <h3 style="color: #8678F9; font-size: 1.2rem; margin: 0.5rem 0;">Core Principles</h3>
      <p style="color: white; line-height: 1.6;">
        The fundamental principles that govern ${moduleTitle} and their practical implications.
      </p>
      
      <h3 style="color: #8678F9; font-size: 1.2rem; margin: 0.5rem 0;">Practical Applications</h3>
      <p style="color: white; line-height: 1.6;">
        Real-world applications and use cases where ${moduleTitle} concepts are applied effectively.
      </p>
      
      <hr style="border: 2px solid #8678F9; border-radius: 5px; margin: 1rem 0;">
      
      <h2 style="color: #8678F9; font-size: 1.5rem; margin: 1rem 0;">Interactive Learning</h2>
      <p style="color: white; line-height: 1.6;">
        Engage with the following activities to reinforce your understanding:
      </p>
      
      <div style="background-color: rgba(255, 255, 255, 0.1); padding: 1rem; border-radius: 5px; margin: 1rem 0;">
        <h4 style="color: #8678F9; margin-bottom: 0.5rem;">Practice Exercise</h4>
        <p style="color: white; line-height: 1.6;">
          Apply the concepts learned in ${moduleTitle} to solve a practical problem or complete a hands-on activity.
        </p>
      </div>
      
      <hr style="border: 2px solid #8678F9; border-radius: 5px; margin: 1rem 0;">
      
      <h2 style="color: #8678F9; font-size: 1.5rem; margin: 1rem 0;">Module Summary</h2>
      <p style="color: white; line-height: 1.6;">
        In this module, we have explored the key aspects of ${moduleTitle}. You should now have a solid understanding of the core concepts and be prepared to apply this knowledge in practical scenarios.
      </p>
      
      <h3 style="color: #8678F9; font-size: 1.2rem; margin: 0.5rem 0;">Next Steps</h3>
      <p style="color: white; line-height: 1.6;">
        Continue to the next module to build upon these concepts and explore more advanced topics in ${courseName}.
      </p>
    </div>
  `;
}

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

    const { courseId, dayNumber, moduleNumber, userId } = await req.json();

    if (!courseId || !dayNumber || !moduleNumber) {
      return NextResponse.json({ 
        success: false,
        message: "Missing required parameters: courseId, dayNumber, moduleNumber" 
      }, { status: 400 });
    }

    // Fetch module from database
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select(`
        *,
        videos (*),
        topics (*),
        assessments (*),
        courses!modules_courseId_fkey (courseName, domain)
      `)
      .eq('courseId', courseId)
      .eq('dayNumber', parseInt(dayNumber))
      .eq('moduleNumber', parseInt(moduleNumber))
      .single();

    if (moduleError && moduleError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching module:', moduleError);
      return NextResponse.json({ 
        success: false,
        message: "Error fetching module",
        error: moduleError.message 
      }, { status: 500 });
    }

    let moduleContent = '';
    let moduleTitle = '';
    let courseName = '';
    let videos: any[] = [];
    let topics: any[] = [];
    let assessments: any[] = [];

    if (module) {
      // Module exists in database
      moduleTitle = module.title;
      courseName = module.courses?.courseName || 'Course';
      videos = module.videos || [];
      topics = module.topics || [];
      assessments = module.assessments || [];

      // Check if content exists
      if (module.content_html) {
        moduleContent = module.content_html;
      } else if (module.content) {
        // Convert plain text content to HTML
        moduleContent = `
          <div class="module-content">
            <h1 style="color: #8678F9; font-size: 2rem; margin-bottom: 1rem;">${moduleTitle}</h1>
            <div style="color: white; line-height: 1.6; white-space: pre-wrap;">${module.content}</div>
          </div>
        `;
      } else {
        // Generate new content using AI
        moduleContent = await generateModuleContent(moduleTitle, courseName);
        
        // Save generated content back to database
        await supabase
          .from('modules')
          .update({ content_html: moduleContent })
          .eq('id', module.id);
      }
    } else {
      // Module doesn't exist, need to fetch course info and create it
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('courseName, domain, structure')
        .eq('id', courseId)
        .single();

      if (courseError) {
        return NextResponse.json({ 
          success: false,
          message: "Course not found" 
        }, { status: 404 });
      }

      courseName = course.courseName;
      
      // Try to get module title from course structure
      const structure = course.structure;
      const dayKey = `Day ${dayNumber}`;
      
      if (structure && structure[dayKey] && structure[dayKey][moduleNumber - 1]) {
        const moduleText = structure[dayKey][moduleNumber - 1];
        moduleTitle = moduleText.includes(':') 
          ? moduleText.split(':').slice(1).join(':').trim()
          : moduleText;
      } else {
        moduleTitle = `Module ${moduleNumber}`;
      }

      // Generate content
      moduleContent = await generateModuleContent(moduleTitle, courseName);

      // Create module in database
      const { data: newModule, error: createError } = await supabase
        .from('modules')
        .insert({
          courseId,
          dayNumber: parseInt(dayNumber),
          moduleNumber: parseInt(moduleNumber),
          title: moduleTitle,
          content_html: moduleContent,
          duration_minutes: 60,
          learning_objectives: [`Understand ${moduleTitle}`, 'Apply practical skills']
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating module:', createError);
      } else {
        console.log('Created new module:', newModule.id);
      }
    }

    // Update user progress if userId provided
    if (userId && module) {
      await supabase
        .from('progress')
        .upsert({
          userId,
          courseId,
          moduleId: module.id,
          status: 'in_progress',
          last_accessed: new Date().toISOString()
        });
    }

    // Enhanced response with all module data
    const response = {
      success: true,
      data: moduleContent,
      module: {
        id: module?.id,
        title: moduleTitle,
        dayNumber: parseInt(dayNumber),
        moduleNumber: parseInt(moduleNumber),
        description: module?.description,
        duration_minutes: module?.duration_minutes || 60,
        learning_objectives: module?.learning_objectives || [],
        videos: videos.map(video => ({
          id: video.id,
          title: video.title,
          description: video.description,
          youtube_url: video.youtube_url,
          youtube_video_id: extractYouTubeVideoId(video.youtube_url),
          thumbnail_url: video.thumbnail_url || generateYouTubeThumbnail(video.youtube_url),
          duration_seconds: video.duration_seconds,
          tags: video.tags
        })),
        topics: topics,
        assessments: assessments
      },
      course: {
        name: courseName,
        id: courseId
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in getModule:', error);
    return NextResponse.json({ 
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function generateYouTubeThumbnail(url: string): string | null {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
}



