#!/bin/bash

# AI Learning Assistant Startup Script
echo "🎓 Starting AI Learning Assistant..."
echo "=================================="

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 0
    else
        return 1
    fi
}

# Function to start backend
start_backend() {
    echo "🚀 Starting AI Backend Server (Port 6000)..."
    cd ai-server
    
    # Check if virtual environment exists
    if [ -d "venv" ]; then
        echo "📦 Activating virtual environment..."
        source venv/bin/activate
    fi
    
    # Install dependencies if needed
    if [ ! -f ".deps_installed" ]; then
        echo "📦 Installing Python dependencies..."
        pip install -r requirements.txt
        touch .deps_installed
    fi
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        echo "⚠️  No .env file found. Creating template..."
        cat > .env << EOF
# AI Learning Assistant Configuration
# Get your Groq API key from: https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here

# Get your Sarvam API key from: https://www.sarvam.ai/
SARVAM_API_KEY=your_sarvam_api_key_here

# Get your Google API key from: https://aistudio.google.com/app/apikey
GOOGLE_API_KEY=your_google_api_key_here
EOF
        echo "📝 Please edit ai-server/.env with your API keys before continuing"
        echo "Press Enter when ready..."
        read
    fi
    
    # Start the backend
    echo "🤖 Starting AI backend..."
    python app.py &
    BACKEND_PID=$!
    cd ..
    
    # Wait a moment for backend to start
    sleep 3
    
    # Check if backend started successfully
    if check_port 6000; then
        echo "✅ AI Backend started successfully on port 6000"
    else
        echo "❌ Failed to start AI Backend"
        exit 1
    fi
}

# Function to start frontend
start_frontend() {
    echo "🌐 Starting Frontend (Port 3000)..."
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing Node.js dependencies..."
        npm install
    fi
    
    # Start the frontend
    echo "🎨 Starting frontend..."
    npm run dev &
    FRONTEND_PID=$!
    
    # Wait a moment for frontend to start
    sleep 5
    
    # Check if frontend started successfully
    if check_port 3000; then
        echo "✅ Frontend started successfully on port 3000"
    else
        echo "❌ Failed to start Frontend"
        exit 1
    fi
}

# Main execution
echo "🔍 Checking prerequisites..."

# Check if Python is available
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Python not found. Please install Python 3.8 or higher"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Start services
start_backend
start_frontend

echo ""
echo "🎉 AI Learning Assistant is now running!"
echo "=================================="
echo "📱 Frontend: http://localhost:3000"
echo "🤖 Backend:  http://localhost:6000"
echo "🎓 Practice: http://localhost:3000/practice"
echo ""
echo "💡 Tips:"
echo "   - Make sure your API keys are configured in ai-server/.env"
echo "   - Allow microphone access when prompted"
echo "   - Click the microphone to start voice conversations"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend stopped"
    fi
    echo "👋 Goodbye!"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait 