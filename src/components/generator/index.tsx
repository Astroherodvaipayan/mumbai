"use client";
import { PlaceholdersAndVanishInput } from "@/components/ui/DashBoard/placeholders-and-vanish-input";
import { ArrowUpRight, Book, Calendar, Clock, Target, Users, Award, Play, FileText, Zap } from "lucide-react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCredit } from "../credit-provider";
import { CourseCardProps } from "@/types";
import { useBlur } from "@/components/ui/blur-provider";
import { createWorker } from 'tesseract.js';
import { Paperclip } from 'lucide-react';
import { CircleX } from 'lucide-react';
import { placeholders_arr } from "@/lib/utils";

function toTitleCase(str: string) {
  if (str && str.length > 100 && str.includes('"')) {
    const match = str.match(/"([^"]+)"/);
    if (match) {
      str = match[1];
    } else {
      str = str.substring(0, 50) + "...";
    }
  }
  
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const CourseCard = ({ day, modules }: CourseCardProps) => {
  return (
    <div className="group border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 bg-white dark:bg-gray-800 hover:scale-105 transform">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-bold text-purple-600 dark:text-purple-400">{day}</h2>
      </div>
      <ul className="space-y-2">
        {modules.map((module: string, index: number) => (
          <li key={index} className="flex items-start group-hover:translate-x-1 transition-transform duration-300">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">{module}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const placeholders = placeholders_arr();

export function Placeholders() {
  const { isBlurred, setIsBlurred } = useBlur();
  const [Query, setQuery] = useState<string>("deep learning");
  const [generating, setGenerating] = useState<boolean>(false);
  const [isDisable, setisDisable] = useState<boolean>(false);
  const [course, setcourse] = useState<{ [key: string]: any }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [ocrResult, setOcrResult] = useState<string>('');
  const [ocrStatus, setOcrStatus] = useState<string>('');
  const [animationKey, setAnimationKey] = useState<number>(0);
  const session: any = useCurrentUser();
  const { Credit, setCredit } = useCredit();

  // Trigger animation when course changes
  useEffect(() => {
    if (Object.keys(course).length > 0) {
      setAnimationKey(prev => prev + 1);
    }
  }, [course]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (Query.length > e.target.value.length) {
      setcourse({});
      setErrorMessage(null);
    }
    setQuery(e.target.value);
  };

  const readImageText = async (): Promise<string> => {
    if (!file) return '';

    setOcrStatus('Processing...');
    const worker = await createWorker('eng', 1, {
      logger: m => console.log(m),
    });

    try {
      const {
        data: { text },
      } = await worker.recognize(file);

      setOcrResult(text);
      setOcrStatus('Completed');
      return text;
    } catch (error) {
      console.error(error);
      setOcrStatus('Error occurred during processing.');
      return '';
    } finally {
      await worker.terminate();
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGenerating(true);

    if (Credit < 0) {
      setisDisable(true);
      setErrorMessage("Insufficient credits");
    }

    setCredit(Credit - 1);

    let updatedQuery = Query;
    if (file) {
      const ocrText = await readImageText();
      const serializedOcrText = ocrText.replace(/\s+/g, ' ').trim();
      updatedQuery += " Based on " + serializedOcrText;
      setQuery(updatedQuery);
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/genrateOutline`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            course: updatedQuery,
            userId: session.id,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        console.log('🎯 Course Generation Response:', data);
        
        // Check if the response indicates success
        if (data.success === false || data.error) {
          setErrorMessage(data.error || data.message || "Course generation failed");
          setcourse({});
        } else {
          setErrorMessage(null);
          setcourse(data);
          
          // Log successful generation info
          if (data.message) {
            console.log('✅ Course Generation Status:', data.message);
            console.log('🤖 Using AI:', data.using_ai);
            console.log('💾 Saved to DB:', data.saved_to_database);
          }
        }
        setGenerating(false);
      } catch (error) {
        console.error('❌ Course Generation Error:', error);
        setErrorMessage("Failed to fetch courses. Please try again.");
        setcourse({});
        setGenerating(false);
      }
    };

    fetchData();
  };

  const renderLeftPanel = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Create Your
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            Perfect Course
          </span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Transform your ideas into comprehensive learning experiences with AI-powered course generation
        </p>
      </div>

      {/* Input Section */}
      <div className="flex-1">
        <div className="mb-6">
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={handleChange}
            handleFileChange={handleFileChange}
            onSubmit={onSubmit}
            isDisabled={isDisable}
          />
        </div>

        {/* File Upload Display */}
        {file && (
          <div className="mb-6 animate-slide-up">
            <div className="flex items-center bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-center bg-purple-600 text-white px-3 py-2 rounded-md">
                <Paperclip size={15} className="mr-2" />
                <span className="text-sm font-medium">{file.name}</span>
                <CircleX 
                  className="ml-2 cursor-pointer hover:text-red-300 transition-colors" 
                  size={16}
                  onClick={() => setFile(null)} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Zap className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">AI-Powered</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">Smart course generation</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Target className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">Structured</h3>
              <p className="text-sm text-green-700 dark:text-green-300">Day-by-day curriculum</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRightPanel = () => {
    if (Query.trim() === "") {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="animate-pulse">
            <Book className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Ready to Create?
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Enter your course topic to generate a comprehensive learning plan
          </p>
        </div>
      );
    }

    if (generating) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-8 h-8 text-purple-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mt-6 mb-2">
            Creating Your Course
          </h3>
          <p className="text-gray-500 dark:text-gray-400 animate-pulse">
            AI is crafting your perfect learning experience...
          </p>
        </div>
      );
    }

    if (errorMessage) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
            <Image
              width="40"
              height="40"
              alt="Error"
              src="/Danger.png"
              className="opacity-75"
            />
          </div>
          <h3 className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-2">
            {errorMessage === "Insufficient credits" ? "No Credits Left" : "Generation Failed"}
          </h3>
          <p className="text-red-500 dark:text-red-300">
            {errorMessage}
          </p>
        </div>
      );
    }

    if (Object.keys(course).length > 0) {
      return (
        <div key={animationKey} className="h-full overflow-y-auto animate-slide-in-right">
          {/* Course Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 mb-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  {course.name ? toTitleCase(course.name) : 'Generated Course'}
                </h1>
                <p className="text-purple-100 opacity-90">
                  {course.Introduction && Array.isArray(course.Introduction) && course.Introduction.length > 0
                    ? course.Introduction.join(" ")
                    : course.Introduction && typeof course.Introduction === 'string'
                      ? course.Introduction
                      : "Your comprehensive learning journey starts here"}
                </p>
              </div>
              <Link
                className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
                href={`/course/${course.id}/${session?.id || 'anonymous'}`}
              >
                Start Learning <ArrowUpRight size={16} className="ml-2" />
              </Link>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-3">
                  <Calendar className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-lg font-bold">{course.numberofdays || 5}</div>
                  <div className="text-xs opacity-75">Days</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-3">
                  <Clock className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-lg font-bold">{course.estimated_hours || 15}</div>
                  <div className="text-xs opacity-75">Hours</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-3">
                  <Award className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-lg font-bold capitalize">{course.difficulty_level || 'Beginner'}</div>
                  <div className="text-xs opacity-75">Level</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-3">
                  <Users className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-lg font-bold">{course.domain || 'General'}</div>
                  <div className="text-xs opacity-75">Domain</div>
                </div>
              </div>
            </div>

            {/* Storage Status */}
            <div className="bg-white/10 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Storage Status:</span>
                <span className={`font-semibold ${course.saved_to_database ? 'text-green-300' : 'text-yellow-300'}`}>
                  {course.saved_to_database ? '✅ Saved to Database' : '⚠️ Using Fallback Storage'}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span>AI Generation:</span>
                <span className={`font-semibold ${course.using_ai ? 'text-green-300' : 'text-orange-300'}`}>
                  {course.using_ai ? '🤖 AI Generated' : '📝 Fallback Content'}
                </span>
              </div>
            </div>
          </div>

          {/* Learning Objectives */}
          {course.learning_objectives && course.learning_objectives.length > 0 && (
            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Target className="w-6 h-6 mr-2 text-purple-600" />
                Learning Objectives
              </h2>
              <div className="grid gap-3">
                {course.learning_objectives.map((objective: string, index: number) => (
                  <div key={index} className="flex items-start bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{objective}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Structure */}
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Book className="w-6 h-6 mr-2 text-purple-600" />
              Course Structure
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(course).map((day) =>
                day.includes("Day") &&
                Array.isArray(course[day]) &&
                course[day].length > 0 ? (
                  <CourseCard
                    key={day}
                    day={day}
                    modules={course[day]}
                  />
                ) : null
              )}
              {!Object.keys(course).some(key => key.includes("Day") && Array.isArray(course[key]) && course[key].length > 0) && (
                <div className="col-span-2 text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Course structure will be available after generation</p>
                </div>
              )}
            </div>
          </div>

          {/* Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reference Books */}
            {course.ReferenceBooks && Array.isArray(course.ReferenceBooks) && course.ReferenceBooks.length > 0 && (
              <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Reference Books
                </h3>
                <div className="space-y-3">
                  {course.ReferenceBooks.map((book: any, index: number) => (
                    <div
                      key={index}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => {
                        if (book.source) {
                          window.open(book.source, "_blank");
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                            {book.title || "Reference Book"}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {book.author || "Educational Resource"}
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Resources */}
            {course.YouTubeReferences && Array.isArray(course.YouTubeReferences) && course.YouTubeReferences.length > 0 && (
              <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Play className="w-5 h-5 mr-2 text-purple-600" />
                  Video Resources
                </h3>
                <div className="space-y-3">
                  {course.YouTubeReferences.map((video: any, index: number) => (
                    <div
                      key={index}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => {
                        if (video.url) {
                          window.open(video.url, "_blank");
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                            {video.title || "Video Tutorial"}
                          </h4>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{video.duration || "N/A"} min</span>
                            <span className="mx-2">•</span>
                            <span className="capitalize">{video.level || "All levels"}</span>
                          </div>
                        </div>
                        <Play className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isBlurred ? "blur-sm" : ""}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)]">
          {/* Left Panel - Input */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 overflow-y-auto">
            {renderLeftPanel()}
          </div>

          {/* Right Panel - Generated Course */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            {renderRightPanel()}
          </div>
        </div>
      </div>
    </div>
  );
}
