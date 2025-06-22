"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Brain, 
  MessageCircle, 
  Send, 
  ChevronLeft, 
  ChevronRight,
  GraduationCap,
  Target,
  Trophy,
  Lightbulb,
  Rocket,
  Star,
  Box,
  Play,
  Sparkles,
  Zap,
  Volume2,
  VolumeX
} from "lucide-react";

const learningQuotes = [
  "Craft your knowledge like building in Minecraft - block by block! 🎮",
  "Level up your skills and unlock new achievements! 🏆",
  "Mine deep into learning and discover hidden treasures! 💎",
  "Build your future with the blocks of knowledge! 🧱",
  "Every expert was once a noob. Keep grinding! ⚡",
  "Respawn stronger with every lesson learned! 🔄"
];

const suggestedTopics = [
  "Machine Learning Quest",
  "Web Development Adventure", 
  "Digital Marketing Campaign",
  "Python Programming Journey",
  "Data Science Expedition",
  "UI/UX Design Workshop"
];

export default function Home() {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [chatMessage, setChatMessage] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    localStorage.clear();
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % learningQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextQuote = () => {
    setCurrentQuote((prev) => (prev + 1) % learningQuotes.length);
  };

  const prevQuote = () => {
    setCurrentQuote((prev) => (prev - 1 + learningQuotes.length) % learningQuotes.length);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden">
      {/* Background Video */}
      <video 
        ref={videoRef}
        autoPlay 
        loop 
        muted={isMuted}
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/hero-bg.mp4" type="video/mp4" />
        <source src="/videos/vid.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Enhanced Gradient Overlays */}
      <div className="absolute inset-0 z-10">
        {/* Primary dark overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0F]/95 via-[#12121d]/90 to-[#1a0b2e]/95"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-br from-indigo-600/25 to-purple-600/25 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-blob"></div>
        </div>

        {/* Particle effect overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent)] opacity-60"></div>
        
        {/* Enhanced Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.1)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-15 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Video Control */}
      <button
        onClick={toggleMute}
        className="fixed top-6 right-6 z-30 bg-black/20 backdrop-blur-sm border border-white/10 p-3 rounded-full text-white hover:bg-black/30 transition-all"
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      {/* Navigation */}
      <nav className="relative z-20 p-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-6">
            <Link href="/dashboard">
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-black/20 backdrop-blur-md border border-purple-500/30 px-6 py-3 rounded-2xl text-white font-bold hover:bg-purple-900/20 transition-all shadow-lg hover:shadow-purple-500/25"
              >
                <BookOpen className="w-5 h-5" />
                Learning
              </motion.button>
            </Link>
            <Link href="/practice">
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-black/20 backdrop-blur-md border border-emerald-500/30 px-6 py-3 rounded-2xl text-white font-bold hover:bg-emerald-900/20 transition-all shadow-lg hover:shadow-emerald-500/25"
              >
                <Target className="w-5 h-5" />
                Practice
              </motion.button>
            </Link>
          </div>
          
          <div>
            <Link href="/login">
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-8 py-3 rounded-2xl text-white font-bold transition-all shadow-lg border border-purple-400/30 hover:shadow-xl hover:shadow-purple-500/30 backdrop-blur-sm"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Start Quest
                  <Rocket className="w-5 h-5" />
                </span>
              </motion.button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-20 container mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="mb-8">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="text-8xl md:text-[12rem] font-black bg-gradient-to-r from-purple-400 via-pink-500 via-indigo-500 to-cyan-400 bg-clip-text text-transparent mb-6 tracking-tight leading-none drop-shadow-2xl"
            >
              LEARN
            </motion.h1>
            <motion.h2 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
              className="text-6xl md:text-8xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent leading-none drop-shadow-2xl"
            >
              LIKE A PRO
            </motion.h2>
          </div>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-2xl md:text-4xl text-white/95 max-w-5xl mx-auto mb-12 font-medium leading-relaxed backdrop-blur-sm"
          >
            🎮 Learn Everything and master everything
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">Mine knowledge, craft expertise, build your future!</span>
          </motion.p>

          {/* Enhanced Feature Blocks */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16"
          >
            {[
              {
                icon: Brain,
                title: "AI-Powered Engine",
                description: "Smart algorithms craft personalized learning adventures just for you!",
                gradient: "from-blue-600 to-indigo-700",
                borderColor: "border-blue-500/40",
                textColor: "text-blue-200"
              },
              {
                icon: GraduationCap,
                title: "Epic Content",
                description: "Legendary content crafted by master builders and expert educators!",
                gradient: "from-emerald-600 to-green-700",
                borderColor: "border-emerald-500/40",
                textColor: "text-emerald-200"
              },
              {
                icon: Trophy,
                title: "Achievement System",
                description: "Track your epic journey and unlock legendary achievements!",
                gradient: "from-amber-600 to-orange-700",
                borderColor: "border-amber-500/40",
                textColor: "text-amber-200"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  rotateY: 5,
                  rotateX: 5 
                }}
                transition={{ duration: 0.3 }}
                className={`bg-black/20 backdrop-blur-md border-2 ${feature.borderColor} rounded-3xl p-8 hover:border-opacity-70 transition-all duration-300 shadow-2xl hover:shadow-3xl group`}
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl mb-6 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">{feature.title}</h3>
                <p className={`${feature.textColor} text-lg leading-relaxed`}>{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Enhanced Quote Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="bg-black/20 backdrop-blur-md border-2 border-purple-500/40 rounded-3xl p-10 mb-12 max-w-6xl mx-auto shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-3xl font-bold text-white flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-amber-400 animate-pulse" />
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Daily Power-Up</span>
              <Zap className="w-8 h-8 text-blue-400 animate-bounce" />
            </h3>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevQuote}
                className="p-3 bg-black/30 backdrop-blur-sm rounded-2xl hover:bg-purple-900/30 transition-all border border-purple-500/30 shadow-lg"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextQuote}
                className="p-3 bg-black/30 backdrop-blur-sm rounded-2xl hover:bg-purple-900/30 transition-all border border-purple-500/30 shadow-lg"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </motion.button>
            </div>
          </div>
          
          <motion.p 
            key={currentQuote}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl text-white text-center font-medium leading-relaxed"
          >
            {learningQuotes[currentQuote]}
          </motion.p>
        </motion.div>

        {/* Enhanced Chat Interface */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="max-w-6xl mx-auto mb-12"
        >
          <div className="bg-black/20 backdrop-blur-md border-2 border-blue-500/40 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="What epic skill do you want to master? (e.g., 'Teach me Python like a game!')"
                  className="w-full bg-black/30 backdrop-blur-sm border-2 border-blue-500/30 rounded-2xl px-6 py-4 text-white placeholder-blue-200/70 outline-none text-xl focus:border-blue-400/50 transition-all shadow-inner"
                />
              </div>
              <Link href="/dashboard">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600 p-4 rounded-2xl transition-all border border-indigo-400/30 shadow-lg hover:shadow-xl"
                >
                  <Send className="w-8 h-8 text-white" />
                </motion.button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {["🤖 AI & ML", "🌐 Web Dev", "📊 Data Science", "🎨 Design", "💼 Business", "🎮 Game Dev"].map((tag, index) => (
                <motion.span
                  key={tag}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-4 py-2 bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl text-lg text-white cursor-pointer hover:bg-purple-900/20 transition-all shadow-md"
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Enhanced Learning Paths */}
        {showSuggestions && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            className="bg-black/20 backdrop-blur-md border-2 border-purple-500/40 rounded-3xl p-10 mb-12 max-w-7xl mx-auto shadow-2xl"
          >
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center flex items-center justify-center gap-4">
              <Star className="w-12 h-12 text-amber-400 animate-spin" />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">Epic Learning Quests</span>
              <Star className="w-12 h-12 text-amber-400 animate-spin animation-delay-2000" />
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedTopics.map((topic, index) => (
                <Link key={index} href="/dashboard">
                  <motion.div 
                    whileHover={{ 
                      scale: 1.05, 
                      y: -5,
                      rotateX: 5,
                      rotateY: 5 
                    }}
                    transition={{ duration: 0.3 }}
                    className="bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 hover:bg-purple-900/20 transition-all cursor-pointer shadow-lg group hover:shadow-2xl hover:shadow-purple-500/25"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Box className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
                      <Play className="w-6 h-6 text-blue-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110" />
                    </div>
                    <p className="text-white font-bold text-xl text-center mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-blue-300 group-hover:bg-clip-text">{topic}</p>
                    <div className="flex justify-center">
                      <div className="w-full h-2 bg-purple-900/30 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: "0%" }}
                          animate={{ width: `${Math.random() * 30 + 20}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-sm" 
                        />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
