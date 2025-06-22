-- SQL script to re-enable Row Level Security (RLS) after demo
-- Run this in your Supabase SQL editor when you're done with the demo

-- Re-enable RLS on User table
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

-- Re-enable RLS on courses table
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Re-enable RLS on modules table
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Re-enable RLS on topics table (if you use it)
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- Re-enable RLS on videos table (if you use it)
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Re-enable RLS on assessments table (if you use it)
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Re-enable RLS on progress table (if you use it)
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Re-enable RLS on enrollments table (if you use it)
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Re-enable RLS on bookmarks table (if you use it)
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Re-enable RLS on learning_analytics table (if you use it)
ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('User', 'courses', 'modules', 'topics', 'videos', 'assessments', 'progress', 'enrollments', 'bookmarks', 'learning_analytics')
ORDER BY tablename; 