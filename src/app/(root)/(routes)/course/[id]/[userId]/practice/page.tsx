'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  ArrowLeft,
  Youtube,
  Pen,
  PenTool,
  Monitor,
  Play,
  Pause,
  Settings,
  Maximize2
} from "lucide-react";
import Link from "next/link";

interface VoiceVisualizerProps {
  isListening: boolean;
  audioLevel: number;
  size: 'small' | 'large';
  type: 'user' | 'ai';
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ 
  isListening, 
  audioLevel, 
  size, 
  type 
}) => {
  const baseSize = size === 'small' ? 80 : 120;
  const animationSize = baseSize + (audioLevel * 40);
  
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer ripple effect */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            className={`absolute rounded-full ${
              type === 'user' 
                ? 'bg-blue-500/20 border-2 border-blue-500/40' 
                : 'bg-purple-500/20 border-2 border-purple-500/40'
            }`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.2, 0.8],
              opacity: [0.3, 0.1, 0.3]
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              width: animationSize + 60,
              height: animationSize + 60,
            }}
          />
        )}
      </AnimatePresence>

      {/* Middle pulse */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            className={`absolute rounded-full ${
              type === 'user' 
                ? 'bg-blue-500/30' 
                : 'bg-purple-500/30'
            }`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ 
              scale: [0.9, 1.1, 0.9],
              opacity: [0.5, 0.2, 0.5]
            }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2
            }}
            style={{
              width: animationSize + 30,
              height: animationSize + 30,
            }}
          />
        )}
      </AnimatePresence>

      {/* Main circle */}
      <motion.div
        className={`relative rounded-full ${
          type === 'user' 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25' 
            : 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/25'
        } flex items-center justify-center`}
        animate={{
          scale: isListening ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 0.8,
          repeat: isListening ? Infinity : 0,
          ease: "easeInOut"
        }}
        style={{
          width: animationSize,
          height: animationSize,
        }}
      >
        {/* Icon */}
        <div className="text-white">
          {type === 'user' ? (
            isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />
          ) : (
            isListening ? <Volume2 className="w-10 h-10" /> : <VolumeX className="w-10 h-10" />
          )}
        </div>

        {/* Inner glow effect */}
        <div className={`absolute inset-2 rounded-full ${
          type === 'user' 
            ? 'bg-gradient-to-br from-blue-400/20 to-transparent' 
            : 'bg-gradient-to-br from-purple-400/20 to-transparent'
        }`} />
      </motion.div>

      {/* Audio level bars for AI */}
      {type === 'ai' && isListening && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white/60 rounded-full"
              style={{
                width: 2,
                height: 20 + (audioLevel * 30),
                transform: `rotate(${i * 45}deg) translateY(-${baseSize/2 + 20}px)`,
              }}
              animate={{
                height: [
                  20 + (audioLevel * 30),
                  30 + (audioLevel * 40),
                  20 + (audioLevel * 30)
                ],
                opacity: [0.6, 0.9, 0.6]
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const PracticePage = ({ params }: { params: { id: string; userId: string } }) => {
  const [isListening, setIsListening] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [userAudioLevel, setUserAudioLevel] = useState(0);
  const [aiAudioLevel, setAiAudioLevel] = useState(0);
  const [selectedTab, setSelectedTab] = useState<'youtube' | 'excalidraw' | 'notes'>('youtube');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [conversation, setConversation] = useState<Array<{
    type: 'user' | 'ai';
    text: string;
    timestamp: Date;
  }>>([]);
  const [notesContent, setNotesContent] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  // Initialize audio context and microphone
  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Set up MediaRecorder for voice recording
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to use voice features');
      return false;
    }
  };

  // Analyze audio levels
  const analyzeAudio = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    const normalizedLevel = Math.min(average / 128, 1);
    
    setUserAudioLevel(normalizedLevel);
    
    if (isListening) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  };

  // Start/stop listening
  const toggleListening = async () => {
    if (!isListening) {
      const initialized = await initializeAudio();
      if (initialized) {
        setIsListening(true);
        analyzeAudio();
        
        // Start recording
        mediaRecorderRef.current?.start();
        
        // Simulate AI response after some time
        setTimeout(() => {
          setIsListening(false);
          setIsAiResponding(true);
          simulateAiResponse();
        }, 5000);
      }
    } else {
      setIsListening(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      mediaRecorderRef.current?.stop();
    }
  };

  // Simulate AI response with audio visualization
  const simulateAiResponse = () => {
    let duration = 0;
    const maxDuration = 3000; // 3 seconds
    
    const animate = () => {
      if (duration < maxDuration) {
        const progress = duration / maxDuration;
        const level = Math.sin(progress * Math.PI * 8) * 0.5 + 0.5;
        setAiAudioLevel(level);
        
        duration += 50;
        setTimeout(animate, 50);
      } else {
        setIsAiResponding(false);
        setAiAudioLevel(0);
        
        // Add to conversation
        setConversation(prev => [
          ...prev,
          {
            type: 'user',
            text: 'Can you help me understand this concept better?',
            timestamp: new Date()
          },
          {
            type: 'ai',
            text: 'Of course! I\'d be happy to help explain any concept you\'re working on. Feel free to ask specific questions and I\'ll provide detailed explanations with examples.',
            timestamp: new Date()
          }
        ]);
      }
    };
    
    animate();
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const renderIframe = () => {
    switch (selectedTab) {
      case 'youtube':
        return (
          <div className="w-full h-full">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Paste YouTube URL or search for educational videos..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <iframe
              src="https://www.youtube.com/embed/videoseries?list=PLWKjhJtqVAbnqBxcdjVGgT3uVR10bzTEB"
              className="w-full h-[calc(100%-60px)] border-0 rounded-lg"
              allowFullScreen
              title="YouTube Educational Videos"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        );
      case 'excalidraw':
        return (
          <iframe
            src="https://excalidraw.com/"
            className="w-full h-full border-0 rounded-lg"
            title="Excalidraw - Drawing Tool"
            allow="clipboard-write"
          />
        );
      case 'notes':
        return (
          <div className="w-full h-full bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Practice Notes</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setNotesContent('')}
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  Clear
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
            <textarea
              value={notesContent}
              onChange={(e) => setNotesContent(e.target.value)}
              className="w-full h-[calc(100%-80px)] p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Take notes during your practice session...

You can:
• Write down key concepts
• Jot down questions for later
• Summarize what you've learned
• Create to-do lists

Your notes are automatically saved as you type."
              style={{ fontSize: '16px', lineHeight: '1.5' }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href={`/course/${params.id}/${params.userId}`}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Course
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900">Practice Session</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                title={isFullscreen ? "Show AI Assistant" : "Hide AI Assistant"}
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`grid ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-8 h-[calc(100vh-200px)]`}>
          
          {/* Left Side - Voice AI Interface */}
          {!isFullscreen && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <h2 className="text-2xl font-bold mb-2">AI Practice Assistant</h2>
                <p className="text-blue-100">Ask questions, get explanations, and practice your knowledge</p>
              </div>

              <div className="flex-1 flex flex-col h-[calc(100%-120px)]">
                {/* Conversation History */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {conversation.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <div className="mb-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Mic className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium">Ready to help you practice!</p>
                        <p className="text-sm mt-2">Click the microphone button below to start asking questions</p>
                        <div className="mt-4 text-xs text-gray-400">
                          <p>Try asking:</p>
                          <ul className="mt-2 space-y-1">
                            <li>"Can you explain this concept?"</li>
                            <li>"Give me a practice question"</li>
                            <li>"How does this work?"</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {conversation.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              message.type === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Voice Interface */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-8">
                    {/* User Voice Input */}
                    <div className="flex flex-col items-center space-y-3">
                      <VoiceVisualizer
                        isListening={isListening}
                        audioLevel={userAudioLevel}
                        size="small"
                        type="user"
                      />
                      <span className="text-sm text-gray-600">You</span>
                    </div>

                    {/* AI Response */}
                    <div className="flex flex-col items-center space-y-3">
                      <VoiceVisualizer
                        isListening={isAiResponding}
                        audioLevel={aiAudioLevel}
                        size="large"
                        type="ai"
                      />
                      <span className="text-sm text-gray-600">AI Assistant</span>
                    </div>
                  </div>

                  {/* Mic Button */}
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={toggleListening}
                      disabled={isAiResponding}
                      className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                        isListening
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      } ${
                        isAiResponding ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isListening ? 'Stop Recording' : isAiResponding ? 'AI Responding...' : 'Start Recording'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right Side - Iframe System */}
          <div className={`bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden ${isFullscreen ? 'h-screen' : ''}`}>
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedTab('youtube')}
                className={`flex items-center px-6 py-4 font-medium transition-colors ${
                  selectedTab === 'youtube'
                    ? 'text-red-600 border-b-2 border-red-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Youtube className="w-5 h-5 mr-2" />
                YouTube
              </button>
              <button
                onClick={() => setSelectedTab('excalidraw')}
                className={`flex items-center px-6 py-4 font-medium transition-colors ${
                  selectedTab === 'excalidraw'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <PenTool className="w-5 h-5 mr-2" />
                Excalidraw
              </button>
              <button
                onClick={() => setSelectedTab('notes')}
                className={`flex items-center px-6 py-4 font-medium transition-colors ${
                  selectedTab === 'notes'
                    ? 'text-green-600 border-b-2 border-green-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Pen className="w-5 h-5 mr-2" />
                Notes
              </button>
            </div>

            {/* Content Area */}
            <div className={`${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[calc(100vh-280px)]'} p-4`}>
              {renderIframe()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticePage; 