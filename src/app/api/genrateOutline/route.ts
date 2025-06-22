import { NextRequest, NextResponse } from "next/server";
import { GENRATE_OUTLINE } from "../../../../promt";
import { client } from "../../../../genAI";
import { ModuleCreator } from "@/lib/jsonParser";
import { updatePinecone } from "@/lib/pineconeDB";
import { getUserById, updateUserCredit } from "@/lib/user-store";
import { createClient } from '@supabase/supabase-js';

// Helper function to initialize Supabase client
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('⚠️ Supabase environment variables not configured');
    console.log('📝 Missing:', {
      SUPABASE_URL: !supabaseUrl,
      SUPABASE_SERVICE_ROLE_KEY: !supabaseServiceKey
    });
    return null;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase client initialized successfully');
    return supabase;
  } catch (error) {
    console.error('❌ Supabase initialization failed:', error);
    return null;
  }
};

interface CourseStructure {
  name: string;
  domain: string;
  subtopics: string[];
  numberofdays: number;
  difficulty_level?: string;
  estimated_hours?: number;
  Introduction: string[];
  learning_objectives?: string[];
  modules?: Array<{
    day: number;
    title: string;
    duration_minutes?: number;
    objectives?: string[];
  }>;
  YouTubeReferences: Array<{
    title: string;
    url: string;
    description?: string;
    duration?: string;
    level?: string;
    channel?: string;
  }>;
  ReferenceBooks: Array<{
    title: string;
    author: string;
    source: string;
  }>;
  assessments?: Array<{
    type: string;
    title: string;
    description: string;
  }>;
  projects?: Array<{
    title: string;
    description: string;
    estimated_hours: number;
  }>;
  tags?: string[];
  prerequisites?: string[];
  target_audience?: string[];
  [key: string]: any; // For Day 1, Day 2, etc.
}

// Mock course storage for fallback (in-memory storage)
const courses: any[] = [];

// File-based fallback storage for persistence
const storeInFileStorage = async (courseData: any, userId: string) => {
  try {
    console.log('💾 Attempting file-based storage as fallback...');
    
    const fs = await import('fs');
    const path = await import('path');
    
    const storageDir = path.join(process.cwd(), 'data', 'courses');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    
    const fileName = `course_${courseData.id}_${userId}.json`;
    const filePath = path.join(storageDir, fileName);
    
    // Add storage metadata
    const storageData = {
      ...courseData,
      stored_at: new Date().toISOString(),
      storage_method: 'file_fallback',
      file_path: filePath
    };
    
    fs.writeFileSync(filePath, JSON.stringify(storageData, null, 2));
    
    console.log('✅ Course saved to file storage:', filePath);
    return true;
    
  } catch (error: any) {
    console.error('❌ File storage also failed:', error.message);
    return false;
  }
};

// Alternative AI server connection using undici for better compatibility
const tryAIServerConnectionWithUndici = async (course: string, userId: string) => {
  try {
    console.log('🔄 Trying alternative connection method with undici...');
    
    // Dynamic import of undici for better compatibility
    const { request } = await import('undici');
    
    const baseUrl = 'http://127.0.0.1:6000';
    const inputText = `Generate a comprehensive course outline for: ${course}`;
    
    console.log(`📝 Attempting connection to ${baseUrl}/v1/course-genration-outline`);
    
    const response = await request(`${baseUrl}/v1/course-genration-outline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ input_text: inputText })
    });

    if (response.statusCode === 200) {
      const responseBody = await response.body.text();
      console.log('✅ Undici connection successful');
      console.log(`📝 Undici Response length: ${responseBody.length}`);
      console.log(`📝 Undici Response (first 500 chars): ${responseBody.substring(0, 500)}`);
      
      try {
        // First, try direct JSON parsing
        const data = JSON.parse(responseBody);
        console.log('✅ JSON parsing successful (direct)');
        
        // Add metadata
        data.id = Date.now().toString();
        data.success = true;
        data.message = "Course generated successfully using AI server (undici)";
        data.saved_to_database = false;
        data.using_ai = true;
        data.using_fallback = false;
        data.ai_server_url = baseUrl;
        data.user_id = userId;

        return data;
      } catch (parseError) {
        console.log('🔄 Direct JSON parsing failed, trying markdown extraction...');
        
        // Try to extract JSON from markdown code blocks
        const jsonMatch = responseBody.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            const data = JSON.parse(jsonMatch[1]);
            console.log('✅ Successfully extracted and parsed JSON from markdown (undici)');
            
            // Add metadata
            data.id = Date.now().toString();
            data.success = true;
            data.message = "Course generated successfully using AI server (undici, markdown extracted)";
            data.saved_to_database = false;
            data.using_ai = true;
            data.using_fallback = false;
            data.ai_server_url = baseUrl;
            data.user_id = userId;

            return data;
          } catch (markdownParseError: any) {
            console.error('❌ Failed to parse extracted JSON (undici):', markdownParseError);
          }
        } else {
          // Try to find JSON-like content without markdown
          const jsonStart = responseBody.indexOf('{');
          const jsonEnd = responseBody.lastIndexOf('}');
          
          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            const possibleJson = responseBody.substring(jsonStart, jsonEnd + 1);
            try {
              const data = JSON.parse(possibleJson);
              console.log('✅ Successfully parsed JSON from extracted content (undici)');
              
              // Add metadata
              data.id = Date.now().toString();
              data.success = true;
              data.message = "Course generated successfully using AI server (undici, content extracted)";
              data.saved_to_database = false;
              data.using_ai = true;
              data.using_fallback = false;
              data.ai_server_url = baseUrl;
              data.user_id = userId;

              return data;
            } catch (extractParseError: any) {
              console.error('❌ Failed to parse JSON from content extraction (undici):', extractParseError);
            }
          }
        }
        
        console.error('❌ All JSON parsing methods failed (undici):', parseError);
        return null;
      }
    } else {
      console.error(`❌ Undici request failed with status: ${response.statusCode}`);
      return null;
    }
  } catch (undiciError: any) {
    console.error('❌ Undici connection failed:', undiciError.message);
    return null;
  }
};

// Original AI server connection with enhanced debugging
const tryAIServerConnection = async (course: string, userId: string) => {
  const aiServerUrls = [
    'http://127.0.0.1:6000',
    'http://localhost:6000'
  ];

  for (const baseUrl of aiServerUrls) {
    try {
      console.log(`🔄 Attempting AI server connection to: ${baseUrl}/v1/course-genration-outline`);
      
      // First, test basic connectivity with a simple fetch
      try {
        console.log(`🏥 Testing basic connectivity to ${baseUrl}...`);
        const healthResponse = await fetch(`${baseUrl}/health`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        if (healthResponse.ok) {
          console.log(`✅ Health check passed for ${baseUrl}`);
        } else {
          console.log(`⚠️ Health check failed for ${baseUrl}: ${healthResponse.status}`);
          continue;
        }
      } catch (healthError: any) {
        console.error(`❌ Health check failed for ${baseUrl}:`, healthError.message);
        continue;
      }

      // Now try the actual course generation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      // Create the prompt in the format the AI server expects
      const inputText = `Generate a comprehensive course outline for: ${course}`;
      const requestBody = { input_text: inputText };

      console.log(`📝 Sending request to ${baseUrl}/v1/course-genration-outline`);

      const response = await fetch(`${baseUrl}/v1/course-genration-outline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'NextJS-API-Client/1.0'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📊 AI Server Response Status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        console.error(`❌ AI server responded with status: ${response.status}`);
        const errorText = await response.text();
        console.error(`❌ AI server error response: ${errorText.substring(0, 500)}...`);
        continue; // Try next URL
      }

      const responseText = await response.text();
      console.log(`📝 Raw AI Server Response length: ${responseText.length}`);
      console.log(`📝 Raw AI Server Response (first 500 chars): ${responseText.substring(0, 500)}`);
      
      // Try to parse as JSON, handling markdown code blocks
      let data;
      try {
        // First, try direct JSON parsing
        data = JSON.parse(responseText);
        console.log('✅ Successfully parsed AI server JSON response (direct)');
      } catch (parseError: any) {
        console.log('🔄 Direct JSON parsing failed, trying markdown extraction...');
        
        // Try to extract JSON from markdown code blocks
        const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            data = JSON.parse(jsonMatch[1]);
            console.log('✅ Successfully extracted and parsed JSON from markdown');
          } catch (markdownParseError: any) {
            console.error(`❌ Failed to parse extracted JSON: ${markdownParseError.message}`);
            continue;
          }
        } else {
          // Try to find JSON-like content without markdown
          const jsonStart = responseText.indexOf('{');
          const jsonEnd = responseText.lastIndexOf('}');
          
          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            const possibleJson = responseText.substring(jsonStart, jsonEnd + 1);
            try {
              data = JSON.parse(possibleJson);
              console.log('✅ Successfully parsed JSON from extracted content');
            } catch (extractParseError: any) {
              console.error(`❌ Failed to parse JSON from content extraction: ${extractParseError.message}`);
              console.error(`❌ Original parse error: ${parseError.message}`);
              continue;
            }
          } else {
            console.error(`❌ No valid JSON structure found in response`);
            console.error(`❌ Original parse error: ${parseError.message}`);
            continue;
          }
        }
      }

      // Validate response structure
      if (!data || typeof data !== 'object') {
        console.error('❌ AI response is not a valid object');
        continue;
      }

      // Add metadata to the response
      data.id = Date.now().toString();
      data.success = true;
      data.message = "Course generated successfully using AI server";
      data.saved_to_database = false;
      data.using_ai = true;
      data.using_fallback = false;
      data.ai_server_url = baseUrl;
      data.user_id = userId;

      console.log(`✅ Successfully connected to AI server at: ${baseUrl}`);
      return data;

    } catch (error: any) {
      console.error(`❌ AI server connection failed for ${baseUrl}:`, {
        error: error.message,
        name: error.name,
        code: error.code
      });
      continue; // Try next URL
    }
  }

  console.error('❌ All AI server connection attempts failed');
  return null;
};

// Enhanced course storage in Supabase
const storeCourseInSupabase = async (courseData: any, userId: string) => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.log('⚠️ Supabase not configured, skipping database storage');
    return false;
  }

  try {
    console.log('💾 Attempting to store course in Supabase...');
    console.log('🔍 Supabase Config Check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY || !!process.env.SUPABASE_ANON_KEY,
      supabaseClient: !!supabase
    });
    
    // Handle user ID - create UUID if needed
    let finalUserId = userId;
    
    // If no userId provided or it's 'anonymous', use demo user
    if (!userId || userId === 'anonymous') {
      finalUserId = '550e8400-e29b-41d4-a716-446655440000'; // Demo user UUID
    } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      // If userId is not a valid UUID, create one
      finalUserId = crypto.randomUUID();
      console.log(`🔄 Converting userId "${userId}" to UUID: ${finalUserId}`);
    }

    // Try to ensure user exists in database
    const { data: existingUser, error: userCheckError } = await supabase
      .from('User')
      .select('id')
      .eq('id', finalUserId)
      .single();

    if (userCheckError && userCheckError.code === 'PGRST116') {
      // User doesn't exist, create them
      console.log('🆕 Creating new user in database...');
      const { data: newUser, error: createUserError } = await supabase
        .from('User')
        .insert([{
          id: finalUserId,
          name: userId === 'anonymous' ? 'Demo User' : 'User',
          email: userId === 'anonymous' ? 'demo@learnaistudio.com' : `user-${finalUserId}@learnaistudio.com`,
          Credit: 5,
          emailVerified: new Date().toISOString()
        }])
        .select()
        .single();

      if (createUserError) {
        console.error('❌ Failed to create user:', createUserError);
        // Fall back to demo user
        finalUserId = '550e8400-e29b-41d4-a716-446655440000';
      } else {
        console.log('✅ User created successfully:', newUser?.id);
      }
    }
    
    // Prepare course data for storage matching the database schema
    const courseRecord = {
      id: crypto.randomUUID(), // Always generate a new UUID for courses
      userId: finalUserId,
      courseName: courseData.name || courseData.topic || 'Untitled Course',
      domain: courseData.domain || 'General',
      subtopics: courseData.subtopics || [],
      Introduction: Array.isArray(courseData.Introduction) 
        ? courseData.Introduction.join(' ') 
        : (courseData.Introduction || courseData.description || 'No description available'),
      numberOfDays: courseData.numberofdays || courseData.number_of_days || 5,
      ModuleCreated: 0,
      Archive: 0,
      structure: courseData, // Store full structure as JSON
      YouTubeReferences: courseData.YouTubeReferences || courseData.youtube_references || [],
      ReferenceBooks: courseData.ReferenceBooks || courseData.reference_books || [],
      difficulty_level: courseData.difficulty_level || 'beginner',
      estimated_hours: courseData.estimated_hours || 15,
      category: courseData.domain || 'General',
      tags: courseData.tags || [],
      is_public: false,
      rating: 0.0,
      completion_rate: 0.0
    };

    console.log('📋 Course record prepared:', {
      id: courseRecord.id,
      courseName: courseRecord.courseName,
      domain: courseRecord.domain,
      numberOfDays: courseRecord.numberOfDays,
      hasStructure: !!courseRecord.structure,
      userId: userId
    });

    // Check what tables exist in the database
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.error('❌ Error checking table existence:', tablesError);
      console.log('⚠️ Continuing without table check...');
    } else {
      console.log('📋 Available tables:', tables?.map((t: any) => t.table_name) || []);
      
      const coursesTables = tables?.filter((t: any) => 
        t.table_name.toLowerCase().includes('course') || 
        t.table_name.toLowerCase().includes('Course')
      );
      
      if (coursesTables && coursesTables.length > 0) {
        console.log('✅ Found course-related tables:', coursesTables.map((t: any) => t.table_name));
      } else {
        console.log('⚠️ No course-related tables found, will try generic insert...');
      }
    }

    // Try to insert the course record
    const { data, error } = await supabase
      .from('courses')
      .insert([courseRecord])
      .select();

    if (error) {
      console.error('❌ Supabase storage error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Check if it's a specific error we can handle
      if (error.code === '23505') {
        console.log('⚠️ Course with this ID already exists, trying with new ID...');
        courseRecord.id = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5);
        
        const { data: retryData, error: retryError } = await supabase
          .from('courses')
          .insert([courseRecord])
          .select();
          
        if (retryError) {
          console.error('❌ Retry insert failed:', retryError);
          return false;
        }
        
        console.log('✅ Course stored in Supabase successfully (with new ID):', retryData);
        return true;
      }
      
      return false;
    }

    console.log('✅ Course stored in Supabase successfully:', {
      insertedCount: data?.length || 0,
      courseId: data?.[0]?.id,
      courseName: data?.[0]?.courseName
    });
    return true;

  } catch (error: any) {
    console.error('❌ Supabase storage failed with exception:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    });
    return false;
  }
};

// Enhanced fallback course generation
const generateFallbackCourse = (courseTopic: string, userId: string) => {
  console.log('🔄 Generating enhanced fallback course...');
  
  const courseData = {
    "name": `Complete ${courseTopic} Course`,
    "domain": "General",
    "subtopics": [
      "Fundamentals",
      "Core Concepts", 
      "Advanced Topics",
      "Applications",
      "Projects"
    ],
    "numberofdays": 5,
    "difficulty_level": "beginner",
    "estimated_hours": 15,
    "Introduction": [
      `Welcome to the comprehensive ${courseTopic} course`,
      "This course will take you from beginner to intermediate level",
      "Hands-on exercises and real-world applications included"
    ],
    "learning_objectives": [
      `Master the fundamentals of ${courseTopic}`,
      "Apply concepts to real-world scenarios",
      "Build practical skills through projects"
    ],
    "modules": [
      {
        "day": 1,
        "title": "Introduction and Basics",
        "duration_minutes": 180,
        "objectives": [
          "Understand basics",
          "Get started with fundamentals"
        ]
      },
      {
        "day": 2,
        "title": "Core Concepts",
        "duration_minutes": 180,
        "objectives": [
          "Learn core principles",
          "Practice essential skills"
        ]
      },
      {
        "day": 3,
        "title": "Advanced Topics",
        "duration_minutes": 180,
        "objectives": [
          "Master advanced concepts",
          "Explore complex scenarios"
        ]
      },
      {
        "day": 4,
        "title": "Practical Applications",
        "duration_minutes": 180,
        "objectives": [
          "Apply knowledge practically",
          "Work on real projects"
        ]
      },
      {
        "day": 5,
        "title": "Projects and Assessment",
        "duration_minutes": 180,
        "objectives": [
          "Complete capstone projects",
          "Assess learning outcomes"
        ]
      }
    ],
    "YouTubeReferences": [
      {
        "title": `${courseTopic} Complete Tutorial`,
        "url": `https://www.youtube.com/results?search_query=${encodeURIComponent(courseTopic)}+complete+tutorial`,
        "description": `Comprehensive tutorial covering ${courseTopic}`,
        "duration": "30-45",
        "level": "Beginner",
        "channel": "Educational Channel"
      },
      {
        "title": `${courseTopic} Advanced Concepts`,
        "url": `https://www.youtube.com/results?search_query=${encodeURIComponent(courseTopic)}+advanced+concepts`,
        "description": `Advanced concepts and techniques in ${courseTopic}`,
        "duration": "45-60",
        "level": "Advanced", 
        "channel": "Educational Channel"
      },
      {
        "title": `${courseTopic} Practical Examples`,
        "url": `https://www.youtube.com/results?search_query=${encodeURIComponent(courseTopic)}+practical+examples`,
        "description": `Real-world examples and applications of ${courseTopic}`,
        "duration": "20-30",
        "level": "Intermediate",
        "channel": "Educational Channel"
      }
    ],
    "ReferenceBooks": [
      {
        "title": `${courseTopic} Fundamentals`,
        "author": "Expert Author",
        "source": `https://www.amazon.com/s?k=${encodeURIComponent(courseTopic)}+fundamentals`
      },
      {
        "title": `Advanced ${courseTopic}`,
        "author": "Industry Professional",
        "source": `https://www.amazon.com/s?k=advanced+${encodeURIComponent(courseTopic)}`
      }
    ],
    "assessments": [
      {
        "type": "quiz",
        "title": "Knowledge Check",
        "description": "Test your understanding of key concepts"
      },
      {
        "type": "project",
        "title": "Practical Application",
        "description": "Apply your knowledge in a real-world scenario"
      }
    ],
    "projects": [
      {
        "title": `${courseTopic} Practical Project`,
        "description": `Apply your ${courseTopic} skills in a real-world project`,
        "estimated_hours": 5
      }
    ],
    "tags": [
      courseTopic.toLowerCase(),
      "education",
      "course",
      "learning"
    ],
    "prerequisites": [
      "Basic computer literacy",
      "Internet access",
      "Willingness to learn"
    ],
    "target_audience": [
      "Students",
      "Professionals",
      "Enthusiasts"
    ],
    "Day 1": [
      "Module 1: Introduction and Overview",
      "Module 2: Basic Concepts and Terminology",
      "Module 3: Getting Started with Tools"
    ],
    "Day 2": [
      "Module 1: Core Theory and Principles",
      "Module 2: Key Methodologies",
      "Module 3: Problem Solving Techniques"
    ],
    "Day 3": [
      "Module 1: Advanced Techniques",
      "Module 2: Complex Applications",
      "Module 3: Best Practices and Standards"
    ],
    "Day 4": [
      "Module 1: Real-world Usage and Case Studies",
      "Module 2: Industry Applications",
      "Module 3: Practical Implementation"
    ],
    "Day 5": [
      "Module 1: Capstone Project Planning",
      "Module 2: Project Implementation",
      "Module 3: Review, Assessment, and Next Steps"
    ],
    "id": Date.now().toString(),
    "success": true,
    "message": "⚠️ AI server connection failed - using enhanced fallback",
    "saved_to_database": false,
    "using_ai": false,
    "using_fallback": true,
    "generated_at": new Date().toISOString(),
    "user_id": userId,
    "debug_info": {
      "fallback_reason": "AI server connection failed after multiple attempts",
      "timestamp": new Date().toISOString()
    }
  };

  return courseData;
};

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting course generation process...');
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    const { course, userId } = await request.json();
    
    if (!course || typeof course !== 'string' || course.trim().length === 0) {
      console.error('❌ Invalid course input');
      return NextResponse.json(
        { error: "Course topic is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    console.log(`📚 Generating course for topic: "${course}" (User: ${userId})`);

    // Step 1: Try undici connection first
    console.log('🔗 Step 1a: Attempting AI server connection with undici...');
    let courseData = await tryAIServerConnectionWithUndici(course, userId);
    
    // Step 1b: If undici fails, try regular fetch
    if (!courseData) {
      console.log('🔗 Step 1b: Trying regular fetch connection...');
      courseData = await tryAIServerConnection(course, userId);
    }
    
    if (courseData) {
      console.log('🤖 AI server connection successful - proceeding with AI-generated content');
      
      // Step 2: Try to store in Supabase, then file fallback
      console.log('💾 Step 2: Attempting to store in Supabase...');
      const storedInSupabase = await storeCourseInSupabase(courseData, userId);
      
      if (storedInSupabase) {
        courseData.saved_to_database = true;
        courseData.storage_method = "supabase";
        courseData.message = "Course generated by AI and saved to database successfully";
        console.log('✅ Course generation and storage complete');
      } else {
        // Try file storage as fallback
        console.log('💾 Step 2b: Trying file storage fallback...');
        const storedInFile = await storeInFileStorage(courseData, userId);
        
        if (storedInFile) {
          courseData.saved_to_database = true;
          courseData.storage_method = "file_fallback";
          courseData.message = "Course generated by AI and saved to file storage";
          console.log('✅ Course saved to file storage as fallback');
        } else {
          courseData.saved_to_database = false;
          courseData.storage_method = "none";
          courseData.message = "Course generated by AI successfully (storage failed)";
          console.log('⚠️ Course generated but all storage methods failed');
        }
      }
      
      console.log('🎯 Returning AI-generated course data');
      return NextResponse.json(courseData);
    }

    // Step 3: Use enhanced fallback if AI server is unavailable
    console.log('🔄 Step 3: AI server unavailable, using enhanced fallback...');
    courseData = generateFallbackCourse(course, userId);
    
    // Try to store fallback course in Supabase, then file storage
    console.log('💾 Attempting to store fallback course in Supabase...');
    const storedInSupabase = await storeCourseInSupabase(courseData, userId);
    
    if (storedInSupabase) {
      courseData.saved_to_database = true;
      courseData.storage_method = "supabase";
      courseData.message = "Course generated with fallback and saved to database";
    } else {
      console.log('💾 Trying file storage for fallback course...');
      const storedInFile = await storeInFileStorage(courseData, userId);
      
      if (storedInFile) {
        courseData.saved_to_database = true;
        courseData.storage_method = "file_fallback";
        courseData.message = "Course generated with fallback and saved to file storage";
      } else {
        courseData.saved_to_database = false;
        courseData.storage_method = "none";
      }
    }

    console.log('📋 Fallback course generation complete');
    return NextResponse.json(courseData);

  } catch (error: any) {
    console.error('❌ Course generation failed:', error);
    
    return NextResponse.json(
      {
        error: "Failed to generate course",
        details: error.message,
        success: false,
        using_ai: false,
        using_fallback: false,
        saved_to_database: false
      },
      { status: 500 }
    );
  }
}

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;



