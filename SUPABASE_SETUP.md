# 🚀 Supabase Setup Guide for Learn-AI-Studio

## 📋 Prerequisites
- A Supabase account (free tier available)
- Node.js and npm/yarn installed
- Your Learn-AI-Studio project running

## 🔧 Step 1: Create Supabase Project

1. **Go to [Supabase](https://app.supabase.com/)**
2. **Click "New Project"**
3. **Fill in project details:**
   - Project name: `learn-ai-studio`
   - Database password: (choose a strong password)
   - Region: (select closest to your location)

## 🔑 Step 2: Get Your API Keys

1. **Navigate to Settings → API**
2. **Copy the following values:**
   - `Project URL` (looks like: `https://your-project-id.supabase.co`)
   - `Service Role Key` (anon public key for client-side operations)

## 📝 Step 3: Configure Environment Variables

Create a `.env.local` file in your project root and add:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Google AI Configuration (optional)
GOOGLE_API_KEY=your-google-ai-api-key

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
```

## 🗄️ Step 4: Set Up Database Schema

Run the following SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create courses table
CREATE TABLE courses (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    description TEXT,
    domain TEXT DEFAULT 'General',
    difficulty_level TEXT DEFAULT 'beginner',
    estimated_hours INTEGER DEFAULT 15,
    number_of_days INTEGER DEFAULT 5,
    learning_objectives JSONB DEFAULT '[]',
    prerequisites JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    is_published BOOLEAN DEFAULT true,
    course_structure JSONB,
    youtube_references JSONB DEFAULT '[]',
    reference_books JSONB DEFAULT '[]'
);

-- Create modules table
CREATE TABLE modules (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
    day INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 60,
    objectives JSONB DEFAULT '[]',
    content TEXT,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create user progress table
CREATE TABLE user_progress (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT NOT NULL,
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
    module_id TEXT REFERENCES modules(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    progress_percentage FLOAT DEFAULT 0.0,
    time_spent_minutes INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create enrollments table
CREATE TABLE enrollments (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT NOT NULL,
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',
    progress_percentage FLOAT DEFAULT 0.0,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create indexes for better performance
CREATE INDEX idx_courses_created_by ON courses(created_by);
CREATE INDEX idx_courses_domain ON courses(domain);
CREATE INDEX idx_courses_difficulty ON courses(difficulty_level);
CREATE INDEX idx_modules_course_id ON modules(course_id);
CREATE INDEX idx_modules_day ON modules(day);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_course_id ON user_progress(course_id);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_courses_updated_at 
    BEFORE UPDATE ON courses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at 
    BEFORE UPDATE ON modules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at 
    BEFORE UPDATE ON user_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at 
    BEFORE UPDATE ON enrollments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🔒 Step 5: Set Up Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Courses policies
CREATE POLICY "Anyone can view published courses" ON courses
    FOR SELECT USING (is_published = true);

CREATE POLICY "Users can create courses" ON courses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own courses" ON courses
    FOR UPDATE USING (created_by = auth.uid()::text);

-- Modules policies
CREATE POLICY "Anyone can view modules of published courses" ON modules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = modules.course_id 
            AND courses.is_published = true
        )
    );

-- User progress policies
CREATE POLICY "Users can view their own progress" ON user_progress
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own progress" ON user_progress
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own progress" ON user_progress
    FOR UPDATE USING (user_id = auth.uid()::text);

-- Enrollments policies
CREATE POLICY "Users can view their own enrollments" ON enrollments
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own enrollments" ON enrollments
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own enrollments" ON enrollments
    FOR UPDATE USING (user_id = auth.uid()::text);
```

## 🧪 Step 6: Test the Setup

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Check the console logs:**
   - Look for "✅ Supabase client initialized successfully"
   - Try generating a course and check for database storage success

3. **Verify in Supabase Dashboard:**
   - Go to Table Editor in your Supabase dashboard
   - Check if courses are being created in the `courses` table

## 🔧 Troubleshooting

### Common Issues:

1. **"Supabase environment variables not configured"**
   - Double-check your `.env.local` file
   - Ensure there are no extra spaces in your environment variables
   - Restart your development server

2. **"Database storage failed"**
   - Verify your Service Role Key is correct
   - Check if RLS policies are properly configured
   - Look at the Supabase logs in your dashboard

3. **AI Server Connection Issues**
   - Make sure your AI server is running on port 6000
   - Check if the endpoint is accessible: `http://localhost:6000/generate`
   - Verify the AI server is returning valid JSON

### Debug Commands:

```bash
# Check if environment variables are loaded
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
node -e "console.log(process.env.SUPABASE_SERVICE_ROLE_KEY)"

# Test AI server connection
curl -X POST http://localhost:6000/generate \
  -H "Content-Type: application/json" \
  -d '{"course": "test course", "userId": "test"}'
```

## 🎯 Expected Results

After successful setup:
1. ✅ Course generation will show "Saved to Database" status
2. ✅ AI server will be used instead of fallback
3. ✅ Courses will be stored in Supabase
4. ✅ Course page will display comprehensive course data

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Review the server logs in your terminal
3. Verify your Supabase dashboard for any errors
4. Ensure your AI server is running and accessible 