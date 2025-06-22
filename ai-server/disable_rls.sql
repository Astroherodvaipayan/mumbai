-- SQL script to disable Row Level Security (RLS) for demo purposes
-- Run this in your Supabase SQL editor

-- Disable RLS on User table
ALTER TABLE public."User" DISABLE ROW LEVEL SECURITY;

-- Disable RLS on courses table
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;

-- Disable RLS on modules table
ALTER TABLE public.modules DISABLE ROW LEVEL SECURITY;

-- Disable RLS on topics table (if you use it)
ALTER TABLE public.topics DISABLE ROW LEVEL SECURITY;

-- Disable RLS on videos table (if you use it)
ALTER TABLE public.videos DISABLE ROW LEVEL SECURITY;

-- Disable RLS on assessments table (if you use it)
ALTER TABLE public.assessments DISABLE ROW LEVEL SECURITY;

-- Disable RLS on progress table (if you use it)
ALTER TABLE public.progress DISABLE ROW LEVEL SECURITY;

-- Disable RLS on enrollments table (if you use it)
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;

-- Disable RLS on bookmarks table (if you use it)
ALTER TABLE public.bookmarks DISABLE ROW LEVEL SECURITY;

-- Disable RLS on learning_analytics table (if you use it)
ALTER TABLE public.learning_analytics DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('User', 'courses', 'modules', 'topics', 'videos', 'assessments', 'progress', 'enrollments', 'bookmarks', 'learning_analytics')
ORDER BY tablename; 