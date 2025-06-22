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
  Monitor,
  Play,
  Pause,
  Settings,
  Maximize2,
  Home,
  MessageCircle,
  RefreshCw,
  Search,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

interface VoiceVisualizerProps {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  size: 'small' | 'large';
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ 
  isListening, 
  isProcessing,
  isSpeaking,
  size 
}) => {
  const baseSize = size === 'small' ? 80 : 120;
  
  const getState = () => {
    if (isProcessing) return { color: 'text-yellow-400', bgColor: 'bg-yellow-400/20', text: 'Processing...' };
    if (isSpeaking) return { color: 'text-green-400', bgColor: 'bg-green-400/20', text: 'Speaking...' };
    if (isListening) return { color: 'text-blue-400', bgColor: 'bg-blue-400/20', text: 'Listening...' };
    return { color: 'text-gray-400', bgColor: 'bg-gray-400/20', text: 'Ready' };
  };

  const state = getState();
  
  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Status indicator */}
      <div className="text-sm text-gray-300 mb-2">{state.text}</div>
      
      {/* Main visualizer circle */}
      <motion.div
        className={`relative rounded-full ${state.bgColor} border-2 border-gray-600 flex items-center justify-center cursor-pointer hover:scale-105 transition-all duration-300`}
        animate={{
          scale: (isListening || isProcessing || isSpeaking) ? [1, 1.05, 1] : 1,
          borderColor: (isListening || isProcessing || isSpeaking) ? 
            ['rgba(75, 85, 99, 0.5)', 'rgba(59, 130, 246, 0.8)', 'rgba(75, 85, 99, 0.5)'] :
            'rgba(75, 85, 99, 0.5)'
        }}
        transition={{
          duration: 1.5,
          repeat: (isListening || isProcessing || isSpeaking) ? Infinity : 0,
          ease: "easeInOut"
        }}
        style={{ width: baseSize, height: baseSize }}
      >
        {/* Pulse rings */}
        <AnimatePresence>
          {(isListening || isProcessing || isSpeaking) && (
            <>
              <motion.div
                className="absolute rounded-full border-2 border-blue-400/30"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [0.8, 1.4, 0.8],
                  opacity: [0.4, 0.1, 0.4]
                }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ width: baseSize + 40, height: baseSize + 40 }}
              />
              <motion.div
                className="absolute rounded-full border border-blue-400/20"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ 
                  scale: [0.9, 1.2, 0.9],
                  opacity: [0.6, 0.2, 0.6]
                }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3
                }}
                style={{ width: baseSize + 20, height: baseSize + 20 }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Icon */}
        <div className={`${state.color} relative z-10`}>
          {isProcessing ? (
            <RefreshCw className="w-8 h-8 animate-spin" />
          ) : isSpeaking ? (
            <Volume2 className="w-8 h-8" />
          ) : isListening ? (
            <Mic className="w-8 h-8" />
          ) : (
            <MicOff className="w-8 h-8" />
          )}
        </div>
      </motion.div>
    </div>
  );
};

interface ConversationMessage {
  type: 'user' | 'ai';
  text: string;
  timestamp: number;
}

const PracticePage = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'youtube' | 'excalidraw' | 'notes'>('youtube');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [notesContent, setNotesContent] = useState('');
  const [currentVideoId, setCurrentVideoId] = useState('aircAruvnKk');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredVideos, setFilteredVideos] = useState<typeof educationalVideos>([]);
  const [voiceBackendStatus, setVoiceBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const lastAudioTimestamp = useRef<number>(0);

  // Educational videos database
  const educationalVideos = [
    // Programming
    { id: 'fNk_zzaMoSs', title: 'JavaScript Full Course - 8 Hours', channel: 'Programming with Mosh', category: 'Programming', duration: '8:13:37' },
    { id: 'PkZNo7MFNFg', title: 'Python Tutorial for Beginners', channel: 'Programming with Mosh', category: 'Programming', duration: '6:14:07' },
    { id: 'Tn6-PIqc4UM', title: 'React in 100 Seconds', channel: 'Fireship', category: 'Programming', duration: '2:19' },
    { id: 'WU5gDkOb5Z4', title: 'HTML & CSS Full Course', channel: 'freeCodeCamp', category: 'Programming', duration: '4:31:20' },
    { id: 'rfscVS0vtbw', title: 'Learn Python - Full Course', channel: 'freeCodeCamp', category: 'Programming', duration: '4:26:52' },
    
    // Math & Science
    { id: 'aircAruvnKk', title: 'What is a Neural Network?', channel: '3Blue1Brown', category: 'Math', duration: '19:13' },
    { id: 'IHZwWFHWa-w', title: 'Linear Algebra Essence', channel: '3Blue1Brown', category: 'Math', duration: '17:52' },
    { id: 'WUvTyaaNkzM', title: 'Calculus Explained', channel: '3Blue1Brown', category: 'Math', duration: '22:19' },
    { id: 'spUNpyF58BY', title: 'Machine Learning Explained', channel: 'Zach Star', category: 'AI/ML', duration: '12:19' },
    
    // Business & Design
    { id: 'UhbyZOjIBZo', title: 'UI/UX Design Course', channel: 'AJ&Smart', category: 'Design', duration: '2:45:18' },
    { id: '_vQG9vSFSu8', title: 'Digital Marketing Course', channel: 'Neil Patel', category: 'Marketing', duration: '1:47:33' },
    
    // Science
    { id: 'QcUey-DVYjk', title: 'Quantum Physics Explained', channel: 'MinutePhysics', category: 'Physics', duration: '5:43' },
    { id: 'Qhg8rVB8iM4', title: 'How Evolution Works', channel: 'Kurzgesagt', category: 'Biology', duration: '8:31' },
    { id: 'rhu2-fAW3ck', title: 'Chemistry Basics', channel: 'Crash Course', category: 'Chemistry', duration: '12:54' },
    
    // Technology
    { id: 'k2qgadSvNyU', title: 'How the Internet Works', channel: 'Crash Course', category: 'Technology', duration: '13:36' },
    { id: 'Okg8vQgzIhQ', title: 'Artificial Intelligence Explained', channel: 'TED-Ed', category: 'AI/ML', duration: '5:17' },
  ];

  const categories = ['All', 'Programming', 'Math', 'AI/ML', 'Design', 'Marketing', 'Physics', 'Biology', 'Chemistry', 'Technology'];

  // Update video context for AI assistant
  const updateVideoContext = async (videoId: string) => {
    const video = educationalVideos.find(v => v.id === videoId);
    if (video && voiceBackendStatus === 'connected') {
      try {
        await fetch('http://localhost:8000/update-context', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: video.title,
            id: video.id,
            channel: video.channel,
            category: video.category,
            description: `Educational video about ${video.title} by ${video.channel} in the ${video.category} category.`
          }),
        });
        console.log('Updated video context for AI:', video.title);
      } catch (error) {
        console.error('Error updating video context:', error);
      }
    }
  };

  // Check voice backend connection (updated to port 8000)
  const checkVoiceBackend = async () => {
    try {
      console.log('Checking voice backend connection...');
      const response = await fetch('http://localhost:8000/audio-status');
      if (response.ok) {
        console.log('Voice backend connected successfully');
        setVoiceBackendStatus('connected');
        return true;
      } else {
        console.log('Voice backend response not ok:', response.status);
        setVoiceBackendStatus('disconnected');
        return false;
      }
    } catch (error) {
      console.error('Voice backend connection error:', error);
      setVoiceBackendStatus('disconnected');
      return false;
    }
  };

  // Poll for new audio and conversation updates (updated to port 8000)
  const pollBackend = async () => {
    if (voiceBackendStatus !== 'connected') return;

    try {
      // Check for new audio
      const audioResponse = await fetch('http://localhost:8000/audio-status');
      const audioData = await audioResponse.json();
      
      // Update voice status
      setIsListening(audioData.voice_status?.listening || false);
      setIsProcessing(audioData.voice_status?.processing || false);
      setIsSpeaking(audioData.voice_status?.speaking || false);
      
      // Play new audio if available
      if (audioData.available && audioData.timestamp > lastAudioTimestamp.current) {
        lastAudioTimestamp.current = audioData.timestamp;
        playAudioResponse();
      }

      // Update conversation
      const conversationResponse = await fetch('http://localhost:8000/conversation');
      const conversationData = await conversationResponse.json();
      
      if (conversationData.conversation) {
        setConversation(conversationData.conversation.map((msg: any) => ({
          type: msg.type,
          text: msg.text,
          timestamp: msg.timestamp
        })));
      }
    } catch (error) {
      console.error('Error polling backend:', error);
    }
  };

  // Play audio response from backend (updated to port 8000)
  const playAudioResponse = async () => {
    try {
      console.log('Attempting to play audio response...');
      const audioUrl = `http://localhost:8000/get-audio?t=${Date.now()}`;
      
      // Check if audio file is available first
      const response = await fetch(audioUrl);
      if (!response.ok) {
        console.error('Audio file not available:', response.status);
        return;
      }
      
      const audio = new Audio(audioUrl);
      audio.volume = 0.8; // Set volume to 80%
      
      audio.onloadstart = () => console.log('Audio loading started...');
      audio.oncanplay = () => console.log('Audio can start playing');
      audio.onplay = () => console.log('Audio playback started');
      audio.onended = () => {
        console.log('Audio playback ended');
        setIsSpeaking(false);
      };
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsSpeaking(false);
      };
      
             // Try to play the audio
       const playPromise = audio.play();
       if (playPromise !== undefined) {
         playPromise
           .then(() => {
             console.log('Audio playing successfully');
           })
           .catch(error => {
             console.error('Audio play promise failed (likely autoplay policy):', error);
             // Try to prompt user to enable audio
             if (error.name === 'NotAllowedError') {
               console.log('Browser blocked autoplay. User interaction required.');
               // You could show a notification here asking user to click to enable audio
             }
             setIsSpeaking(false);
           });
       }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsSpeaking(false);
    }
  };

  // Initialize voice recording
  const initializeVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Try to use WAV format if supported, otherwise use default
      const options = { mimeType: 'audio/webm' };
      if (MediaRecorder.isTypeSupported('audio/wav')) {
        options.mimeType = 'audio/wav';
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.mimeType = 'audio/webm;codecs=opus';
      }
      
      console.log('Using audio format:', options.mimeType);
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = [];
        
        console.log('Audio blob created:', { size: audioBlob.size, type: audioBlob.type });
        
        if (audioBlob.size === 0) {
          console.log('No audio data recorded');
          setIsProcessing(false);
          return;
        }
        
        // Send audio to backend (updated to port 8000)
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.wav');
        
        try {
          console.log('Sending audio to backend for processing...');
          const response = await fetch('http://localhost:8000/process-audio', {
            method: 'POST',
            body: formData
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('Audio processed successfully:', result);
            
            // Update conversation if response is available
            if (result.transcription && result.response) {
              // The conversation will be updated by the polling function
              console.log('Transcription:', result.transcription);
              console.log('AI Response:', result.response);
              
              // Play audio response if available
              if (result.audio_available || result.audio_generated) {
                console.log('Audio is ready, starting playback...');
                setIsSpeaking(true);
                // Small delay to ensure audio file is fully written
                setTimeout(() => {
                  playAudioResponse();
                }, 1000);
              }
            }
          } else {
            console.error('Failed to process audio:', response.status);
          }
        } catch (error) {
          console.error('Error sending audio to backend:', error);
        } finally {
          setIsProcessing(false);
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      return true;
    } catch (error) {
      console.error('Error initializing voice recording:', error);
      return false;
    }
  };

  // Toggle voice listening (updated to port 8000)
  const toggleVoiceListening = async () => {
    if (voiceBackendStatus !== 'connected') {
      alert('Voice backend is not connected. Please ensure the AI server is running on port 8000.');
      return;
    }

    try {
      // If currently listening, stop recording
      if (isListening && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        console.log('Stopping voice recording...');
        mediaRecorderRef.current.stop();
        setIsListening(false);
        setIsProcessing(true);
        return;
      }

      // If not listening, start recording
      if (!isListening && mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
        console.log('Starting voice recording...');
        audioChunksRef.current = []; // Clear previous chunks
        mediaRecorderRef.current.start();
        setIsListening(true);
        
        // Auto-stop after 10 seconds to prevent indefinite recording
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsListening(false);
            setIsProcessing(true);
          }
        }, 10000);
        return;
      }

      // Fallback: toggle backend state
      const response = await fetch('http://localhost:8000/toggle-listening', {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Voice status toggled:', result);
      }
    } catch (error) {
      console.error('Error toggling voice:', error);
      setIsListening(false);
      setIsProcessing(false);
    }
  };

  // Filter videos based on search and category
  useEffect(() => {
    let filtered = educationalVideos;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(video => video.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredVideos(filtered);
  }, [searchQuery, selectedCategory]);

  // Initialize and poll backend
  useEffect(() => {
    checkVoiceBackend();
    initializeVoiceRecording();
    
    // Update context for default video after a short delay to ensure backend is ready
    setTimeout(() => {
      updateVideoContext(currentVideoId);
    }, 2000);
    
    const pollInterval = setInterval(pollBackend, 1000);
    const statusInterval = setInterval(checkVoiceBackend, 5000);
    
    return () => {
      clearInterval(pollInterval);
      clearInterval(statusInterval);
    };
  }, []); // Remove voiceBackendStatus dependency to prevent infinite loop

  // Extract video ID from YouTube URL
  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Handle search/URL input
  const handleVideoSearch = () => {
    if (searchQuery.trim()) {
      const videoId = extractVideoId(searchQuery);
      if (videoId) {
        setCurrentVideoId(videoId);
        updateVideoContext(videoId);
      } else {
        setCurrentVideoId('aircAruvnKk');
        updateVideoContext('aircAruvnKk');
      }
    }
  };

  const renderIframe = () => {
    switch (selectedTab) {
      case 'youtube':
        return (
          <div className="w-full h-full bg-[#0A0A0F] flex flex-col">
            {/* YouTube Header */}
            <div className="bg-[#13131f] border-b border-gray-700 p-4 flex-shrink-0">
              <div className="flex items-center space-x-4 mb-4">
                <Youtube className="w-8 h-8 text-red-500" />
                <h2 className="text-xl font-semibold text-white">Educational Content</h2>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  voiceBackendStatus === 'connected' ? 'bg-green-900/30 text-green-400' :
                  voiceBackendStatus === 'disconnected' ? 'bg-red-900/30 text-red-400' :
                  'bg-yellow-900/30 text-yellow-400'
                }`}>
                  AI Assistant: {voiceBackendStatus === 'connected' ? 'Connected' : 
                                voiceBackendStatus === 'disconnected' ? 'Disconnected' : 'Checking...'}
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search educational videos or paste YouTube URL..."
                  className="flex-1 px-4 py-2 bg-[#1d1d2d] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleVideoSearch}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
              
              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      selectedCategory === category
                        ? 'bg-red-600 text-white'
                        : 'bg-[#1d1d2d] text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* YouTube Content - Fixed Layout */}
            <div className="flex-1 flex min-h-0">
              {/* Video Player */}
              <div className="flex-1 bg-black flex flex-col">
                <div className="flex-1">
                  <iframe
                    src={`https://www.youtube.com/embed/${currentVideoId}?enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Educational Video"
                  />
                </div>
              </div>
              
              {/* Video Suggestions - Fixed Scrolling */}
              <div className="w-80 bg-[#13131f] border-l border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Recommended Videos</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 space-y-3">
                    {filteredVideos.slice(0, 20).map(video => (
                      <div
                        key={video.id}
                        onClick={() => {
                          setCurrentVideoId(video.id);
                          updateVideoContext(video.id);
                        }}
                        className={`flex space-x-3 cursor-pointer hover:bg-[#1d1d2d] p-2 rounded-lg transition-colors ${
                          currentVideoId === video.id ? 'bg-[#1d1d2d] border border-blue-500' : ''
                        }`}
                      >
                        <img
                          src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-20 h-14 object-cover rounded flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white line-clamp-2 mb-1">
                            {video.title}
                          </h4>
                          <p className="text-xs text-gray-400 truncate">{video.channel}</p>
                          <p className="text-xs text-gray-500">{video.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'excalidraw':
        return (
          <div className="w-full h-full bg-white">
            <iframe
              src="https://excalidraw.com"
              className="w-full h-full border-0"
              title="Excalidraw - Drawing Tool"
            />
          </div>
        );
        
      case 'notes':
        return (
          <div className="w-full h-full bg-[#13131f] p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white mb-2">Learning Notes</h2>
              <p className="text-gray-400">Take notes while learning. Your AI assistant can help explain concepts!</p>
            </div>
            <textarea
              value={notesContent}
              onChange={(e) => setNotesContent(e.target.value)}
              placeholder="Start taking notes here... Ask your AI assistant questions about what you're learning!"
              className="w-full h-full bg-[#1d1d2d] border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Header */}
      <div className="bg-[#13131f] border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <button className="flex items-center space-x-2 px-4 py-2 bg-[#1d1d2d] hover:bg-gray-600 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            </Link>
            <h1 className="text-2xl font-bold">AI Learning Practice</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-[#1d1d2d] hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
                            <Link href="http://localhost:8000/health" target="_blank">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                <ExternalLink className="w-4 h-4" />
                <span>AI Status</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className={`flex ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-80px)]'}`}>
        {/* Left Side - AI Assistant */}
        <div className="w-80 bg-[#13131f] border-r border-gray-700 flex flex-col">
          {/* Voice Control */}
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-center">AI Learning Assistant</h3>
            
            {/* Current Context Indicator */}
            {selectedTab === 'youtube' && (
              <div className="mb-4 p-3 bg-[#1d1d2d] rounded-lg border border-gray-600">
                <div className="text-xs text-gray-400 mb-1">AI is aware of:</div>
                <div className="text-sm text-white truncate">
                  {educationalVideos.find(v => v.id === currentVideoId)?.title || 'Current video'}
                </div>
                <div className="text-xs text-gray-500">
                  {educationalVideos.find(v => v.id === currentVideoId)?.channel || 'YouTube'}
                </div>
              </div>
            )}
            
            <div className="flex justify-center mb-4">
              <div onClick={toggleVoiceListening}>
                <VoiceVisualizer
                  isListening={isListening}
                  isProcessing={isProcessing}
                  isSpeaking={isSpeaking}
                  size="large"
                />
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">
                Click the microphone to ask questions about what you're learning
              </p>
              <button
                onClick={toggleVoiceListening}
                disabled={voiceBackendStatus !== 'connected'}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  voiceBackendStatus === 'connected'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isListening ? 'Stop Listening' : 'Start Conversation'}
              </button>
            </div>
          </div>

          {/* Conversation History */}
          <div className="flex-1 flex flex-col p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-semibold">Learning Conversation</h4>
              {conversation.length > 0 && (
                <span className="text-xs text-gray-400 bg-[#1d1d2d] px-2 py-1 rounded">
                  {conversation.filter(m => m.type === 'user').length} questions
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {conversation.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Start a conversation with your AI assistant!</p>
                  <p className="text-sm mt-2">Try asking:</p>
                  <div className="mt-3 space-y-1 text-xs">
                    <p>"What can you see on the screen?"</p>
                    <p>"Explain this concept to me"</p>
                    <p>"What should I focus on?"</p>
                    <p>"Can you give me an example?"</p>
                  </div>
                </div>
              ) : (
                conversation.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg transition-all duration-200 ${
                      message.type === 'user'
                        ? 'bg-blue-600/20 border-l-4 border-blue-500 ml-2'
                        : 'bg-green-600/20 border-l-4 border-green-500 mr-2'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">
                        {message.type === 'user' ? '🎤 You' : '🤖 AI Assistant'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(message.timestamp * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 leading-relaxed">{message.text}</div>
                    {message.type === 'ai' && index === conversation.length - 1 && (
                      <div className="mt-2 pt-2 border-t border-gray-600">
                        <button
                          onClick={playAudioResponse}
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Play audio</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-700">
            <div className="text-xs text-gray-400 mb-2">Quick Actions:</div>
            <div className="space-y-2">
              <button
                                  onClick={() => window.open('http://localhost:8000/health', '_blank')}
                className="w-full text-left px-3 py-2 bg-[#1d1d2d] hover:bg-gray-600 rounded text-sm transition-colors"
              >
                🔗 Check AI Status
              </button>
              <button
                onClick={checkVoiceBackend}
                className="w-full text-left px-3 py-2 bg-[#1d1d2d] hover:bg-gray-600 rounded text-sm transition-colors"
              >
                🔄 Refresh Connection
              </button>
              <button
                onClick={() => {
                  console.log('Manual audio play triggered');
                  playAudioResponse();
                }}
                className="w-full text-left px-3 py-2 bg-[#1d1d2d] hover:bg-gray-600 rounded text-sm transition-colors"
              >
                🔊 Play Last Response
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="bg-[#13131f] border-b border-gray-700 p-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedTab('youtube')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedTab === 'youtube' ? 'bg-red-600 text-white' : 'bg-[#1d1d2d] text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Youtube className="w-5 h-5" />
                <span>Educational Videos</span>
              </button>
              <button
                onClick={() => setSelectedTab('excalidraw')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedTab === 'excalidraw' ? 'bg-green-600 text-white' : 'bg-[#1d1d2d] text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Monitor className="w-5 h-5" />
                <span>Drawing Board</span>
              </button>
              <button
                onClick={() => setSelectedTab('notes')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedTab === 'notes' ? 'bg-purple-600 text-white' : 'bg-[#1d1d2d] text-gray-300 hover:bg-gray-600'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Notes</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {renderIframe()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticePage;