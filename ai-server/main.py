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

# Global variables for web audio playback
latest_audio_path = None
latest_audio_timestamp = 0

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
import threading
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
import time

# Constants for audio capturing
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
CHUNK_DURATION_MS = 30  # milliseconds
CHUNK_SIZE = int(RATE * CHUNK_DURATION_MS / 1000)  # samples per chunk
SILENCE_THRESHOLD = 50  # adjust this threshold according to your environment
TARGET_DURATION_MS = 700  # Form Senetence after this much silence

#webrtc VAD
def is_silence(chunk):
    return not vad.is_speech(chunk, RATE)

# Initialize PyAudio
audio = pyaudio.PyAudio()

# Initialize WebRTC VAD
vad = webrtcvad.Vad()
vad.set_mode(3)  # Aggressive mode for better voice detection

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
        audio = client.text_to_speech.convert(
            target_language_code="en-IN",  
            text=text,
            model="bulbul:v2",
            speaker="anushka"
        )
        
        # Save the audio to a file
        save(audio, "response.wav")
        print(f"Sarvam TTS successful - saved audio of type: {type(audio)}")
        
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
    Threaded playback of Sarvam TTS output
    """
    global latest_audio_path, latest_audio_timestamp
    
    if sarvam_tts(text):
        try:
            # Update the latest audio path and timestamp for web playback
            latest_audio_path = os.path.abspath("response.wav")
            latest_audio_timestamp = time.time()
            
            # Play audio locally if needed
            sound = AudioSegment.from_file("response.wav", format="wav")
            from pydub.playback import play
            play(sound)
            print("Played audio response using Sarvam TTS")
        except Exception as e:
            print(f"Failed to play audio response: {e}")
            origin_logger.error(f"Audio Playback Error: {e}")
    else:
        print("TTS failed; no audio spoken.")
        origin_logger.error("TTS failed; no audio spoken")

#Initialize Groq client
MODEL="meta-llama/llama-4-scout-17b-16e-instruct"  # Using Llama 4 Scout model from Groq
client = Groq(
    api_key=groq_api_key,
)

promptTeach= """You are an educational assistant designed to help students learn by solving questions step-by-step and providing helpful hints. When given a question, break down the solution into clear, manageable steps, but don't give all the steps or the final answer at once. Instead, offer hints to guide the student and encourage them to think critically. Your goal is to facilitate understanding and help the student arrive at the solution themselves.

You are an educational assistant designed to help students learn by solving questions step-by-step and providing helpful hints. When given a question, break down the solution into clear, manageable steps without giving all the steps at once. Additionally, offer hints to guide the student without giving away the entire answer immediately. Your goal is to facilitate understanding and encourage the student to think critically about the problem.

For example:
1. Restate the problem clearly.
2. Break the problem down into smaller parts.
3. Explain the first step in detail and then offer a hint for the next step.
4. Continue this pattern, providing explanations and hints as needed without revealing all steps at once.
5. Summarize the solution and key concepts learned.
6. make the solution concise not more than 10 words

Sample interaction:
- user: Can you help me solve this question? I'm unable to do it.
- system: Sure, I'd be happy to help! We need to find the length of QR in the right triangle PQR where PQ = 12 cm and PR = 13 cm. First, can you identify which side is the hypotenuse?
- user: Yes, PR is the hypotenuse.
- system: Correct! Now, can you write down the Pythagorean theorem formula for this triangle?
- user: PR^2 = PQ^2 + QR^2
- system: Great! Now, substitute the given values into the equation and see what you get for QR.

Remember, your goal is to encourage the student to think through each step, providing guidance and hints as necessary. IMPORTANT make the answer concise not more than 10 words
"""

promptHelp= """You are a helpful assistant. Examine the screenshot provided and focus on what's visible on the user's screen. 
Give concise answers not more than 20 words long. Help the user with their query based on what you can see in the image.
Try to be CONCISE and formal."""

# Start Flask web server for audio playback
if __name__ == "__main__":
    from flask import Flask, send_file, jsonify, render_template
    import threading
    import time
    
    app = Flask(__name__)
    
    @app.route('/')
    def index():
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Voice Assistant</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .container { max-width: 800px; margin: 0 auto; }
                .audio-player { margin: 20px 0; }
                .status { margin-bottom: 20px; }
                button { padding: 10px; background: #4CAF50; color: white; border: none; cursor: pointer; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Voice Assistant Web Interface</h1>
                <div class="status" id="status">Waiting for audio...</div>
                <div class="audio-player">
                    <audio id="audio-player" controls autoplay></audio>
                </div>
                <button onclick="checkForNewAudio()">Check for New Audio</button>
            </div>
            
            <script>
                let lastTimestamp = 0;
                
                // Check for new audio every 1 second
                setInterval(checkForNewAudio, 1000);
                
                function checkForNewAudio() {
                    fetch('/audio-status')
                        .then(response => response.json())
                        .then(data => {
                            if (data.available && data.timestamp > lastTimestamp) {
                                lastTimestamp = data.timestamp;
                                document.getElementById('status').textContent = 'New audio available! Playing...';
                                document.getElementById('audio-player').src = '/get-audio?t=' + new Date().getTime();
                                document.getElementById('audio-player').play().catch(e => console.error('Playback failed:', e));
                            }
                        })
                        .catch(error => {
                            console.error('Error checking audio status:', error);
                        });
                }
                
                // Initial check when page loads
                checkForNewAudio();
            </script>
        </body>
        </html>
        """
    
    @app.route('/get-audio')
    def get_audio():
        try:
            return send_file("response.wav", mimetype='audio/wav')
        except Exception as e:
            return jsonify({"error": str(e)}), 404
    
    @app.route('/audio-status')
    def audio_status():
        global latest_audio_timestamp
        
        return jsonify({
            "timestamp": latest_audio_timestamp,
            "available": os.path.exists("response.wav") and time.time() - latest_audio_timestamp < 30
        })
    
    # Start Flask in a separate thread
    def run_flask():
        app.run(host='0.0.0.0', port=5000, debug=False)
    
    print("Starting web server at http://localhost:5000")
    flask_thread = threading.Thread(target=run_flask, daemon=True)
    flask_thread.start()
    
    # Define the voice assistant function to run in a separate thread
    def run_voice_assistant():
        global latest_audio_timestamp
        
        # Initialize PyAudio
        audio = pyaudio.PyAudio()
        
        # Initialize WebRTC VAD
        vad = webrtcvad.Vad()
        vad.set_mode(3)  # Aggressive mode for better voice detection
        
        # Open audio stream to get audio from microphone
        stream = audio.open(format=FORMAT, channels=CHANNELS, rate=RATE,
                           input=True, frames_per_buffer=CHUNK_SIZE)
        
        print("Listening...")
        print("NOTE: This assistant will process your voice input and screenshots.")
        if sarvam_api_key:
            print("      Using Sarvam for speech-to-text and text-to-speech conversion.")
        print()
        
        try:
            accumulated_data = b""
            accumulated_silence = 0
            while True:
                chunk = stream.read(CHUNK_SIZE, exception_on_overflow=False) #read mic data
                is_silent = is_silence(chunk)
                if is_silent:
                    accumulated_silence += CHUNK_DURATION_MS
                    if accumulated_silence >= TARGET_DURATION_MS: # form Sentence after silence
                        
                        if accumulated_data != b"":
                            t0 = time.time()
                            
                            #audio - convert raw audio to WAV format
                            audio_stream = BytesIO(accumulated_data)
                            # Create AudioSegment from raw PCM data
                            audio_segment = AudioSegment(
                                data=accumulated_data,
                                sample_width=2,  # 16-bit audio
                                frame_rate=16000,
                                channels=1
                            )
                            # Export to WAV format
                            audio_segment.export('output.wav', format='wav')
                            t1 = time.time()
                            
                            # Log audio capture
                            origin_logger.info(f"Audio: Captured {len(accumulated_data)} bytes of audio data")
                            
                            # Transcription - Try Sarvam STT first, fall back to Groq
                            transcription = None
                            if sarvam_api_key:
                                # Use Sarvam's Speech-to-Text API
                                transcription = sarvam_stt('output.wav')
                            
                            # Fall back to Groq if Sarvam failed or is not available
                            if not transcription:
                                audio_file = open("output.wav", "rb")
                                transcription = client.audio.transcriptions.create(
                                    model="whisper-large-v3-turbo", 
                                    file=audio_file, 
                                    response_format="text"
                                )
                                # Log Groq transcription
                                input_logger.info(f"Transcription: {transcription}")
                                origin_logger.info(f"STT: Groq processed audio file output.wav to text")
                            
                            print("Question = ", transcription)
                            t2 = time.time()
                            
                            # Take Screenshots
                            photo = pyautogui.screenshot()
                            output = BytesIO()
                            photo.save(output, format='PNG')
                            im_data = output.getvalue()
                            image_data = base64.b64encode(im_data).decode("utf-8")
                            
                            # Log screenshot capture
                            origin_logger.info(f"Screenshot: Captured screen image for processing")
                            
                            t3= time.time()
                            
                            #answer using Groq
                            QUESTION=transcription
                            
                            # Create messages with text and image
                            messages = [
                                {"role": "system", "content": promptHelp},
                                {"role": "user", "content": [
                                    {"type": "text", "text": QUESTION},
                                    {"type": "image_url", "image_url": {
                                        "url": f"data:image/png;base64,{image_data}"
                                    }}
                                ]}
                            ]
                            
                            try:
                                # Try with image input first
                                chat_completion = client.chat.completions.create(
                                    messages=messages,
                                    model=MODEL,
                                    temperature=0.0,
                                )
                                origin_logger.info(f"LLM: Groq processed text+image query with model {MODEL}")
                            except Exception as e:
                                print(f"Image input not supported, falling back to text-only: {e}")
                                origin_logger.warning(f"LLM Error: Image input failed, falling back to text-only: {e}")
                                # Fall back to text-only if image input fails
                                chat_completion = client.chat.completions.create(
                                    messages=[
                                        {"role": "system", "content": promptHelp},
                                        {"role": "user", "content": QUESTION}
                                    ],
                                    model=MODEL,
                                    temperature=0.0,
                                )
                                origin_logger.info(f"LLM: Groq processed text-only query with model {MODEL}")
                            
                            t4= time.time()
                            
                            answer = chat_completion.choices[0].message.content
                            print("Groq answer= ", answer)
                            
                            # Log the LLM response
                            output_logger.info(f"LLM Response: {answer}")
                            
                            if sarvam_api_key:
                                threading.Thread(target=speak_response, args=(answer,), daemon=True).start()
                            
                            accumulated_data=b""
                        
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
            # Cleanup
            print("Stopping voice assistant...")
            stream.stop_stream()
            stream.close()
            audio.terminate()
    
    # Start the voice assistant in a separate thread
    voice_thread = threading.Thread(target=run_voice_assistant, daemon=True)
    voice_thread.start()
    
    # Keep the main thread running
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Shutting down...")
        logging.info("Application shutdown initiated by user")
