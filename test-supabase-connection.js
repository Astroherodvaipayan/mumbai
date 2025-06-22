// Test Supabase connection and course storage
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...');
console.log('URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Anon Key:', supabaseAnonKey ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n📋 Testing table access...');
    
    // Test User table
    const { data: users, error: userError } = await supabase
      .from('User')
      .select('id, name, email')
      .limit(5);
    
    if (userError) {
      console.error('❌ User table error:', userError.message);
    } else {
      console.log('✅ User table accessible:', users?.length || 0, 'users found');
    }

    // Test courses table
    const { data: courses, error: courseError } = await supabase
      .from('courses')
      .select('id, courseName, domain, createdAt')
      .limit(5);
    
    if (courseError) {
      console.error('❌ Courses table error:', courseError.message);
    } else {
      console.log('✅ Courses table accessible:', courses?.length || 0, 'courses found');
      if (courses && courses.length > 0) {
        console.log('📚 Sample courses:');
        courses.forEach(course => {
          console.log(`  - ${course.courseName} (${course.domain})`);
        });
      }
    }

    // Test inserting a demo course
    console.log('\n🧪 Testing course insertion...');
    
    // First ensure demo user exists
    const demoUserId = '550e8400-e29b-41d4-a716-446655440000';
    const { data: existingUser } = await supabase
      .from('User')
      .select('id')
      .eq('id', demoUserId)
      .single();

    if (!existingUser) {
      console.log('👤 Creating demo user...');
      const { error: userCreateError } = await supabase
        .from('User')
        .insert([{
          id: demoUserId,
          name: 'Demo User',
          email: 'demo@learnaistudio.com',
          Credit: 5,
          emailVerified: new Date().toISOString()
        }]);
      
      if (userCreateError) {
        console.error('❌ Failed to create demo user:', userCreateError.message);
      } else {
        console.log('✅ Demo user created');
      }
    }

    // Test course insertion
    const testCourse = {
      id: crypto.randomUUID(),
      userId: demoUserId,
      courseName: 'Test Course - ' + new Date().toLocaleTimeString(),
      domain: 'Test',
      subtopics: ['Testing', 'Validation'],
      Introduction: 'This is a test course to verify database connectivity',
      numberOfDays: 3,
      ModuleCreated: 0,
      Archive: 0,
      structure: {
        name: 'Test Course',
        modules: ['Module 1', 'Module 2', 'Module 3']
      },
      YouTubeReferences: [],
      ReferenceBooks: [],
      difficulty_level: 'beginner',
      estimated_hours: 5,
      category: 'Test',
      tags: ['test'],
      is_public: false,
      rating: 0.0,
      completion_rate: 0.0
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('courses')
      .insert([testCourse])
      .select();

    if (insertError) {
      console.error('❌ Course insertion failed:', insertError.message);
      console.error('Details:', insertError.details);
      console.error('Hint:', insertError.hint);
    } else {
      console.log('✅ Test course inserted successfully!');
      console.log('📝 Course ID:', insertResult[0]?.id);
      
      // Clean up - delete the test course
      await supabase
        .from('courses')
        .delete()
        .eq('id', testCourse.id);
      console.log('🧹 Test course cleaned up');
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

// Add crypto polyfill for Node.js
if (typeof crypto === 'undefined') {
  global.crypto = require('crypto').webcrypto;
}

testConnection().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}); 