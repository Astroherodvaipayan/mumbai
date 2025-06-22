for adk code check out the @adk branch 

# 🎓 AI Learning Assistant

A powerful voice-enabled AI assistant that helps you learn by analyzing what's on your screen and providing contextual guidance through natural conversation.

## ✨ Features

- 🎤 **Voice Interaction**: Talk naturally with your AI learning assistant
- 👀 **Screen Analysis**: AI can see and understand what you're viewing (including iframes, videos, documents)
- 🗣️ **Natural Speech**: Responses are spoken using high-quality text-to-speech
- 📚 **Educational Focus**: Specialized prompts for learning assistance and step-by-step guidance
- 🌐 **Web Integration**: Seamlessly integrates with your learning platform
- 📝 **Conversation History**: Keep track of your learning conversations
- 🚀 **Real-time Processing**: Fast response times for interactive learning

## 🔧 Technical Stack

- **Speech-to-Text**: Sarvam AI (primary) + Groq Whisper (fallback)
- **Text-to-Speech**: Sarvam AI with natural voice synthesis
- **LLM**: Groq with Llama 4 Scout model for educational responses
- **Screen Capture**: Enhanced screenshot analysis for iframe content
- **Backend**: Flask with CORS support for frontend integration
- **Audio Processing**: PyAudio + WebRTC VAD for voice activity detection

## 🚀 Quick Setup

### 1. Prerequisites

- Python 3.8 or higher
- macOS, Linux, or Windows
- Microphone and speakers/headphones

### 2. System Dependencies

**macOS:**
```bash
brew install portaudio
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install portaudio19-dev python3-pyaudio
```

**Windows:**
No additional system dependencies required.

### 3. Automated Setup

Run the setup script to install everything automatically:

```bash
cd ai-server
python setup.py
```

### 4. Manual Setup

If you prefer manual setup:

```bash
# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
```

### 5. Configure API Keys

Edit the `.env` file with your API keys:

```env
# Get your Groq API key from: https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here

# Get your Sarvam API key from: https://www.sarvam.ai/
SARVAM_API_KEY=your_sarvam_api_key_here
```

## 🎯 Getting Your API Keys

### Groq API Key
1. Visit [Groq Console](https://console.groq.com/keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key to your `.env` file

### Sarvam API Key
1. Visit [Sarvam AI](https://www.sarvam.ai/)
2. Sign up for an account
3. Generate an API key
4. Copy the key to your `.env` file

## 🏃‍♂️ Running the Assistant

### Start the AI Backend

```bash
cd ai-server
python voice.py
```

You should see:
```
🚀 Starting AI Learning Assistant...
🌐 Web server at http://localhost:5000
🎓 AI Learning Assistant is listening...
📱 Web interface available at http://localhost:5000
🔊 Using Sarvam for speech-to-text and text-to-speech conversion.
```

### Start Your Learning Platform

```bash
# In the main project directory
npm run dev
```

Navigate to the practice page at `http://localhost:3000/practice`

## 🎮 How to Use

### 1. Voice Interaction

1. **Open the Practice Page**: Navigate to `/practice` in your learning app
2. **Check Connection**: Ensure the AI Assistant shows "Connected" status
3. **Start Conversation**: Click the microphone button or "Start Conversation"
4. **Ask Questions**: Speak naturally about what you're learning
5. **Listen to Responses**: The AI will respond with spoken explanations

### 2. Example Interactions

**Watching Educational Videos:**
- "What is this video about?"
- "Can you explain this concept in simpler terms?"
- "What should I focus on in this lesson?"

**Taking Notes:**
- "Help me understand this topic"
- "What are the key points I should remember?"
- "Can you quiz me on this material?"

**Working on Code:**
- "What does this code do?"
- "How can I improve this function?"
- "Explain this error message"

### 3. Advanced Features

- **Screen Analysis**: The AI can see your entire screen, including iframe content
- **Context Awareness**: Responses are tailored to what you're currently viewing
- **Learning Mode**: Provides hints rather than direct answers to encourage learning
- **Multi-modal**: Combines visual and audio understanding

## 🛠️ Troubleshooting

### Common Issues

**"Voice backend is not connected"**
- Ensure the Python server is running on port 5000
- Check that your `.env` file has valid API keys
- Restart the voice.py server

**No audio playback**
- Check your browser's audio permissions
- Ensure speakers/headphones are connected
- Try refreshing the page

**PyAudio installation fails**
- macOS: `brew install portaudio`
- Linux: `sudo apt-get install portaudio19-dev`
- Windows: Try `pip install pipwin && pipwin install pyaudio`

**Poor voice recognition**
- Ensure you have a good microphone
- Speak clearly and at normal volume
- Check for background noise

### Debug Mode

To see detailed logs, check the `logs/` directory:
- `input_YYYY-MM-DD.log`: Voice transcriptions
- `output_YYYY-MM-DD.log`: AI responses
- `origin_YYYY-MM-DD.log`: Processing details

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Frontend       │    │  Flask Backend  │    │  AI Services    │
│  (React/Next)   │◄──►│  (voice.py)     │◄──►│  (Groq/Sarvam)  │
│                 │    │                 │    │                 │
│  • Practice UI  │    │  • Voice I/O    │    │  • LLM          │
│  • Audio Player │    │  • Screenshot   │    │  • STT/TTS      │
│  • Conversation │    │  • CORS API     │    │  • Vision       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔒 Privacy & Security

- **Local Processing**: Voice processing happens on your machine
- **Screen Capture**: Screenshots are processed temporarily and not stored
- **API Security**: Your API keys remain in your local environment
- **No Data Storage**: Conversations are kept in memory only

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs in the `logs/` directory
3. Ensure all API keys are correctly configured
4. Try restarting both the frontend and backend

## 🎉 What's Next?

- **Multi-language Support**: Support for multiple languages
- **Custom Voice Models**: Ability to choose different voice personalities
- **Enhanced Screen Analysis**: Better understanding of complex content
- **Learning Analytics**: Track your learning progress over time
- **Collaborative Learning**: Share sessions with other learners

---

Happy Learning! 🚀📚 
