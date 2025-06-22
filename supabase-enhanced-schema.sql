-- Enhanced Supabase Schema for Learn-AI-Studio
-- Drop existing tables if needed (BE CAREFUL - this will delete data)
-- DROP TABLE IF EXISTS "progress", "assessments", "topics", "videos", "modules", "courses", "Account", "PasswordResetToken", "VerificationToken", "User" CASCADE;

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
  preferences JSONB DEFAULT '{}'::jsonb
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
  completion_rate DECIMAL(5,2) DEFAULT 0.0
);

-- Enhanced Module table
CREATE TABLE IF NOT EXISTS "modules" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "courseId" UUID NOT NULL REFERENCES "courses"(id) ON DELETE CASCADE,
  "dayNumber" INTEGER NOT NULL,
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
  UNIQUE("courseId", "dayNumber", "moduleNumber")
);

-- Enhanced Topic table (for granular content)
CREATE TABLE IF NOT EXISTS "topics" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "moduleId" UUID NOT NULL REFERENCES "modules"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text', -- text, video, image, quiz, code
  "order" INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- New Videos table for proper video management
CREATE TABLE IF NOT EXISTS "videos" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "moduleId" UUID REFERENCES "modules"(id) ON DELETE CASCADE,
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
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (("moduleId" IS NOT NULL) OR ("topicId" IS NOT NULL))
);

-- Enhanced Assessment table
CREATE TABLE IF NOT EXISTS "assessments" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "moduleId" UUID NOT NULL REFERENCES "modules"(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- quiz, assignment, project, discussion
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  correct_answers JSONB NOT NULL,
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  time_limit_minutes INTEGER,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Progress table
CREATE TABLE IF NOT EXISTS "progress" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "courseId" UUID NOT NULL REFERENCES "courses"(id) ON DELETE CASCADE,
  "moduleId" UUID REFERENCES "modules"(id) ON DELETE CASCADE,
  "topicId" UUID REFERENCES "topics"(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started', -- not_started, in_progress, completed, skipped
  progress_percentage DECIMAL(5,2) DEFAULT 0.0,
  time_spent_minutes INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE("userId", "courseId", "moduleId", "topicId")
);

-- New table for user course enrollments
CREATE TABLE IF NOT EXISTS "enrollments" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "courseId" UUID NOT NULL REFERENCES "courses"(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage DECIMAL(5,2) DEFAULT 0.0,
  current_module_id UUID REFERENCES "modules"(id),
  total_time_spent_minutes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, completed, paused, dropped
  UNIQUE("userId", "courseId")
);

-- New table for bookmarks/favorites
CREATE TABLE IF NOT EXISTS "bookmarks" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "courseId" UUID REFERENCES "courses"(id) ON DELETE CASCADE,
  "moduleId" UUID REFERENCES "modules"(id) ON DELETE CASCADE,
  "topicId" UUID REFERENCES "topics"(id) ON DELETE CASCADE,
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (("courseId" IS NOT NULL) OR ("moduleId" IS NOT NULL) OR ("topicId" IS NOT NULL))
);

-- New table for learning analytics
CREATE TABLE IF NOT EXISTS "learning_analytics" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "courseId" UUID REFERENCES "courses"(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- course_start, module_complete, video_watch, quiz_attempt, etc.
  event_data JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON "courses"("userId");
CREATE INDEX IF NOT EXISTS idx_courses_domain ON "courses"(domain);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON "courses"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON "modules"("courseId");
CREATE INDEX IF NOT EXISTS idx_modules_day_number ON "modules"("dayNumber");
CREATE INDEX IF NOT EXISTS idx_videos_module_id ON "videos"("moduleId");
CREATE INDEX IF NOT EXISTS idx_videos_youtube_id ON "videos"(youtube_video_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_course ON "progress"("userId", "courseId");
CREATE INDEX IF NOT EXISTS idx_progress_status ON "progress"(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON "enrollments"("userId");
CREATE INDEX IF NOT EXISTS idx_learning_analytics_user_id ON "learning_analytics"("userId");
CREATE INDEX IF NOT EXISTS idx_learning_analytics_created_at ON "learning_analytics"("createdAt" DESC);

-- Create triggers to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON "courses" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON "modules" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON "topics" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON "videos" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON "assessments" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON "progress" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 