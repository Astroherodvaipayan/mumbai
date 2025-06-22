// Debug script to test courses fetching in browser environment
console.log('=== FRONTEND COURSES DEBUG ===');

// Check environment variables
console.log('Environment Variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing');

// Test if we can access the variables from browser
if (typeof window !== 'undefined') {
  console.log('Running in browser environment');
  console.log('window.location:', window.location.href);
} else {
  console.log('Running in Node.js environment');
}

// Test Supabase client creation
try {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Environment variables not available in frontend');
    console.log('This might be the issue - env vars not loaded in browser');
  } else {
    console.log('✅ Environment variables available');
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client created successfully');
    
    // Test query
    supabase
      .from('courses')
      .select('id, courseName, domain')
      .limit(3)
      .then(({ data, error }) => {
        if (error) {
          console.error('❌ Query failed:', error);
        } else {
          console.log('✅ Query successful:', data?.length || 0, 'courses found');
          console.log('Sample courses:', data);
        }
      })
      .catch(err => {
        console.error('❌ Query error:', err);
      });
  }
} catch (err) {
  console.error('❌ Error creating Supabase client:', err);
} 