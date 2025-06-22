-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT UNIQUE,
  "emailVerified" TIMESTAMP WITH TIME ZONE,
  image TEXT,
  password TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "Credit" INTEGER DEFAULT 5,
  "LastCreditUpdate" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Create Course table
CREATE TABLE IF NOT EXISTS "courses" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "User"(id),
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
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Module table
CREATE TABLE IF NOT EXISTS "modules" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "courseId" UUID NOT NULL REFERENCES "courses"(id),
  "dayNumber" INTEGER NOT NULL,
  "moduleNumber" INTEGER NOT NULL,
  title TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Topic table
CREATE TABLE IF NOT EXISTS "topics" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "moduleId" UUID NOT NULL REFERENCES "modules"(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Assessment table
CREATE TABLE IF NOT EXISTS "assessments" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "moduleId" UUID NOT NULL REFERENCES "modules"(id),
  type TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  answer TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Progress table
CREATE TABLE IF NOT EXISTS "progress" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "User"(id),
  "courseId" UUID NOT NULL REFERENCES "courses"(id),
  "moduleId" UUID NOT NULL REFERENCES "modules"(id),
  status TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 