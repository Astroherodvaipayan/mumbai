'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  BookOpen, 
  Clock, 
  Calendar,
  CheckCircle,
  Circle,
  Award,
  Target,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  ArrowLeft,
  Users,
  Star,
  Trophy,
  BarChart3,
  PlayCircle,
  PauseCircle,
  Lock,
  Mic
} from "lucide-react";
import Link from "next/link";

// TypeScript interfaces for the data structure
interface Video {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  youtube_video_id: string;
  duration_seconds: number;
  channel_name: string;
  thumbnail_url: string;
  completed: boolean;
}

interface Assessment {
  id: string;
  type: string;
  title: string;
  description: string;
  questions: any[];
  points: number;
  passing_score: number;
  max_attempts: number;
  time_limit_minutes: number;
}

interface Lesson {
  id: string;
  lesson_number: number;
  title: string;
  description: string;
  lesson_type: string;
  duration_minutes: number;
  points: number;
  completed: boolean;
  in_progress: boolean;
  progress_percentage: number;
  time_spent: number;
  points_earned: number;
  last_accessed: string;
  notes: string;
  videos: Video[];
  assessments: Assessment[];
}

interface Day {
  id: string;
  day_number: number;
  title: string;
  description: string;
  learning_objectives: string[];
  duration_minutes: number;
  is_locked: boolean;
  completed: boolean;
  progress_percentage: number;
  day_lessons: Lesson[];
}

interface CourseData {
  course: {
    id: string;
    courseName: string;
    domain: string;
    Introduction: string;
    numberOfDays: number;
    difficulty_level: string;
    estimated_hours: number;
    instructor_name: string;
    course_objectives: string[];
    prerequisites: string[];
    certificate_available: boolean;
    rating: number;
    tags: string[];
    progress_percentage: number;
    total_lessons: number;
    completed_lessons: number;
    current_day: number;
  };
  enrollment: {
    progress_percentage: number;
    total_time_spent_minutes: number;
    total_points_earned: number;
    status: string;
  };
  days: Day[];
  stats: {
    total_days: number;
    completed_days: number;
    total_lessons: number;
    completed_lessons: number;
    overall_progress: number;
    total_points_available: number;
    total_duration_minutes: number;
  };
}

const CoursePage = ({ params }: { params: { id: string; userId: string } }) => {
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [expandedDays, setExpandedDays] = useState<number[]>([1]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Fetch course data from the database
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/getCourseData?courseId=${params.id}&userId=${params.userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch course data');
        }
        const data: CourseData = await response.json();
        setCourseData(data);
        setSelectedDay(data.course.current_day);
        setExpandedDays([data.course.current_day]);
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [params.id, params.userId]);

  const toggleDayExpansion = (dayNumber: number) => {
    setExpandedDays(prev => 
      prev.includes(dayNumber) 
        ? prev.filter(d => d !== dayNumber)
        : [...prev, dayNumber]
    );
  };

  const playVideo = (video: Video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getYouTubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-xl text-white">Loading your course...</p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Course not found</h1>
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { course, enrollment, days, stats } = courseData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-black/40 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard" 
                className="flex items-center text-gray-400 hover:text-white transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:translate-x-[-4px] transition-transform" />
                Back to Dashboard
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href={`/course/${params.id}/${params.userId}/practice`}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Mic className="w-4 h-4 mr-2" />
                Practice
              </Link>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(course.difficulty_level)}`}>
                {course.difficulty_level.charAt(0).toUpperCase() + course.difficulty_level.slice(1)}
              </span>
              <div className="flex items-center text-yellow-400">
                <Star className="w-5 h-5 mr-1" />
                <span className="font-medium text-white">{course.rating || 4.8}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content - Course Days */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-800/50 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-cyan-600/90 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10">
                  <h1 className="text-3xl font-bold mb-2">{course.courseName}</h1>
                  <p className="text-blue-100 mb-4">{course.Introduction}</p>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{course.estimated_hours} hours</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span>{stats.total_lessons} lessons</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{stats.total_days} days</span>
                    </div>
                    <div className="flex items-center">
                      <Trophy className="w-4 h-4 mr-2" />
                      <span>{enrollment.total_points_earned}/{stats.total_points_available} points</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-blue-100">Overall Progress</span>
                      <span className="text-sm font-medium">{Math.round(stats.overall_progress)}%</span>
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-blue-400 h-3 rounded-full transition-all duration-300 shadow-lg"
                        style={{ width: `${stats.overall_progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Days */}
              <div className="divide-y divide-gray-800/50">
                {days.map((day) => (
                  <div key={day.id} className="border-b border-gray-800/50 last:border-b-0">
                    <div 
                      className={`p-6 cursor-pointer transition-all duration-200 hover:bg-gray-800/30 ${
                        day.completed ? 'bg-green-900/20' : day.day_number === course.current_day ? 'bg-blue-900/20' : ''
                      }`}
                      onClick={() => toggleDayExpansion(day.day_number)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                            day.completed ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' : 
                            day.day_number === course.current_day ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' : 
                            'bg-gray-700/50 text-gray-300 border border-gray-600/50'
                          }`}>
                            {day.completed ? (
                              <CheckCircle className="w-6 h-6" />
                            ) : day.is_locked ? (
                              <Lock className="w-6 h-6" />
                            ) : (
                              <span className="font-bold">{day.day_number}</span>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white mb-1">
                              Day {day.day_number}: {day.title}
                            </h3>
                            <p className="text-gray-400 mb-2">{day.description}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {day.duration_minutes} min
                              </span>
                              <span className="flex items-center">
                                <Video className="w-4 h-4 mr-1" />
                                {day.day_lessons?.length || 0} lessons
                              </span>
                              <span className="flex items-center">
                                <BarChart3 className="w-4 h-4 mr-1" />
                                {Math.round(day.progress_percentage)}% complete
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="w-16 h-2 bg-gray-700/50 rounded-full">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                day.completed ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-blue-400 to-cyan-400'
                              }`}
                              style={{ width: `${day.progress_percentage}%` }}
                            ></div>
                          </div>
                          {expandedDays.includes(day.day_number) ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Day Content */}
                    <AnimatePresence>
                      {expandedDays.includes(day.day_number) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 bg-gray-800/20">
                            {/* Learning Objectives */}
                            {day.learning_objectives && day.learning_objectives.length > 0 && (
                              <div className="mb-6">
                                <h4 className="font-semibold text-white mb-3 flex items-center">
                                  <Target className="w-5 h-5 mr-2 text-blue-400" />
                                  Learning Objectives
                                </h4>
                                <ul className="space-y-2">
                                  {day.learning_objectives.map((objective, index) => (
                                    <li key={index} className="flex items-start">
                                      <Circle className="w-2 h-2 mt-2 mr-3 text-blue-400 flex-shrink-0" />
                                      <span className="text-gray-300">{objective}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Lessons */}
                            <div className="space-y-4">
                              {day.day_lessons?.map((lesson) => (
                                <div 
                                  key={lesson.id}
                                  className={`bg-gray-800/30 backdrop-blur-sm rounded-lg border-2 transition-all duration-200 ${
                                    lesson.completed ? 'border-green-500/50 bg-green-900/20' : 
                                    lesson.in_progress ? 'border-blue-500/50 bg-blue-900/20' : 
                                    'border-gray-700/50 hover:border-gray-600/50'
                                  }`}
                                >
                                  <div className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                          lesson.completed ? 'bg-green-500' : 
                                          lesson.in_progress ? 'bg-blue-500' : 
                                          'bg-gray-600'
                                        }`}>
                                          {lesson.completed ? (
                                            <CheckCircle className="w-5 h-5 text-white" />
                                          ) : lesson.in_progress ? (
                                            <PlayCircle className="w-5 h-5 text-white" />
                                          ) : (
                                            <Circle className="w-5 h-5 text-white" />
                                          )}
                                        </div>
                                        <div>
                                          <h5 className="font-medium text-white">{lesson.title}</h5>
                                          <p className="text-sm text-gray-400">{lesson.description}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                                        <span className="flex items-center">
                                          <Clock className="w-4 h-4 mr-1" />
                                          {lesson.duration_minutes}m
                                        </span>
                                        <span className="flex items-center">
                                          <Award className="w-4 h-4 mr-1" />
                                          {lesson.points}pts
                                        </span>
                                      </div>
                                    </div>

                                    {/* Progress Bar for Lesson */}
                                    <div className="mb-3">
                                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>Progress</span>
                                        <span>{lesson.progress_percentage}%</span>
                                      </div>
                                      <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                                        <div 
                                          className={`h-1.5 rounded-full transition-all duration-300 ${
                                            lesson.completed ? 'bg-green-400' : 'bg-blue-400'
                                          }`}
                                          style={{ width: `${lesson.progress_percentage}%` }}
                                        ></div>
                                      </div>
                                    </div>

                                    {/* Videos */}
                                    {lesson.videos && lesson.videos.length > 0 ? (
                                      <div className="space-y-2">
                                        {lesson.videos.map((video) => (
                                          <div 
                                            key={video.id}
                                            className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
                                            onClick={() => playVideo(video)}
                                          >
                                            <div className="flex items-center space-x-3">
                                              <div className="relative">
                                                <img 
                                                  src={video.thumbnail_url} 
                                                  alt={video.title}
                                                  className="w-16 h-12 object-cover rounded-lg"
                                                />
                                                <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                                                  <Play className="w-6 h-6 text-white" />
                                                </div>
                                              </div>
                                              <div>
                                                <h6 className="font-medium text-white text-sm">{video.title}</h6>
                                                <p className="text-xs text-gray-400">{video.channel_name}</p>
                                                <p className="text-xs text-gray-500">{formatDuration(video.duration_seconds)}</p>
                                              </div>
                                            </div>
                                            {video.completed && (
                                              <CheckCircle className="w-5 h-5 text-green-400" />
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="p-3 bg-gray-800/20 rounded-lg border border-gray-700/50">
                                        <div className="flex items-center space-x-3">
                                          <Video className="w-5 h-5 text-gray-500" />
                                          <div>
                                            <p className="text-sm text-gray-400">No video content available</p>
                                            <p className="text-xs text-gray-500">Video resources will be added soon</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Course Info */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              
              {/* Course Stats */}
              <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-800/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Your Progress</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Completed Days</span>
                    <span className="font-medium text-white">{stats.completed_days}/{stats.total_days}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Completed Lessons</span>
                    <span className="font-medium text-white">{stats.completed_lessons}/{stats.total_lessons}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Points Earned</span>
                    <span className="font-medium text-yellow-400">
                      {enrollment.total_points_earned}/{stats.total_points_available}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Time Spent</span>
                    <span className="font-medium text-white">
                      {Math.floor(enrollment.total_time_spent_minutes / 60)}h {enrollment.total_time_spent_minutes % 60}m
                    </span>
                  </div>
                </div>
              </div>

              {/* Course Info */}
              <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-800/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Course Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Instructor</p>
                    <p className="font-medium text-white">{course.instructor_name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Domain</p>
                    <p className="font-medium text-white">{course.domain}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Duration</p>
                    <p className="font-medium text-white">{course.estimated_hours} hours</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Certificate</p>
                    <p className="font-medium text-white">
                      {course.certificate_available ? 'Available' : 'Not Available'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Objectives */}
              {course.course_objectives && course.course_objectives.length > 0 && (
                <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-800/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Course Objectives</h3>
                  <ul className="space-y-3">
                    {course.course_objectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <Award className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prerequisites */}
              {course.prerequisites && course.prerequisites.length > 0 && (
                <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-800/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Prerequisites</h3>
                  <ul className="space-y-2">
                    {course.prerequisites.map((prerequisite, index) => (
                      <li key={index} className="flex items-start">
                        <Circle className="w-2 h-2 text-gray-400 mr-3 mt-2 flex-shrink-0" />
                        <span className="text-gray-300">{prerequisite}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-800/50 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
              <h3 className="text-lg font-semibold text-white">{selectedVideo.title}</h3>
              <button 
                onClick={() => setShowVideoModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800/50 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="aspect-video">
              <iframe
                src={getYouTubeEmbedUrl(selectedVideo.youtube_video_id)}
                className="w-full h-full"
                allowFullScreen
                title={selectedVideo.title}
              />
            </div>
            <div className="p-4 bg-gray-800/30">
              <p className="text-gray-300 mb-2">{selectedVideo.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>Channel: {selectedVideo.channel_name}</span>
                <span>Duration: {formatDuration(selectedVideo.duration_seconds)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePage;
