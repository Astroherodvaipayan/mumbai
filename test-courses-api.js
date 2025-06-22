import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing courses API logic...');
console.log('Supabase URL:', supabaseUrl ? 'Present' : 'Missing');
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCoursesAPI() {
  try {
    console.log('Attempting to fetch courses from database...');
    
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

    console.log('Database query result:', { 
      coursesCount: dbCourses?.length || 0, 
      error: fetchError 
    });

    if (fetchError) {
      console.error('Error fetching courses:', fetchError);
      
      // Try alternative query without Archive filter
      console.log('Trying alternative query without Archive filter...');
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
      
      console.log('Alternative query result:', { 
        coursesCount: allCourses?.length || 0, 
        error: altError 
      });
      
      if (allCourses && allCourses.length > 0) {
        console.log('Sample courses:');
        allCourses.forEach((course, index) => {
          console.log(`${index + 1}. ${course.courseName} (${course.domain}) - ${course.numberOfDays} days`);
        });
      }
    } else {
      console.log('Primary query succeeded!');
      if (dbCourses && dbCourses.length > 0) {
        console.log('Sample courses:');
        dbCourses.forEach((course, index) => {
          console.log(`${index + 1}. ${course.courseName} (${course.domain}) - ${course.numberOfDays} days - Archive: ${course.Archive}`);
        });
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testCoursesAPI(); 