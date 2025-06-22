# Initialization pyaudio for microphone and Webrtc vad

# pyaudio audio
import pyaudio
import webrtcvad
import numpy as np
from pydub import AudioSegment
from io import BytesIO

# Image
import base64
import pyautogui

# Environment variables
import os
import sys
from dotenv import load_dotenv

# Logging
import logging
import datetime

# Flask and CORS
from flask import Flask, send_file, jsonify, render_template, request
from flask_cors import CORS
import threading
import time

# Global variables for web audio playback
latest_audio_path = None
latest_audio_timestamp = 0
current_conversation = []
voice_status = {"listening": False, "processing": False, "speaking": False}

# Setup logging
def setup_logging():
    # Create logs directory if it doesn't exist
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    # Get current date for log filename
    current_date = datetime.datetime.now().strftime('%Y-%m-%d')
    
    # Configure input logging
    input_logger = logging.getLogger('input_logger')
    input_logger.setLevel(logging.INFO)
    input_handler = logging.FileHandler(f'logs/input_{current_date}.log')
    input_handler.setFormatter(logging.Formatter('%(asctime)s - %(message)s'))
    input_logger.addHandler(input_handler)
    
    # Configure output logging
    output_logger = logging.getLogger('output_logger')
    output_logger.setLevel(logging.INFO)
    output_handler = logging.FileHandler(f'logs/output_{current_date}.log')
    output_handler.setFormatter(logging.Formatter('%(asctime)s - %(message)s'))
    output_logger.addHandler(output_handler)
    
    # Configure origin logging (which service processed what)
    origin_logger = logging.getLogger('origin_logger')
    origin_logger.setLevel(logging.INFO)
    origin_handler = logging.FileHandler(f'logs/origin_{current_date}.log')
    origin_handler.setFormatter(logging.Formatter('%(asctime)s - %(message)s'))
    origin_logger.addHandler(origin_handler)
    
    return input_logger, output_logger, origin_logger

# Initialize loggers
input_logger, output_logger, origin_logger = setup_logging()

# Load environment variables if .env file exists
try:
    # Use encoding='latin1' to avoid UTF-8 decoding errors
    load_dotenv(encoding='latin1')
except Exception as e:
    print(f"Warning: Could not load .env file: {e}")
    print("Environment variables will need to be set manually.")
    pass

# For direct Sarvam API access
import requests
from sarvamai import SarvamAI
from sarvamai.play import save

# Check if API keys are set
groq_api_key = os.environ.get("GROQ_API_KEY")
if not groq_api_key:
    print("Error: GROQ_API_KEY environment variable is not set.")
    print("Please set it in your environment variables.")
    print("You can get an API key from https://console.groq.com/keys")
    
    # Prompt user for API key
    print("\nWould you like to enter your Groq API key now? (y/n)")
    response = input().strip().lower()
    if response == 'y':
        print("Enter your Groq API key:")
        groq_api_key = input().strip()
        os.environ["GROQ_API_KEY"] = groq_api_key
    else:
        sys.exit(1)

# Check for Sarvam API key
sarvam_api_key = os.environ.get("SARVAM_API_KEY")
if not sarvam_api_key:
    print("Error: SARVAM_API_KEY environment variable is not set.")
    print("Please set it in your environment variables.")
    print("You can get an API key from Sarvam's website.")
    
    # Prompt user for API key
    print("\nWould you like to enter your Sarvam API key now? (y/n)")
    response = input().strip().lower()
    if response == 'y':
        print("Enter your Sarvam API key:")
        sarvam_api_key = input().strip()
        os.environ["SARVAM_API_KEY"] = sarvam_api_key
    else:
        print("Warning: Sarvam STT and TTS will not be available.")

# Groq for LLM and transcription
from groq import Groq

# Constants for audio capturing
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
CHUNK_DURATION_MS = 30  # milliseconds
CHUNK_SIZE = int(RATE * CHUNK_DURATION_MS / 1000)  # samples per chunk
SILENCE_THRESHOLD = 50  # adjust this threshold according to your environment
TARGET_DURATION_MS = 700  # Form Sentence after this much silence

#webrtc VAD
def is_silence(chunk):
    return not vad.is_speech(chunk, RATE)

# Initialize PyAudio
audio = pyaudio.PyAudio()

# Initialize WebRTC VAD
vad = webrtcvad.Vad()
vad.set_mode(3)  # Aggressive mode for better voice detection

# Enhanced screenshot capture that focuses on iframe content
def capture_enhanced_screenshot():
    """
    Enhanced screenshot function that captures better quality images
    and can handle iframe content
    """
    try:
        # Take multiple screenshots to ensure we capture dynamic content
        photo = pyautogui.screenshot()
        
        # Save as higher quality PNG
        output = BytesIO()
        photo.save(output, format='PNG', optimize=False, quality=95)
        im_data = output.getvalue()
        image_data = base64.b64encode(im_data).decode("utf-8")
        
        # Log screenshot capture with enhanced info
        origin_logger.info(f"Enhanced Screenshot: Captured {len(im_data)} bytes of screen data")
        
        return image_data
    except Exception as e:
        origin_logger.error(f"Screenshot Error: {e}")
        return None

# Sarvam API functions
def sarvam_stt(audio_file_path):
    """
    Transcribe audio using Sarvam's Speech-to-Text API via SarvamAI library
    """
    try:
        # Initialize SarvamAI client
        client = SarvamAI(api_subscription_key=sarvam_api_key)
        
        # Transcribe audio using SarvamAI library
        response = client.speech_to_text.translate(
            file=open(audio_file_path, "rb"),
            model="saaras:v2.5",  
        )
        
        print("Sarvam STT successful")
        # Extract text from response
        text_result = ""
        if isinstance(response, dict):
            text_result = response.get("text", "")
        elif hasattr(response, 'text'):
            text_result = response.text
        else:
            text_result = str(response)
            
        # Log the transcription and its origin
        input_logger.info(f"Transcription: {text_result}")
        origin_logger.info(f"STT: Sarvam processed audio file {audio_file_path} to text")
        
        return text_result
    except Exception as e:
        print(f"Sarvam STT error: {e}")
        origin_logger.error(f"STT Error: Sarvam failed to process {audio_file_path}: {e}")
        return None

def sarvam_tts(text):
    """
    Convert text to speech using Sarvam's Text-to-Speech API via SarvamAI library
    """
    global latest_audio_path, latest_audio_timestamp
    
    try:
        text = text.strip()
        if not text or len(text) > 500:  # Limit text length to avoid API errors
            print("Warning: Empty or too long text passed to TTS.")
            if text and len(text) > 500:
                text = text[:500] + "..."  # Truncate text if too long
            else:
                return False
        
        # Initialize SarvamAI client
        client = SarvamAI(api_subscription_key=sarvam_api_key)
        
        # Convert text to speech
        audio_response = client.text_to_speech.convert(
            target_language_code="en-IN",  
            text=text,
            model="bulbul:v2",
            speaker="anushka"
        )
        
        # Save the audio to a file
        output_path = "response.wav"
        save(audio_response, output_path)
        
        # Update global variables for web access
        latest_audio_path = os.path.abspath(output_path)
        latest_audio_timestamp = time.time()
        
        print(f"Sarvam TTS successful - saved audio to {output_path}")
        
        # Log the TTS generation
        output_logger.info(f"TTS Output: '{text}' converted to speech")
        origin_logger.info(f"TTS: Sarvam converted text to speech: '{text}'")
        
        return True
    except Exception as e:
        print(f"Sarvam TTS error: {e}")
        origin_logger.error(f"TTS Error: Sarvam failed to convert text to speech: {e}")
        return False

def speak_response(text):
    """
    Generate speech response using Sarvam TTS
    """
    global voice_status
    
    voice_status["speaking"] = True
    
    if sarvam_tts(text):
        print("TTS generation successful")
        # Audio is saved and will be accessible via web endpoint
    else:
        print("TTS failed; no audio generated.")
        origin_logger.error("TTS failed; no audio generated")
    
    voice_status["speaking"] = False

#Initialize Groq client
MODEL="meta-llama/llama-4-scout-17b-16e-instruct"  # Using Llama 4 Scout model from Groq
client = Groq(
    api_key=groq_api_key,
)

# Enhanced prompts for better educational assistance
promptTeach = """You are an advanced educational AI assistant specialized in helping students learn through interactive voice conversations. You can see what's on the student's screen (including videos, documents, websites, and apps) and provide contextual help.

Key capabilities:
- Analyze visual content (videos, text, diagrams, code, etc.) on the screen
- Provide step-by-step explanations without giving away complete answers
- Ask guiding questions to promote critical thinking
- Adapt explanations to the student's apparent level
- Reference specific elements visible on screen
- Help with homework, coding, math problems, science concepts, etc.

Guidelines:
1. Keep responses concise (20-40 words max for voice)
2. Ask one question at a time to guide learning
3. Reference what you can see on screen when relevant
4. Encourage the student to think through problems
5. Provide hints rather than direct answers initially
6. Be encouraging and supportive

If you see educational content (videos, documents, coding environment, etc.), help the student engage with it more effectively."""

promptHelp = """You are a helpful AI assistant that can see the user's screen and provide contextual assistance. 

Analyze what's visible on the screen and help the user with their query. Focus on:
- What educational content is displayed (videos, documents, apps, websites)
- Any specific questions about what they're viewing
- Technical help with software or tools they're using
- Learning assistance for any academic content visible

Keep responses concise (15-30 words) for voice interaction. Be direct and helpful."""

# Process voice input with enhanced screen analysis
def process_voice_input(audio_file_path):
    """
    Process voice input with enhanced screen analysis for educational content
    """
    global current_conversation, voice_status
    
    voice_status["processing"] = True
    
    try:
        # Transcription - Try Sarvam STT first, fall back to Groq
        transcription = None
        if sarvam_api_key:
            transcription = sarvam_stt(audio_file_path)
        
        # Fall back to Groq if Sarvam failed or is not available
        if not transcription:
            with open(audio_file_path, "rb") as audio_file:
                transcription = client.audio.transcriptions.create(
                    model="whisper-large-v3-turbo", 
                    file=audio_file, 
                    response_format="text"
                )
            # Log Groq transcription
            input_logger.info(f"Transcription: {transcription}")
            origin_logger.info(f"STT: Groq processed audio file {audio_file_path} to text")
        
        if not transcription or transcription.strip() == "":
            return None
            
        print(f"Question: {transcription}")
        
        # Enhanced screenshot capture
        image_data = capture_enhanced_screenshot()
        if not image_data:
            print("Failed to capture screenshot, proceeding with text-only")
        
        # Create messages with text and image
        messages = [
            {"role": "system", "content": promptTeach},
            {"role": "user", "content": [
                {"type": "text", "text": transcription}
            ]}
        ]
        
        # Add image if available
        if image_data:
            messages[1]["content"].append({
                "type": "image_url", 
                "image_url": {
                    "url": f"data:image/png;base64,{image_data}"
                }
            })
        
        try:
            # Try with image input first (if available)
            chat_completion = client.chat.completions.create(
                messages=messages,
                model=MODEL,
                temperature=0.1,
                max_tokens=150,  # Limit for concise responses
            )
            origin_logger.info(f"LLM: Groq processed {'text+image' if image_data else 'text-only'} query with model {MODEL}")
        except Exception as e:
            print(f"Enhanced input failed, falling back to text-only: {e}")
            origin_logger.warning(f"LLM Error: Enhanced input failed, falling back to text-only: {e}")
            # Fall back to text-only if image input fails
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": promptHelp},
                    {"role": "user", "content": transcription}
                ],
                model=MODEL,
                temperature=0.1,
                max_tokens=150,
            )
            origin_logger.info(f"LLM: Groq processed text-only query with model {MODEL}")
        
        answer = chat_completion.choices[0].message.content.strip()
        print(f"AI Response: {answer}")
        
        # Add to conversation history
        current_conversation.append({
            "type": "user",
            "text": transcription,
            "timestamp": time.time()
        })
        current_conversation.append({
            "type": "ai", 
            "text": answer,
            "timestamp": time.time()
        })
        
        # Keep only last 10 exchanges
        if len(current_conversation) > 20:
            current_conversation = current_conversation[-20:]
        
        # Log the LLM response
        output_logger.info(f"LLM Response: {answer}")
        
        # Generate speech response
        if sarvam_api_key:
            threading.Thread(target=speak_response, args=(answer,), daemon=True).start()
        
        voice_status["processing"] = False
        return {
            "transcription": transcription,
            "response": answer,
            "timestamp": time.time()
        }
        
    except Exception as e:
        print(f"Error processing voice input: {e}")
        origin_logger.error(f"Voice Processing Error: {e}")
        voice_status["processing"] = False
        return None

# Start Flask web server for audio playback and API
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/')
def index():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>AI Learning Assistant</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                background: #0A0A0F;
                color: white;
            }
            .container { max-width: 800px; margin: 0 auto; }
            .audio-player { margin: 20px 0; }
            .status { margin-bottom: 20px; padding: 15px; background: #13131f; border-radius: 8px; }
            button { 
                padding: 10px 20px; 
                background: linear-gradient(to right, #4338ca, #5b21b6); 
                color: white; 
                border: none; 
                border-radius: 6px;
                cursor: pointer; 
                margin: 5px;
            }
            button:hover { filter: brightness(1.1); }
            .conversation { 
                max-height: 400px; 
                overflow-y: auto; 
                padding: 10px; 
                background: #1d1d2d; 
                border-radius: 8px; 
                margin: 10px 0;
            }
            .message { margin: 10px 0; padding: 10px; border-radius: 6px; }
            .user { background: #2563eb; }
            .ai { background: #059669; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎓 AI Learning Assistant</h1>
            <div class="status" id="status">Ready to help you learn!</div>
            <div class="audio-player">
                <audio id="audio-player" controls autoplay></audio>
            </div>
            <button onclick="checkForNewAudio()">🔄 Check for New Audio</button>
            <button onclick="toggleListening()">🎤 Start Listening</button>
            
            <h3>Recent Conversation</h3>
            <div class="conversation" id="conversation"></div>
        </div>
        
        <script>
            let lastTimestamp = 0;
            let isListening = false;
            
            // Check for new audio every 1 second
            setInterval(checkForNewAudio, 1000);
            setInterval(updateConversation, 2000);
            
            function checkForNewAudio() {
                fetch('/audio-status')
                    .then(response => response.json())
                    .then(data => {
                        if (data.available && data.timestamp > lastTimestamp) {
                            lastTimestamp = data.timestamp;
                            document.getElementById('status').textContent = 'New audio response available! Playing...';
                            document.getElementById('audio-player').src = '/get-audio?t=' + new Date().getTime();
                            document.getElementById('audio-player').play().catch(e => console.error('Playback failed:', e));
                        }
                    })
                    .catch(error => {
                        console.error('Error checking audio status:', error);
                    });
            }
            
            function updateConversation() {
                fetch('/conversation')
                    .then(response => response.json())
                    .then(data => {
                        const conv = document.getElementById('conversation');
                        conv.innerHTML = '';
                        data.conversation.slice(-6).forEach(msg => {
                            const div = document.createElement('div');
                            div.className = 'message ' + msg.type;
                            div.innerHTML = '<strong>' + (msg.type === 'user' ? 'You' : 'AI') + ':</strong> ' + msg.text;
                            conv.appendChild(div);
                        });
                        conv.scrollTop = conv.scrollHeight;
                    })
                    .catch(error => console.error('Error updating conversation:', error));
            }
            
            function toggleListening() {
                // This would integrate with the voice system
                fetch('/toggle-listening', {method: 'POST'})
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('status').textContent = data.status;
                    });
            }
            
            // Initial load
            checkForNewAudio();
            updateConversation();
        </script>
    </body>
    </html>
    """

@app.route('/get-audio')
def get_audio():
    try:
        if os.path.exists("response.wav"):
            return send_file("response.wav", mimetype='audio/wav')
        else:
            return jsonify({"error": "No audio available"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/audio-status')
def audio_status():
    global latest_audio_timestamp
    
    return jsonify({
        "timestamp": latest_audio_timestamp,
        "available": os.path.exists("response.wav") and time.time() - latest_audio_timestamp < 60,
        "voice_status": voice_status
    })

@app.route('/conversation')
def get_conversation():
    return jsonify({
        "conversation": current_conversation,
        "voice_status": voice_status
    })

@app.route('/toggle-listening', methods=['POST'])
def toggle_listening():
    global voice_status
    
    if voice_status["listening"]:
        voice_status["listening"] = False
        return jsonify({"status": "Stopped listening", "listening": False})
    else:
        voice_status["listening"] = True
        return jsonify({"status": "Started listening", "listening": True})

@app.route('/process-audio', methods=['POST'])
def process_audio_endpoint():
    """
    Endpoint to process uploaded audio files
    """
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({"error": "No audio file selected"}), 400
        
        # Save uploaded audio
        audio_path = "uploaded_audio.wav"
        audio_file.save(audio_path)
        
        # Process the audio
        result = process_voice_input(audio_path)
        
        if result:
            return jsonify({
                "success": True,
                "transcription": result["transcription"],
                "response": result["response"],
                "audio_available": os.path.exists("response.wav")
            })
        else:
            return jsonify({"error": "Failed to process audio"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Define the voice assistant function to run in a separate thread
    def run_voice_assistant():
        global latest_audio_timestamp, voice_status
        
        # Initialize PyAudio
        audio = pyaudio.PyAudio()
        
        # Initialize WebRTC VAD
        vad = webrtcvad.Vad()
        vad.set_mode(3)  # Aggressive mode for better voice detection
        
        # Open audio stream to get audio from microphone
        stream = audio.open(format=FORMAT, channels=CHANNELS, rate=RATE,
                           input=True, frames_per_buffer=CHUNK_SIZE)
        
        print("🎓 AI Learning Assistant is listening...")
        print("📱 Web interface available at http://localhost:5000")
        if sarvam_api_key:
            print("🔊 Using Sarvam for speech-to-text and text-to-speech conversion.")
        print()
        
        try:
            accumulated_data = b""
            accumulated_silence = 0
            while True:
                if not voice_status["listening"]:
                    time.sleep(0.1)
                    continue
                    
                chunk = stream.read(CHUNK_SIZE, exception_on_overflow=False)
                is_silent = is_silence(chunk)
                
                if is_silent:
                    accumulated_silence += CHUNK_DURATION_MS
                    if accumulated_silence >= TARGET_DURATION_MS:
                        if accumulated_data != b"":
                            # Convert raw audio to WAV format
                            audio_segment = AudioSegment(
                                data=accumulated_data,
                                sample_width=2,  # 16-bit audio
                                frame_rate=16000,
                                channels=1
                            )
                            # Export to WAV format
                            audio_segment.export('captured_audio.wav', format='wav')
                            
                            # Process the captured audio
                            result = process_voice_input('captured_audio.wav')
                            
                            accumulated_data = b""
                        accumulated_silence = 0
                else:
                    accumulated_data += chunk
                    accumulated_silence = 0
                    
        except KeyboardInterrupt:
            pass
        except Exception as e:
            print(f"Error in voice assistant: {e}")
            origin_logger.error(f"Voice Assistant Error: {e}")
        finally:
            print("Stopping voice assistant...")
            stream.stop_stream()
            stream.close()
            audio.terminate()
    
    # Start Flask in a separate thread
    def run_flask():
        app.run(host='0.0.0.0', port=5000, debug=False)
    
    print("🚀 Starting AI Learning Assistant...")
    print("🌐 Web server at http://localhost:5000")
    
    flask_thread = threading.Thread(target=run_flask, daemon=True)
    flask_thread.start()
    
    # Start the voice assistant in a separate thread
    voice_thread = threading.Thread(target=run_voice_assistant, daemon=True)
    voice_thread.start()
    
    # Keep the main thread running
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("🛑 Shutting down AI Learning Assistant...")
        logging.info("Application shutdown initiated by user")