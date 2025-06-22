import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Mock data for React Development Masterclass
const reactMasterclassMockData = {
  course: {
    id: 'react-masterclass-2024',
    courseName: 'React Development Masterclass',
    domain: 'Web Development',
    Introduction: 'Master modern React development from basics to advanced concepts. Build real-world applications with confidence.',
    numberOfDays: 5,
    difficulty_level: 'beginner',
    estimated_hours: 20,
    instructor_name: 'Sarah Johnson',
    course_objectives: [
      'Master React fundamentals and modern patterns',
      'Build interactive user interfaces',
      'Implement state management solutions',
      'Deploy React applications to production',
      'Write comprehensive tests for React apps'
    ],
    prerequisites: ['Basic JavaScript knowledge', 'HTML & CSS fundamentals', 'Node.js installed'],
    certificate_available: true,
    rating: 4.9,
    tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
    createdAt: '2024-01-10T00:00:00Z',
    progress_percentage: 30,
    total_lessons: 15,
    completed_lessons: 4,
    current_day: 2
  },
  enrollment: {
    progress_percentage: 30,
    total_time_spent_minutes: 240,
    total_points_earned: 120,
    status: 'in_progress'
  },
  days: [
    {
      id: 'day-1',
      day_number: 1,
      title: 'React Fundamentals',
      description: 'Learn the basics of React including components, JSX, and props',
      learning_objectives: [
        'Understand React components',
        'Learn JSX syntax',
        'Master props and state',
        'Create your first React app'
      ],
      duration_minutes: 180,
      is_locked: false,
      completed: true,
      progress_percentage: 100,
      day_lessons: [
        {
          id: 'lesson-1-1',
          lesson_number: 1,
          title: 'What is React?',
          description: 'Introduction to React and its ecosystem',
          lesson_type: 'video',
          duration_minutes: 45,
          points: 20,
          completed: true,
          in_progress: false,
          progress_percentage: 100,
          time_spent: 45,
          points_earned: 20,
          last_accessed: '2024-01-15T10:00:00Z',
          notes: '',
          videos: [
            {
              id: 'video-1-1',
              title: 'React Introduction',
              description: 'Getting started with React',
              youtube_url: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
              youtube_video_id: 'SqcY0GlETPk',
              duration_seconds: 2700,
              channel_name: 'React Official',
              thumbnail_url: 'https://i.ytimg.com/vi/SqcY0GlETPk/maxresdefault.jpg',
              completed: true
            }
          ],
          assessments: []
        },
        {
          id: 'lesson-1-2',
          lesson_number: 2,
          title: 'JSX and Components',
          description: 'Understanding JSX syntax and creating components',
          lesson_type: 'video',
          duration_minutes: 60,
          points: 25,
          completed: true,
          in_progress: false,
          progress_percentage: 100,
          time_spent: 60,
          points_earned: 25,
          last_accessed: '2024-01-15T11:00:00Z',
          notes: '',
          videos: [
            {
              id: 'video-1-2',
              title: 'JSX and Components Deep Dive',
              description: 'Master JSX and component creation',
              youtube_url: 'https://www.youtube.com/watch?v=DLX62G4lc44',
              youtube_video_id: 'DLX62G4lc44',
              duration_seconds: 3600,
              channel_name: 'React Tutorials',
              thumbnail_url: 'https://i.ytimg.com/vi/DLX62G4lc44/maxresdefault.jpg',
              completed: true
            }
          ],
          assessments: []
        }
      ]
    },
    {
      id: 'day-2',
      day_number: 2,
      title: 'State Management',
      description: 'Learn how to manage state in React applications',
      learning_objectives: [
        'Understand useState hook',
        'Learn useEffect for side effects',
        'Master conditional rendering',
        'Handle user events'
      ],
      duration_minutes: 200,
      is_locked: false,
      completed: false,
      progress_percentage: 50,
      day_lessons: [
        {
          id: 'lesson-2-1',
          lesson_number: 1,
          title: 'useState Hook',
          description: 'Managing component state with useState',
          lesson_type: 'video',
          duration_minutes: 50,
          points: 30,
          completed: true,
          in_progress: false,
          progress_percentage: 100,
          time_spent: 50,
          points_earned: 30,
          last_accessed: '2024-01-16T10:00:00Z',
          notes: '',
          videos: [
            {
              id: 'video-2-1',
              title: 'useState Hook Explained',
              description: 'Complete guide to useState',
              youtube_url: 'https://www.youtube.com/watch?v=O6P86uwfdR0',
              youtube_video_id: 'O6P86uwfdR0',
              duration_seconds: 3000,
              channel_name: 'React Hooks',
              thumbnail_url: 'https://i.ytimg.com/vi/O6P86uwfdR0/maxresdefault.jpg',
              completed: true
            }
          ],
          assessments: []
        },
        {
          id: 'lesson-2-2',
          lesson_number: 2,
          title: 'useEffect Hook',
          description: 'Side effects and lifecycle with useEffect',
          lesson_type: 'video',
          duration_minutes: 55,
          points: 30,
          completed: true,
          in_progress: false,
          progress_percentage: 100,
          time_spent: 55,
          points_earned: 30,
          last_accessed: '2024-01-16T11:00:00Z',
          notes: '',
          videos: [
            {
              id: 'video-2-2',
              title: 'useEffect Hook Deep Dive',
              description: 'Master useEffect for side effects',
              youtube_url: 'https://www.youtube.com/watch?v=0ZJgIjIuY7U',
              youtube_video_id: '0ZJgIjIuY7U',
              duration_seconds: 3300,
              channel_name: 'React Advanced',
              thumbnail_url: 'https://i.ytimg.com/vi/0ZJgIjIuY7U/maxresdefault.jpg',
              completed: true
            }
          ],
          assessments: []
        },
        {
          id: 'lesson-2-3',
          lesson_number: 3,
          title: 'Event Handling',
          description: 'Handling user interactions and events',
          lesson_type: 'video',
          duration_minutes: 45,
          points: 25,
          completed: false,
          in_progress: true,
          progress_percentage: 30,
          time_spent: 15,
          points_earned: 0,
          last_accessed: '2024-01-17T09:00:00Z',
          notes: '',
          videos: [
            {
              id: 'video-2-3',
              title: 'Event Handling in React',
              description: 'Handle user interactions effectively',
              youtube_url: 'https://www.youtube.com/watch?v=Znqv84xi8Vs',
              youtube_video_id: 'Znqv84xi8Vs',
              duration_seconds: 2700,
              channel_name: 'React Events',
              thumbnail_url: 'https://i.ytimg.com/vi/Znqv84xi8Vs/maxresdefault.jpg',
              completed: false
            }
          ],
          assessments: []
        }
      ]
    },
    {
      id: 'day-3',
      day_number: 3,
      title: 'React Router & Navigation',
      description: 'Build single-page applications with React Router',
      learning_objectives: [
        'Set up React Router',
        'Create navigation menus',
        'Handle route parameters',
        'Implement protected routes'
      ],
      duration_minutes: 180,
      is_locked: false,
      completed: false,
      progress_percentage: 0,
      day_lessons: [
        {
          id: 'lesson-3-1',
          lesson_number: 1,
          title: 'React Router Basics',
          description: 'Setting up routing in React applications',
          lesson_type: 'video',
          duration_minutes: 60,
          points: 30,
          completed: false,
          in_progress: false,
          progress_percentage: 0,
          time_spent: 0,
          points_earned: 0,
          last_accessed: null,
          notes: '',
          videos: [
            {
              id: 'video-3-1',
              title: 'React Router Tutorial',
              description: 'Complete guide to React Router',
              youtube_url: 'https://www.youtube.com/watch?v=Law7wfdg_ls',
              youtube_video_id: 'Law7wfdg_ls',
              duration_seconds: 3600,
              channel_name: 'React Router Guide',
              thumbnail_url: 'https://i.ytimg.com/vi/Law7wfdg_ls/maxresdefault.jpg',
              completed: false
            }
          ],
          assessments: []
        }
      ]
    },
    {
      id: 'day-4',
      day_number: 4,
      title: 'Advanced React Patterns',
      description: 'Learn advanced React patterns and best practices',
      learning_objectives: [
        'Master custom hooks',
        'Implement context API',
        'Use render props pattern',
        'Optimize performance'
      ],
      duration_minutes: 220,
      is_locked: true,
      completed: false,
      progress_percentage: 0,
      day_lessons: []
    },
    {
      id: 'day-5',
      day_number: 5,
      title: 'Testing & Deployment',
      description: 'Test and deploy your React applications',
      learning_objectives: [
        'Write unit tests',
        'Test React components',
        'Deploy to production',
        'Performance optimization'
      ],
      duration_minutes: 200,
      is_locked: true,
      completed: false,
      progress_percentage: 0,
      day_lessons: []
    }
  ],
  stats: {
    total_days: 5,
    completed_days: 1,
    total_lessons: 15,
    completed_lessons: 4,
    overall_progress: 30,
    total_points_available: 400,
    total_duration_minutes: 1000
  }
};

// Function to generate mock course structure from database course
function generateMockCourseStructure(course: any) {
  const numberOfDays = course.numberOfDays || 3;
  const lessonsPerDay = 3;
  const totalLessons = numberOfDays * lessonsPerDay;
  const mockProgress = Math.floor(Math.random() * 80) + 10; // 10-90% progress
  
  // Parse structure if it exists
  let courseStructure = null;
  try {
    if (course.structure && typeof course.structure === 'string') {
      courseStructure = JSON.parse(course.structure);
    }
  } catch (e) {
    console.error('Error parsing course structure:', e);
  }

  // Parse YouTube references if they exist
  let youtubeRefs = [];
  try {
    if (course.YouTubeReferences && typeof course.YouTubeReferences === 'string') {
      youtubeRefs = JSON.parse(course.YouTubeReferences);
      console.log('Parsed YouTube references:', youtubeRefs);
    } else if (Array.isArray(course.YouTubeReferences)) {
      youtubeRefs = course.YouTubeReferences;
      console.log('Using array YouTube references:', youtubeRefs);
    }
  } catch (e) {
    console.error('Error parsing YouTube references:', e);
  }

  const days = [];
  let completedLessons = Math.floor((mockProgress / 100) * totalLessons);
  
  for (let dayNum = 1; dayNum <= numberOfDays; dayNum++) {
    const dayTitle = courseStructure && courseStructure[`Day ${dayNum}`] 
      ? courseStructure[`Day ${dayNum}`][0]?.replace(`Day ${dayNum} - Module 1: `, '') || `Day ${dayNum} - ${course.domain} Fundamentals`
      : `Day ${dayNum} - ${course.domain} Fundamentals`;
    
    const dayLessons = [];
    
    for (let lessonNum = 1; lessonNum <= lessonsPerDay; lessonNum++) {
      const globalLessonIndex = (dayNum - 1) * lessonsPerDay + lessonNum - 1;
      const isCompleted = completedLessons > 0;
      if (isCompleted) completedLessons--;
      
      // Get lesson title from structure if available
      const lessonTitle = courseStructure && courseStructure[`Day ${dayNum}`] && courseStructure[`Day ${dayNum}`][lessonNum - 1]
        ? courseStructure[`Day ${dayNum}`][lessonNum - 1].replace(`Day ${dayNum} - Module ${lessonNum}: `, '')
        : `Lesson ${lessonNum}: ${course.domain} Concepts`;
      
      // Get corresponding YouTube video if available - only use real videos from database
      const videoRef = youtubeRefs[globalLessonIndex];
      const videos = [];
      
      if (videoRef && videoRef.url) {
        // Check if it's a real YouTube video URL (not a search query)
        const isRealYouTubeVideo = videoRef.url.includes('youtube.com/watch?v=') || videoRef.url.includes('youtu.be/');
        
        if (isRealYouTubeVideo) {
          // Extract video ID from YouTube URL
          let videoId = '';
          try {
            if (videoRef.url.includes('youtube.com/watch?v=')) {
              const urlObj = new URL(videoRef.url);
              videoId = urlObj.searchParams.get('v') || '';
            } else if (videoRef.url.includes('youtu.be/')) {
              videoId = videoRef.url.split('youtu.be/')[1]?.split('?')[0] || '';
            }
          } catch (e) {
            console.error('Error parsing YouTube URL:', videoRef.url);
          }
          
          if (videoId && videoId !== 'dQw4w9WgXcQ' && videoId.length > 5) { // Valid video ID
            videos.push({
              id: `video-${dayNum}-${lessonNum}`,
              title: videoRef.title || lessonTitle,
              description: videoRef.description || `Learn about ${lessonTitle}`,
              youtube_url: videoRef.url,
              youtube_video_id: videoId,
              duration_seconds: (videoRef.duration || 30) * 60,
              channel_name: videoRef.channel || 'Educational Channel',
              thumbnail_url: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
              completed: isCompleted
            });
            console.log(`✅ Added real YouTube video: ${videoRef.title} (${videoId})`);
          } else {
            console.log(`❌ Invalid video ID extracted from: ${videoRef.url}`);
          }
        } else {
          console.log(`❌ Skipping search query URL: ${videoRef.url}`);
        }
      }
      
      dayLessons.push({
        id: `lesson-${dayNum}-${lessonNum}`,
        lesson_number: lessonNum,
        title: lessonTitle,
        description: `Learn about ${lessonTitle}`,
        lesson_type: 'video',
        duration_minutes: 45,
        points: 25,
        completed: isCompleted,
        in_progress: !isCompleted && globalLessonIndex === Math.floor((mockProgress / 100) * totalLessons),
        progress_percentage: isCompleted ? 100 : (!isCompleted && globalLessonIndex === Math.floor((mockProgress / 100) * totalLessons) ? 30 : 0),
        time_spent: isCompleted ? 45 : 0,
        points_earned: isCompleted ? 25 : 0,
        last_accessed: isCompleted ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
        notes: '',
        videos: videos, // Only include real videos from database
        assessments: []
      });
    }
    
    const dayCompleted = dayLessons.every(lesson => lesson.completed);
    const dayProgress = dayLessons.length > 0 ? (dayLessons.filter(l => l.completed).length / dayLessons.length) * 100 : 0;
    
    days.push({
      id: `day-${dayNum}`,
      day_number: dayNum,
      title: dayTitle,
      description: `Day ${dayNum} of ${course.courseName}`,
      learning_objectives: [
        `Master ${course.domain} concepts`,
        'Apply practical knowledge',
        'Complete hands-on exercises'
      ],
      duration_minutes: lessonsPerDay * 45,
      is_locked: dayNum > Math.ceil((mockProgress / 100) * numberOfDays) + 1,
      completed: dayCompleted,
      progress_percentage: dayProgress,
      day_lessons: dayLessons
    });
  }
  
  const totalCompletedLessons = days.reduce((sum, day) => sum + day.day_lessons.filter(l => l.completed).length, 0);
  
  return {
    course: {
      id: course.id,
      courseName: course.courseName,
      domain: course.domain,
      Introduction: course.Introduction || `Welcome to ${course.courseName}. This comprehensive course will teach you everything you need to know about ${course.domain}.`,
      numberOfDays: numberOfDays,
      difficulty_level: course.difficulty_level || 'beginner',
      estimated_hours: course.estimated_hours || numberOfDays * 3,
      instructor_name: 'AI Learning Assistant',
      course_objectives: [
        `Master ${course.domain} fundamentals`,
        'Build practical projects',
        'Apply industry best practices'
      ],
      prerequisites: ['Basic computer skills'],
      certificate_available: true,
      rating: course.rating || 4.5,
      tags: course.tags ? (typeof course.tags === 'string' ? JSON.parse(course.tags) : course.tags) : [course.domain],
      createdAt: course.createdAt,
      progress_percentage: mockProgress,
      total_lessons: totalLessons,
      completed_lessons: totalCompletedLessons,
      current_day: Math.min(Math.floor((mockProgress / 100) * numberOfDays) + 1, numberOfDays)
    },
    enrollment: {
      progress_percentage: mockProgress,
      total_time_spent_minutes: totalCompletedLessons * 45,
      total_points_earned: totalCompletedLessons * 25,
      status: 'in_progress'
    },
    days: days,
    stats: {
      total_days: numberOfDays,
      completed_days: days.filter(day => day.completed).length,
      total_lessons: totalLessons,
      completed_lessons: totalCompletedLessons,
      overall_progress: mockProgress,
      total_points_available: totalLessons * 25,
      total_duration_minutes: numberOfDays * lessonsPerDay * 45
    }
  };
}

export async function GET(request: NextRequest) {
  try {
    console.log('=== getCourseData API ===');
    
    // Initialize Supabase client inside the function to avoid build-time errors
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Use anon key instead of service role key
    
    console.log('Environment check:', {
      supabaseUrl: supabaseUrl ? 'Present' : 'Missing',
      supabaseKey: supabaseKey ? 'Present' : 'Missing'
    });
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration is missing');
      return NextResponse.json(
        { error: 'Supabase configuration is missing' },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const userId = searchParams.get('userId');

    console.log('Request params:', { courseId, userId });

    if (!courseId || !userId) {
      return NextResponse.json(
        { error: 'Course ID and User ID are required' },
        { status: 400 }
      );
    }

    // Check if this is specifically the React Development Masterclass
    if (courseId === 'react-masterclass-2024') {
      console.log('Returning mock data for React Masterclass');
      return NextResponse.json(reactMasterclassMockData);
    }

    console.log('Fetching course from database:', courseId);

    // Fetch course basic information from database
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(`
        id,
        "courseName",
        domain,
        "Introduction",
        "numberOfDays",
        difficulty_level,
        estimated_hours,
        rating,
        tags,
        "createdAt",
        structure,
        "YouTubeReferences"
      `)
      .eq('id', courseId)
      .single();

    console.log('Database query result:', {
      found: !!course,
      error: courseError,
      courseName: course?.courseName
    });

    if (courseError || !course) {
      console.error('Course not found in database:', courseError);
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    console.log('Found course in database:', course.courseName);

    // Generate mock structure for database course
    const mockCourseData = generateMockCourseStructure(course);
    
    console.log('Generated course data:', {
      courseName: mockCourseData.course.courseName,
      days: mockCourseData.days.length,
      lessons: mockCourseData.stats.total_lessons
    });
    
    return NextResponse.json(mockCourseData);

  } catch (error) {
    console.error('Error in getCourseData:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';
export const revalidate = 0; 