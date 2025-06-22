'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  Send, 
  Sparkles, 
  BookOpen, 
  Play, 
  Clock, 
  Calendar,
  TrendingUp,
  Zap,
  Brain,
  Target,
  Star,
  ChevronRight,
  Bot,
  User,
  Lightbulb
} from "lucide-react";
import Link from "next/link";

interface Course {
  id: string;
  courseName: string;
  domain: string;
  numberOfDays: number;
  estimatedHours: number;
  difficulty: string;
  createdAt: string;
  progress?: number;
  description?: string;
  tags?: string[];
}

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const Dashboard = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm your AI learning assistant. What would you like to learn today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Mock courses data
  const mockCourses: Course[] = [
    {
      id: 'react-masterclass-2024',
      courseName: 'React Development Masterclass',
      domain: 'Web Development',
      numberOfDays: 5,
      estimatedHours: 20,
      difficulty: 'beginner',
      createdAt: '2024-01-10',
      progress: 30,
      description: 'Build modern web applications with React and Next.js',
      tags: ['React', 'JavaScript', 'Frontend']
    }
  ];

  useEffect(() => {
    // Fetch actual courses from API instead of using mock data
    const fetchCourses = async () => {
      try {
        console.log('🚀 Dashboard: Fetching courses from API...');
        
        // Add cache-busting parameter to ensure fresh data
        const cacheBuster = Date.now();
        const response = await fetch(`/api/courses?t=${cacheBuster}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const apiResult = await response.json();
        console.log('📊 Dashboard: API result:', {
          success: apiResult.success,
          coursesCount: apiResult.courses?.length || 0,
          timestamp: apiResult.timestamp
        });
        
        if (apiResult.success && apiResult.courses) {
          console.log('✅ Dashboard: Setting courses from API');
          setCourses(apiResult.courses);
        } else {
          console.warn('⚠️ Dashboard: API failed, using mock data');
          setCourses(mockCourses);
        }
      } catch (error) {
        console.error('❌ Dashboard: Error fetching courses:', error);
        // Fallback to mock data
        setCourses(mockCourses);
      }
    };

    fetchCourses();
    
    // Set up interval to refresh courses every 30 seconds
    const refreshInterval = setInterval(fetchCourses, 30000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: currentMessage,
      isBot: false,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const courseQuery = currentMessage;
    setCurrentMessage("");
    setIsGenerating(true);

    // Add AI thinking message
    const thinkingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: `I'll help you create a course on "${courseQuery}". Let me generate a comprehensive learning path for you...`,
      isBot: true,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, thinkingMessage]);

    try {
      console.log('🚀 Starting course generation for:', courseQuery);
      
      // Call the actual API
      const response = await fetch('/api/genrateOutline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course: courseQuery,
          userId: 'demo-user'
        }),
      });

      const data = await response.json();
      console.log('📝 API Response:', data);

      if (response.ok && data.success !== false) {
        // Success message
        const successMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          text: `✅ Successfully generated your "${courseQuery}" course! ${data.using_ai ? '🤖 Powered by AI' : '📚 Using enhanced curriculum'}. ${data.saved_to_database ? '💾 Saved to database' : '⚠️ Generated but not saved'}.`,
          isBot: true,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, successMessage]);

        // Create course object from API response
        const newCourse: Course = {
          id: data.id || Date.now().toString(),
          courseName: data.name || `Master ${courseQuery}`,
          domain: data.domain || 'AI Generated',
          numberOfDays: data.numberofdays || data.number_of_days || 5,
          estimatedHours: data.estimated_hours || 15,
          difficulty: data.difficulty_level || 'intermediate',
          createdAt: new Date().toISOString(),
          progress: 0,
          description: Array.isArray(data.Introduction) 
            ? data.Introduction.join(' ') 
            : (data.Introduction || `Comprehensive course covering all aspects of ${courseQuery}`),
          tags: data.tags || ['AI Generated', data.domain || 'Custom']
        };

        console.log('🎯 Generated course:', newCourse);
        setGeneratedCourse(newCourse);
        setCourses(prev => [newCourse, ...prev]);
        
        // Store in localStorage for persistence
        try {
          const storedCourses = JSON.parse(localStorage.getItem('ai-studio-courses') || '[]');
          const updatedCourses = [newCourse, ...storedCourses];
          localStorage.setItem('ai-studio-courses', JSON.stringify(updatedCourses));
          console.log('💾 Course saved to localStorage');
        } catch (storageError) {
          console.warn('⚠️ Failed to save to localStorage:', storageError);
        }

      } else {
        // Error handling
        console.error('❌ Course generation failed:', data);
        const errorMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          text: `❌ Sorry, I couldn't generate the course for "${courseQuery}". ${data.error || data.message || 'Unknown error occurred'}. Please try again.`,
          isBot: true,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } catch (error: any) {
      console.error('❌ Network error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        text: `❌ Network error occurred while generating the course. Please check your connection and try again.`,
        isBot: true,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'from-emerald-500 to-emerald-600';
      case 'intermediate': return 'from-amber-500 to-orange-500';
      case 'advanced': return 'from-red-500 to-red-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const CourseCard = ({ course, isNew = false }: { course: Course; isNew?: boolean }) => (
    <motion.div
      initial={isNew ? { opacity: 0, scale: 0.8, y: 20 } : { opacity: 1 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-md border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:scale-[1.02]"
    >
      {isNew && (
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
            ✨ New
          </span>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
              {course.courseName}
            </h3>
            <p className="text-slate-300 text-sm mb-3">{course.description}</p>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-slate-400 text-sm">{course.domain}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getDifficultyColor(course.difficulty)} text-white`}>
                {course.difficulty}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{course.numberOfDays} days</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{course.estimatedHours}h</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>Course</span>
          </div>
        </div>

        {course.progress !== undefined && course.progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-slate-400 mb-1">
              <span>Progress</span>
              <span>{course.progress}%</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}

        {course.tags && (
          <div className="flex flex-wrap gap-2 mb-4">
            {course.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Link href={`/course/${course.id}/demo-user`} className="flex-1">
            <button className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold border border-slate-600/50 hover:border-slate-500/50">
              <Play className="w-4 h-4" />
              {course.progress && course.progress > 0 ? 'Continue' : 'Start Learning'}
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-96 h-96 bg-slate-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-96 h-96 bg-gray-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex h-screen">
        {/* Left Panel - Course Generation */}
        <div className="w-1/3 p-6 flex flex-col">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
              AI Learning Studio
            </h1>
            <p className="text-slate-400">Generate personalized courses with AI</p>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">AI Course Generator</h3>
                <p className="text-slate-400 text-sm">What do you want to learn?</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    message.isBot 
                      ? 'bg-slate-700/50 text-white border border-slate-600/50' 
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                  }`}>
                    <div className="flex items-start gap-2">
                      {message.isBot && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                      {!message.isBot && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-slate-700/50 text-white p-3 rounded-2xl border border-slate-600/50">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-200"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-400"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="e.g., 'Teach me Python programming'"
                className="flex-1 bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-blue-500/50 transition-colors"
              />
              <button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isGenerating}
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600/50"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Courses Display */}
        <div className="flex-1 p-6">
          <div className="h-full bg-slate-800/20 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Your Learning Journey</h2>
                <p className="text-slate-400">{courses.length} courses available</p>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm">Progress Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span className="text-sm">AI Powered</span>
                </div>
              </div>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-r from-slate-700/30 to-slate-800/30 border border-slate-600/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{courses.length}</div>
                <div className="text-slate-400 text-sm">Total Courses</div>
              </div>
              <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-slate-600/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {courses.reduce((sum, course) => sum + course.numberOfDays, 0)}
                </div>
                <div className="text-slate-400 text-sm">Learning Days</div>
              </div>
              <div className="bg-gradient-to-r from-emerald-600/20 to-emerald-700/20 border border-slate-600/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {courses.reduce((sum, course) => sum + course.estimatedHours, 0)}
                </div>
                <div className="text-slate-400 text-sm">Total Hours</div>
              </div>
              <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-slate-600/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {Math.round(courses.reduce((sum, course) => sum + (course.progress || 0), 0) / courses.length) || 0}%
                </div>
                <div className="text-slate-400 text-sm">Avg Progress</div>
              </div>
            </div>

            {/* Courses Grid */}
            {courses.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lightbulb className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Start Your Learning Journey</h3>
                <p className="text-slate-400 mb-6">Generate your first AI-powered course by chatting with our assistant</p>
                <div className="flex justify-center">
                  <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 max-w-md">
                    <p className="text-slate-300 text-sm">💡 Try asking: "Create a course on Web Development" or "Teach me Machine Learning"</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {courses.map((course, index) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    isNew={index === 0 && generatedCourse?.id === course.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
