-- Final Comprehensive Learning Schema for Learn-AI-Studio
-- This includes day-wise structure, demo user, and sample courses

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if needed (BE CAREFUL - this will delete data)
-- Uncomment the next line only if you want to reset everything
-- DROP TABLE IF EXISTS "learning_analytics", "bookmarks", "enrollments", "progress", "assessments", "videos", "topics", "modules", "day_lessons", "course_days", "courses", "Account", "PasswordResetToken", "VerificationToken", "User" CASCADE;

-- Create User table (enhanced)
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

-- New Course Days table for day-wise structure
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
  unlock_condition TEXT, -- 'previous_day_complete', 'specific_date', 'manual'
  unlock_date TIMESTAMP WITH TIME ZONE,
  UNIQUE("courseId", day_number)
);

-- Enhanced Module table (lessons within a day)
CREATE TABLE IF NOT EXISTS "modules" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "courseId" UUID NOT NULL REFERENCES "courses"(id) ON DELETE CASCADE,
  "dayId" UUID NOT NULL REFERENCES "course_days"(id) ON DELETE CASCADE,
  "moduleNumber" INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  content_html TEXT,
  learning_objectives TEXT[],
  duration_minutes INTEGER DEFAULT 30,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_locked BOOLEAN DEFAULT false,
  prerequisite_modules UUID[],
  module_type TEXT DEFAULT 'lesson', -- lesson, quiz, project, reading
  difficulty_level TEXT DEFAULT 'beginner',
  UNIQUE("courseId", "dayId", "moduleNumber")
);

-- Day Lessons table (specific lessons/activities for each day)
CREATE TABLE IF NOT EXISTS "day_lessons" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "dayId" UUID NOT NULL REFERENCES "course_days"(id) ON DELETE CASCADE,
  "moduleId" UUID REFERENCES "modules"(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  lesson_type TEXT NOT NULL, -- video, reading, quiz, project, discussion
  content TEXT,
  duration_minutes INTEGER DEFAULT 15,
  is_required BOOLEAN DEFAULT true,
  points INTEGER DEFAULT 10,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("dayId", lesson_number)
);

-- Enhanced Topic table (for granular content)
CREATE TABLE IF NOT EXISTS "topics" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "moduleId" UUID REFERENCES "modules"(id) ON DELETE CASCADE,
  "lessonId" UUID REFERENCES "day_lessons"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text', -- text, video, image, quiz, code
  "order" INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (("moduleId" IS NOT NULL) OR ("lessonId" IS NOT NULL))
);

-- Enhanced Videos table for proper video management
CREATE TABLE IF NOT EXISTS "videos" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "moduleId" UUID REFERENCES "modules"(id) ON DELETE CASCADE,
  "lessonId" UUID REFERENCES "day_lessons"(id) ON DELETE CASCADE,
  "topicId" UUID REFERENCES "topics"(id) ON DELETE CASCADE,
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
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (("moduleId" IS NOT NULL) OR ("lessonId" IS NOT NULL) OR ("topicId" IS NOT NULL))
);

-- Enhanced Assessment table
CREATE TABLE IF NOT EXISTS "assessments" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "moduleId" UUID REFERENCES "modules"(id) ON DELETE CASCADE,
  "dayId" UUID REFERENCES "course_days"(id) ON DELETE CASCADE,
  "lessonId" UUID REFERENCES "day_lessons"(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- quiz, assignment, project, discussion
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
  CHECK (("moduleId" IS NOT NULL) OR ("dayId" IS NOT NULL) OR ("lessonId" IS NOT NULL))
);

-- Enhanced Progress table
CREATE TABLE IF NOT EXISTS "progress" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "courseId" UUID NOT NULL REFERENCES "courses"(id) ON DELETE CASCADE,
  "dayId" UUID REFERENCES "course_days"(id) ON DELETE CASCADE,
  "moduleId" UUID REFERENCES "modules"(id) ON DELETE CASCADE,
  "lessonId" UUID REFERENCES "day_lessons"(id) ON DELETE CASCADE,
  "topicId" UUID REFERENCES "topics"(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started', -- not_started, in_progress, completed, skipped
  progress_percentage DECIMAL(5,2) DEFAULT 0.0,
  time_spent_minutes INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  points_earned INTEGER DEFAULT 0,
  completion_date TIMESTAMP WITH TIME ZONE,
  UNIQUE("userId", "courseId", "dayId", "moduleId", "lessonId", "topicId")
);

-- Enhanced Enrollments table
CREATE TABLE IF NOT EXISTS "enrollments" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "courseId" UUID NOT NULL REFERENCES "courses"(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage DECIMAL(5,2) DEFAULT 0.0,
  current_day_id UUID REFERENCES "course_days"(id),
  current_module_id UUID REFERENCES "modules"(id),
  total_time_spent_minutes INTEGER DEFAULT 0,
  total_points_earned INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, completed, paused, dropped
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_certificate_issued BOOLEAN DEFAULT false,
  UNIQUE("userId", "courseId")
);

-- Enhanced Bookmarks table
CREATE TABLE IF NOT EXISTS "bookmarks" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "courseId" UUID REFERENCES "courses"(id) ON DELETE CASCADE,
  "dayId" UUID REFERENCES "course_days"(id) ON DELETE CASCADE,
  "moduleId" UUID REFERENCES "modules"(id) ON DELETE CASCADE,
  "lessonId" UUID REFERENCES "day_lessons"(id) ON DELETE CASCADE,
  "topicId" UUID REFERENCES "topics"(id) ON DELETE CASCADE,
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (("courseId" IS NOT NULL) OR ("dayId" IS NOT NULL) OR ("moduleId" IS NOT NULL) OR ("lessonId" IS NOT NULL) OR ("topicId" IS NOT NULL))
);

-- Enhanced Learning Analytics table
CREATE TABLE IF NOT EXISTS "learning_analytics" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "courseId" UUID REFERENCES "courses"(id) ON DELETE CASCADE,
  "dayId" UUID REFERENCES "course_days"(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- course_start, day_complete, module_complete, video_watch, quiz_attempt, etc.
  event_data JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INTEGER,
  device_type TEXT,
  browser TEXT
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON "courses"("userId");
CREATE INDEX IF NOT EXISTS idx_courses_domain ON "courses"(domain);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON "courses"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_course_days_course_id ON "course_days"("courseId");
CREATE INDEX IF NOT EXISTS idx_course_days_day_number ON "course_days"(day_number);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON "modules"("courseId");
CREATE INDEX IF NOT EXISTS idx_modules_day_id ON "modules"("dayId");
CREATE INDEX IF NOT EXISTS idx_day_lessons_day_id ON "day_lessons"("dayId");
CREATE INDEX IF NOT EXISTS idx_day_lessons_lesson_number ON "day_lessons"(lesson_number);
CREATE INDEX IF NOT EXISTS idx_videos_module_id ON "videos"("moduleId");
CREATE INDEX IF NOT EXISTS idx_videos_lesson_id ON "videos"("lessonId");
CREATE INDEX IF NOT EXISTS idx_videos_youtube_id ON "videos"(youtube_video_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_course ON "progress"("userId", "courseId");
CREATE INDEX IF NOT EXISTS idx_progress_day_id ON "progress"("dayId");
CREATE INDEX IF NOT EXISTS idx_progress_status ON "progress"(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON "enrollments"("userId");
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON "enrollments"(status);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_user_id ON "learning_analytics"("userId");
CREATE INDEX IF NOT EXISTS idx_learning_analytics_created_at ON "learning_analytics"("createdAt" DESC);

-- Create Functions and Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Triggers
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON "courses" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_days_updated_at BEFORE UPDATE ON "course_days" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON "modules" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_day_lessons_updated_at BEFORE UPDATE ON "day_lessons" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON "topics" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON "videos" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON "assessments" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON "progress" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate course progress
CREATE OR REPLACE FUNCTION calculate_course_progress(user_id UUID, course_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
    progress_percentage DECIMAL(5,2);
BEGIN
    -- Count total lessons in the course
    SELECT COUNT(*) INTO total_lessons
    FROM "day_lessons" dl
    JOIN "course_days" cd ON dl."dayId" = cd.id
    WHERE cd."courseId" = course_id;
    
    -- Count completed lessons
    SELECT COUNT(*) INTO completed_lessons
    FROM "progress" p
    JOIN "day_lessons" dl ON p."lessonId" = dl.id
    JOIN "course_days" cd ON dl."dayId" = cd.id
    WHERE cd."courseId" = course_id AND p."userId" = user_id AND p.status = 'completed';
    
    -- Calculate progress percentage
    IF total_lessons > 0 THEN
        progress_percentage := (completed_lessons::DECIMAL / total_lessons::DECIMAL) * 100;
    ELSE
        progress_percentage := 0;
    END IF;
    
    RETURN progress_percentage;
END;
$$ LANGUAGE plpgsql;

-- INSERT DEMO DATA

-- Insert Demo User
INSERT INTO "User" (id, name, email, password, "Credit", subscription_tier, bio, experience_level, learning_goals, "createdAt")
VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    'Demo User',
    'demo@example.com',
    '$2b$10$K7L/VdoOEKi8I2zqfTBgEeK.7W6/E5h5gDJ8JmrZf8X9VdoOEKi8I2', -- password: 'demo123'
    25,
    'premium',
    'Passionate learner exploring AI and web development',
    'intermediate',
    ARRAY['Web Development', 'AI/ML', 'Full Stack Development'],
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert Demo Course: React Development Masterclass
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

-- Insert Course Days for React Course
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

-- Insert Day 1 Quiz Assessment
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
    ('550e8400-e29b-41d4-a716-446655440000'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, '550e8400-e29b-41d4-a716-446655440012'::UUID, 'in_progress', 60.0, 10, 5, NULL)
ON CONFLICT ("userId", "courseId", "dayId", "moduleId", "lessonId", "topicId") DO NOTHING;

-- Insert some learning analytics
INSERT INTO "learning_analytics" ("userId", "courseId", "dayId", event_type, event_data) VALUES
    ('550e8400-e29b-41d4-a716-446655440000'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, 'course_start', '{"timestamp": "2024-12-01T10:00:00Z"}'::JSONB),
    ('550e8400-e29b-41d4-a716-446655440000'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, 'video_watch', '{"video_id": "550e8400-e29b-41d4-a716-446655440020", "watch_time": 1230}'::JSONB),
    ('550e8400-e29b-41d4-a716-446655440000'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, 'lesson_complete', '{"lesson_id": "550e8400-e29b-41d4-a716-446655440010", "points_earned": 10}'::JSONB);

-- Create a view for easy course dashboard queries
CREATE OR REPLACE VIEW course_dashboard AS
SELECT 
    c.id as course_id,
    c."courseName",
    c.domain,
    c.difficulty_level,
    c.estimated_hours,
    c.instructor_name,
    e."userId",
    e.progress_percentage,
    e.current_day_id,
    e.total_time_spent_minutes,
    e.total_points_earned,
    e.status as enrollment_status,
    cd.day_number as current_day_number,
    cd.title as current_day_title,
    COUNT(DISTINCT cd_all.id) as total_days,
    COUNT(DISTINCT dl.id) as total_lessons,
    COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.id END) as completed_lessons
FROM courses c
LEFT JOIN enrollments e ON c.id = e."courseId"
LEFT JOIN course_days cd ON e.current_day_id = cd.id
LEFT JOIN course_days cd_all ON c.id = cd_all."courseId"
LEFT JOIN day_lessons dl ON cd_all.id = dl."dayId"
LEFT JOIN progress p ON e."userId" = p."userId" AND c.id = p."courseId" AND dl.id = p."lessonId"
GROUP BY c.id, c."courseName", c.domain, c.difficulty_level, c.estimated_hours, c.instructor_name, 
         e."userId", e.progress_percentage, e.current_day_id, e.total_time_spent_minutes, 
         e.total_points_earned, e.status, cd.day_number, cd.title; 