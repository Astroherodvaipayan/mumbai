"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Calendar, Clock, Play, Star, Archive, Trash2, RefreshCw } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

interface Course {
  id: string;
  courseName: string;
  domain: string;
  numberOfDays: number;
  estimatedHours: number;
  difficulty: string;
  createdAt: string;
  progress?: number;
  userId?: string;
}

// Mock course for React Development Masterclass
const reactMasterclassCourse: Course = {
  id: 'react-masterclass-2024',
  courseName: 'React Development Masterclass',
  domain: 'Web Development',
  numberOfDays: 5,
  estimatedHours: 20,
  difficulty: 'beginner',
  createdAt: '2024-01-10',
  progress: 30
};

const CourseCard = ({ course, onDelete }: { course: Course; onDelete: (id: string) => void }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = async () => {
    if (course.id === 'react-masterclass-2024') {
      alert('Cannot delete the demo course!');
      return;
    }
    
    if (confirm(`Are you sure you want to delete "${course.courseName}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(course.id);
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Failed to delete course');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
            {course.courseName}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{course.domain}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
          {course.difficulty}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{course.numberOfDays} days</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
          <Clock className="w-4 h-4 mr-2" />
          <span>{course.estimatedHours} hours</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
          <BookOpen className="w-4 h-4 mr-2" />
          <span>Created {formatDate(course.createdAt)}</span>
        </div>
      </div>

      {course.progress !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{course.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        <Link 
          href={`/course/${course.id}/demo-user`}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors text-sm font-medium"
        >
          <Play className="w-4 h-4 mr-2" />
          Continue Learning
        </Link>
        <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <Archive className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors disabled:opacity-50"
        >
          <Trash2 className={`w-4 h-4 ${isDeleting ? 'text-gray-400' : 'text-red-600 dark:text-red-400'}`} />
        </button>
      </div>
    </div>
  );
};

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCourse = async (courseId: string) => {
    try {
      // Initialize Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing');
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      // Delete course from database
      const { error: deleteError } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (deleteError) {
        throw deleteError;
      }

      // Remove from local state
      setCourses(prev => prev.filter(course => course.id !== courseId));
      
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  };

  const fetchCourses = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      console.log('=== COURSES PAGE DEBUG ===');
      console.log('Fetching courses from API...');
      
      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = Date.now();
      const response = await fetch(`/api/courses?t=${cacheBuster}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const apiResult = await response.json();
      console.log('API result:', {
        success: apiResult.success,
        coursesCount: apiResult.courses?.length || 0,
        message: apiResult.message,
        timestamp: apiResult.timestamp
      });
      
      if (!apiResult.success) {
        console.error('API returned error:', apiResult.error);
        setCourses([reactMasterclassCourse]);
        setError('Failed to fetch courses from API');
        return;
      }
      
      console.log('✅ API call successful, found courses:', apiResult.courses?.length || 0);
      console.log('Sample courses:', apiResult.courses?.slice(0, 3));
      
      // Set the courses from API
      setCourses(apiResult.courses || [reactMasterclassCourse]);
      
      if (apiResult.courses?.length === 1) {
        setError('Only demo course available - check database connection');
      } else {
        setError(null); // Clear any previous errors
      }
      
      console.log('=== COURSES FETCH COMPLETED ===');
      
    } catch (err) {
      console.error('💥 Unexpected error in fetchCourses:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack trace',
        name: err instanceof Error ? err.name : 'Unknown'
      });
      setError('Failed to load courses');
      // Fallback to mock data
      setCourses([reactMasterclassCourse]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('🏁 Course fetching completed, loading set to false');
    }
  };

  useEffect(() => {
    console.log('🚀 useEffect triggered, calling fetchCourses...');
    fetchCourses();
    
    // Set up interval to refresh courses every 30 seconds
    const refreshInterval = setInterval(fetchCourses, 30000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-48"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-32"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                    <div className="flex gap-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                    </div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Courses</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Continue your learning journey with these courses ({courses.length} total)
                </p>
              </div>
              <button
                onClick={() => fetchCourses(true)}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            {error && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No courses found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Start your learning journey by creating your first course</p>
              <Link 
                href="/dashboard"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Star className="w-5 h-5 mr-2" />
                Create Course
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} onDelete={deleteCourse} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
