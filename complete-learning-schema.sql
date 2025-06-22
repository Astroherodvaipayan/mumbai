-- Complete Learning Schema with Day-wise Structure and Demo Data
-- Learn-AI-Studio Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT UNIQUE,
  "emailVerified" TIMESTAMP WITH TIME ZONE,
  image TEXT,
  password TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "Credit" INTEGER DEFAULT 5,
  "LastCreditUpdate" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_tier TEXT DEFAULT 'free',
  preferences JSONB DEFAULT '{}'::jsonb,
  bio TEXT,
  experience_level TEXT DEFAULT 'beginner',
  learning_goals TEXT[]
);

-- Create Account table
CREATE TABLE IF NOT EXISTS "Account" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, "providerAccountId")
);

-- Create VerificationToken table
CREATE TABLE IF NOT EXISTS "VerificationToken" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(email, token)
);

-- Create PasswordResetToken table
CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(email, token)
);

-- Enhanced Course table
CREATE TABLE IF NOT EXISTS "courses" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "courseName" TEXT NOT NULL,
  domain TEXT NOT NULL,
  subtopics TEXT[] NOT NULL,
  "Introduction" TEXT NOT NULL,
  "numberOfDays" INTEGER NOT NULL,
  "ModuleCreated" INTEGER DEFAULT 0,
  "Archive" INTEGER DEFAULT 0,
  structure JSONB NOT NULL,
  "YouTubeReferences" JSONB DEFAULT '[]'::jsonb,
  "ReferenceBooks" JSONB DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  difficulty_level TEXT DEFAULT 'beginner',
  estimated_hours INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0.0,
  completion_rate DECIMAL(5,2) DEFAULT 0.0,
  instructor_name TEXT,
  course_objectives TEXT[],
  prerequisites TEXT[],
  certificate_available BOOLEAN DEFAULT false
);

-- Course Days table for day-wise structure
CREATE TABLE IF NOT EXISTS "course_days" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "courseId" UUID NOT NULL REFERENCES "courses"(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  learning_objectives TEXT[],
  duration_minutes INTEGER DEFAULT 60,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_locked BOOLEAN DEFAULT false,
  unlock_condition TEXT,
  unlock_date TIMESTAMP WITH TIME ZONE,
  UNIQUE("courseId", day_number)
);

-- Day Lessons table
CREATE TABLE IF NOT EXISTS "day_lessons" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "dayId" UUID NOT NULL REFERENCES "course_days"(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  lesson_type TEXT NOT NULL,
  content TEXT,
  duration_minutes INTEGER DEFAULT 15,
  is_required BOOLEAN DEFAULT true,
  points INTEGER DEFAULT 10,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("dayId", lesson_number)
);

-- Videos table
CREATE TABLE IF NOT EXISTS "videos" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "lessonId" UUID REFERENCES "day_lessons"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT,
  youtube_video_id TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  transcript TEXT,
  tags TEXT[] DEFAULT '{}',
  video_quality TEXT DEFAULT 'standard',
  channel_name TEXT,
  view_count INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessments table
CREATE TABLE IF NOT EXISTS "assessments" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "dayId" UUID REFERENCES "course_days"(id) ON DELETE CASCADE,
  "lessonId" UUID REFERENCES "day_lessons"(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  correct_answers JSONB NOT NULL,
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  time_limit_minutes INTEGER,
  points INTEGER DEFAULT 100,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (("dayId" IS NOT NULL) OR ("lessonId" IS NOT NULL))
);

-- Progress table
CREATE TABLE IF NOT EXISTS "progress" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "courseId" UUID NOT NULL REFERENCES "courses"(id) ON DELETE CASCADE,
  "dayId" UUID REFERENCES "course_days"(id) ON DELETE CASCADE,
  "lessonId" UUID REFERENCES "day_lessons"(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started',
  progress_percentage DECIMAL(5,2) DEFAULT 0.0,
  time_spent_minutes INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  points_earned INTEGER DEFAULT 0,
  completion_date TIMESTAMP WITH TIME ZONE
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS "enrollments" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "courseId" UUID NOT NULL REFERENCES "courses"(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage DECIMAL(5,2) DEFAULT 0.0,
  current_day_id UUID REFERENCES "course_days"(id),
  total_time_spent_minutes INTEGER DEFAULT 0,
  total_points_earned INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_certificate_issued BOOLEAN DEFAULT false,
  UNIQUE("userId", "courseId")
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON "courses"("userId");
CREATE INDEX IF NOT EXISTS idx_course_days_course_id ON "course_days"("courseId");
CREATE INDEX IF NOT EXISTS idx_day_lessons_day_id ON "day_lessons"("dayId");
CREATE INDEX IF NOT EXISTS idx_videos_lesson_id ON "videos"("lessonId");
CREATE INDEX IF NOT EXISTS idx_progress_user_course ON "progress"("userId", "courseId");
CREATE INDEX IF NOT EXISTS idx_progress_lesson ON "progress"("userId", "courseId", "lessonId") WHERE "lessonId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_progress_day ON "progress"("userId", "courseId", "dayId") WHERE "dayId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON "enrollments"("userId");

-- Create unique constraints for progress to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_progress_unique_lesson 
ON "progress"("userId", "courseId", "lessonId") 
WHERE "lessonId" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_progress_unique_day 
ON "progress"("userId", "courseId", "dayId") 
WHERE "dayId" IS NOT NULL AND "lessonId" IS NULL;

-- Create Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON "courses" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_days_updated_at BEFORE UPDATE ON "course_days" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_day_lessons_updated_at BEFORE UPDATE ON "day_lessons" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- INSERT DEMO DATA

-- Insert Demo User
INSERT INTO "User" (id, name, email, password, "Credit", subscription_tier, bio, experience_level, learning_goals, "createdAt")
VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    'Demo User',
    'demo@example.com',
    '$2b$10$K7L/VdoOEKi8I2zqfTBgEeK.7W6/E5h5gDJ8JmrZf8X9VdoOEKi8I2',
    25,
    'premium',
    'Passionate learner exploring AI and web development',
    'intermediate',
    ARRAY['Web Development', 'AI/ML', 'Full Stack Development'],
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert Demo Course
INSERT INTO "courses" (
    id, "userId", "courseName", domain, subtopics, "Introduction", "numberOfDays",
    structure, difficulty_level, estimated_hours, category, tags, instructor_name,
    course_objectives, prerequisites, certificate_available, "createdAt"
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001'::UUID,
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    'React Development Masterclass',
    'Web Development',
    ARRAY['React Fundamentals', 'State Management', 'Component Communication', 'Advanced Patterns', 'Testing & Deployment'],
    'Master modern React development from basics to advanced concepts. Build real-world applications with confidence.',
    5,
    '{"totalModules": 15, "totalVideos": 45, "totalQuizzes": 10, "projects": 3}'::JSONB,
    'beginner',
    20,
    'Programming',
    ARRAY['React', 'JavaScript', 'Frontend', 'Web Development'],
    'Sarah Johnson',
    ARRAY[
        'Master React fundamentals and modern patterns',
        'Build interactive user interfaces',
        'Implement state management solutions',
        'Deploy React applications to production',
        'Write comprehensive tests for React apps'
    ],
    ARRAY['Basic JavaScript knowledge', 'HTML & CSS fundamentals', 'Node.js installed'],
    true,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert Course Days
INSERT INTO "course_days" (id, "courseId", day_number, title, description, learning_objectives, duration_minutes) VALUES
    ('550e8400-e29b-41d4-a716-446655440002'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, 1, 'React Fundamentals', 'Learn the core concepts of React including components, JSX, and state management', ARRAY['Understand React ecosystem', 'Create React components', 'Master JSX syntax', 'Handle props and state'], 120),
    ('550e8400-e29b-41d4-a716-446655440003'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, 2, 'State Management & Events', 'Deep dive into React state, event handling, and component lifecycle', ARRAY['Master useState and useEffect', 'Handle user events', 'Understand component lifecycle', 'Build interactive components'], 150),
    ('550e8400-e29b-41d4-a716-446655440004'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, 3, 'Component Communication', 'Learn how components communicate through props, context, and state lifting', ARRAY['Pass data between components', 'Understand prop drilling', 'Implement React Context', 'Create reusable components'], 135),
    ('550e8400-e29b-41d4-a716-446655440005'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, 4, 'Advanced Patterns & Hooks', 'Explore advanced React patterns, custom hooks, and performance optimization', ARRAY['Create custom hooks', 'Implement advanced patterns', 'Optimize performance', 'Use React DevTools'], 180),
    ('550e8400-e29b-41d4-a716-446655440006'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, 5, 'Testing & Deployment', 'Learn testing strategies and deploy your React application', ARRAY['Write unit tests', 'Implement integration tests', 'Deploy to production', 'Set up CI/CD pipeline'], 165)
ON CONFLICT (id) DO NOTHING;

-- Insert Day Lessons for Day 1
INSERT INTO "day_lessons" (id, "dayId", lesson_number, title, description, lesson_type, duration_minutes, points) VALUES
    ('550e8400-e29b-41d4-a716-446655440010'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, 1, 'Introduction to React', 'Overview of React and its ecosystem', 'video', 20, 10),
    ('550e8400-e29b-41d4-a716-446655440011'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, 2, 'Setting up Development Environment', 'Install Node.js, npm, and create-react-app', 'video', 15, 10),
    ('550e8400-e29b-41d4-a716-446655440012'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, 3, 'JSX and Components', 'Understanding JSX syntax and creating components', 'video', 25, 15),
    ('550e8400-e29b-41d4-a716-446655440013'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, 4, 'Props and State Basics', 'Introduction to props and state management', 'video', 30, 15),
    ('550e8400-e29b-41d4-a716-446655440014'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, 5, 'Day 1 Quiz', 'Test your understanding of React fundamentals', 'quiz', 10, 50)
ON CONFLICT (id) DO NOTHING;

-- Insert Videos for Day 1 Lessons
INSERT INTO "videos" (id, "lessonId", title, description, youtube_url, youtube_video_id, duration_seconds, channel_name) VALUES
    ('550e8400-e29b-41d4-a716-446655440020'::UUID, '550e8400-e29b-41d4-a716-446655440010'::UUID, 'Introduction to React', 'Overview of React and its ecosystem', 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', 'Tn6-PIqc4UM', 1230, 'React Official'),
    ('550e8400-e29b-41d4-a716-446655440021'::UUID, '550e8400-e29b-41d4-a716-446655440011'::UUID, 'Setting up Development Environment', 'Install Node.js, npm, and create-react-app', 'https://www.youtube.com/watch?v=QFaFIcGhPoM', 'QFaFIcGhPoM', 945, 'Dev Setup Guide'),
    ('550e8400-e29b-41d4-a716-446655440022'::UUID, '550e8400-e29b-41d4-a716-446655440012'::UUID, 'JSX and Components', 'Understanding JSX syntax and creating components', 'https://www.youtube.com/watch?v=7fPXI_MnBOY', '7fPXI_MnBOY', 1515, 'React Basics'),
    ('550e8400-e29b-41d4-a716-446655440023'::UUID, '550e8400-e29b-41d4-a716-446655440013'::UUID, 'Props and State Basics', 'Introduction to props and state management', 'https://www.youtube.com/watch?v=4f5TLGWXorU', '4f5TLGWXorU', 1800, 'React State Guide')
ON CONFLICT (id) DO NOTHING;

-- Insert Quiz Assessment
INSERT INTO "assessments" (id, "lessonId", type, title, description, questions, correct_answers, points) VALUES (
    '550e8400-e29b-41d4-a716-446655440030'::UUID,
    '550e8400-e29b-41d4-a716-446655440014'::UUID,
    'quiz',
    'React Fundamentals Quiz',
    'Test your understanding of React basics',
    '[
        {
            "id": 1,
            "question": "What is JSX?",
            "options": ["JavaScript XML", "Java Syntax Extension", "JSON XML", "JavaScript Extension"],
            "type": "multiple_choice"
        },
        {
            "id": 2,
            "question": "Which method is used to create a React component?",
            "options": ["React.createComponent()", "React.Component()", "function component or class component", "React.makeComponent()"],
            "type": "multiple_choice"
        },
        {
            "id": 3,
            "question": "What are props in React?",
            "options": ["Properties passed to components", "State variables", "Event handlers", "CSS styles"],
            "type": "multiple_choice"
        }
    ]'::JSONB,
    '[
        {"id": 1, "answer": 0},
        {"id": 2, "answer": 2},
        {"id": 3, "answer": 0}
    ]'::JSONB,
    50
) ON CONFLICT (id) DO NOTHING;

-- Insert Demo User Enrollment
INSERT INTO "enrollments" (id, "userId", "courseId", progress_percentage, current_day_id, status, total_points_earned) VALUES (
    '550e8400-e29b-41d4-a716-446655440040'::UUID,
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    '550e8400-e29b-41d4-a716-446655440001'::UUID,
    20.0,
    '550e8400-e29b-41d4-a716-446655440002'::UUID,
    'active',
    25
) ON CONFLICT ("userId", "courseId") DO NOTHING;

-- Insert Demo Progress Data
INSERT INTO "progress" ("userId", "courseId", "dayId", "lessonId", status, progress_percentage, time_spent_minutes, points_earned, completion_date) VALUES
    ('550e8400-e29b-41d4-a716-446655440000'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, '550e8400-e29b-41d4-a716-446655440010'::UUID, 'completed', 100.0, 20, 10, NOW() - INTERVAL '2 days'),
    ('550e8400-e29b-41d4-a716-446655440000'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, '550e8400-e29b-41d4-a716-446655440011'::UUID, 'completed', 100.0, 15, 10, NOW() - INTERVAL '2 days'),
    ('550e8400-e29b-41d4-a716-446655440000'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, '550e8400-e29b-41d4-a716-446655440012'::UUID, 'in_progress', 60.0, 10, 5, NULL); 