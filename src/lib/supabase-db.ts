import { supabase } from './supabase';

// User operations
export const createUser = async (userData: {
  name?: string;
  email: string;
  password?: string;
  image?: string;
}) => {
  const { data, error } = await supabase
    .from('User')
    .insert([
      {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        image: userData.image,
        Credit: 5,
        LastCreditUpdate: new Date().toISOString(),
      },
    ])
    .select();

  if (error) throw error;
  return data;
};

export const getUserByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from('User')
    .select('*')
    .eq('email', email)
    .single();

  if (error) return null;
  return data;
};

export const getUserById = async (id: string) => {
  const { data, error } = await supabase
    .from('User')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
};

// Course operations
export const createCourse = async (courseData: {
  userId: string;
  courseName: string;
  domain: string;
  subtopics: string[];
  Introduction: string;
  numberOfDays: number;
  structure: any;
}) => {
  const { data, error } = await supabase
    .from('courses')
    .insert([
      {
        userId: courseData.userId,
        courseName: courseData.courseName,
        domain: courseData.domain,
        subtopics: courseData.subtopics,
        Introduction: courseData.Introduction,
        numberOfDays: courseData.numberOfDays,
        structure: courseData.structure,
        ModuleCreated: 0,
        Archive: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ])
    .select();

  if (error) throw error;
  return data;
};

export const getCoursesByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('userId', userId);

  if (error) throw error;
  return data;
};

// Module operations
export const createModule = async (moduleData: {
  courseId: string;
  dayNumber: number;
  moduleNumber: number;
  title: string;
}) => {
  const { data, error } = await supabase
    .from('modules')
    .insert([
      {
        courseId: moduleData.courseId,
        dayNumber: moduleData.dayNumber,
        moduleNumber: moduleData.moduleNumber,
        title: moduleData.title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ])
    .select();

  if (error) throw error;
  return data;
};

export const getModulesByCourseId = async (courseId: string) => {
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .eq('courseId', courseId);

  if (error) throw error;
  return data;
};

// Topic operations
export const createTopic = async (topicData: {
  moduleId: string;
  title: string;
  content: string;
}) => {
  const { data, error } = await supabase
    .from('topics')
    .insert([
      {
        moduleId: topicData.moduleId,
        title: topicData.title,
        content: topicData.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ])
    .select();

  if (error) throw error;
  return data;
};

// Progress operations
export const updateProgress = async (progressData: {
  userId: string;
  courseId: string;
  moduleId: string;
  status: string;
}) => {
  // Check if progress already exists
  const { data: existingProgress } = await supabase
    .from('progress')
    .select('*')
    .eq('userId', progressData.userId)
    .eq('courseId', progressData.courseId)
    .eq('moduleId', progressData.moduleId)
    .single();

  if (existingProgress) {
    // Update existing progress
    const { data, error } = await supabase
      .from('progress')
      .update({
        status: progressData.status,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', existingProgress.id)
      .select();

    if (error) throw error;
    return data;
  } else {
    // Create new progress
    const { data, error } = await supabase
      .from('progress')
      .insert([
        {
          userId: progressData.userId,
          courseId: progressData.courseId,
          moduleId: progressData.moduleId,
          status: progressData.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return data;
  }
};

// Archive course
export const archiveCourse = async (courseId: string) => {
  const { data, error } = await supabase
    .from('courses')
    .update({ Archive: 1 })
    .eq('id', courseId)
    .select();

  if (error) throw error;
  return data;
};

// Unarchive course
export const unarchiveCourse = async (courseId: string) => {
  const { data, error } = await supabase
    .from('courses')
    .update({ Archive: 0 })
    .eq('id', courseId)
    .select();

  if (error) throw error;
  return data;
}; 