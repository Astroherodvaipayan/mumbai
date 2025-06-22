#!/usr/bin/env python3
"""
AI Learning Assistant Setup Script
This script helps set up the voice-enabled AI learning assistant.
"""

import os
import sys
import subprocess
import platform

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version.split()[0]}")
    return True

def check_system_dependencies():
    """Check system-level dependencies"""
    print("\n🔍 Checking system dependencies...")
    
    system = platform.system()
    if system == "Darwin":  # macOS
        print("📱 Detected macOS")
        # Check for portaudio (required for pyaudio)
        try:
            subprocess.run(["brew", "--version"], check=True, capture_output=True)
            print("✅ Homebrew detected")
            
            # Install portaudio if not present
            try:
                subprocess.run(["brew", "install", "portaudio"], check=True, capture_output=True)
                print("✅ PortAudio installed via Homebrew")
            except subprocess.CalledProcessError:
                print("⚠️  PortAudio installation attempted (may already be installed)")
                
        except subprocess.CalledProcessError:
            print("⚠️  Homebrew not found. Please install portaudio manually:")
            print("   brew install portaudio")
            
    elif system == "Linux":
        print("🐧 Detected Linux")
        print("Please ensure you have the following packages installed:")
        print("   sudo apt-get install portaudio19-dev python3-pyaudio")
        print("   or equivalent for your distribution")
        
    elif system == "Windows":
        print("🪟 Detected Windows")
        print("PyAudio should install automatically on Windows")
    
    return True

def install_python_packages():
    """Install required Python packages"""
    print("\n📦 Installing Python packages...")
    
    try:
        # Upgrade pip first
        subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "pip"], check=True)
        print("✅ Pip upgraded")
        
        # Install packages from requirements.txt
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("✅ All Python packages installed successfully")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install packages: {e}")
        print("\nTry installing manually:")
        print("   pip install -r requirements.txt")
        return False

def check_env_file():
    """Check if .env file exists and guide user"""
    print("\n🔐 Checking environment configuration...")
    
    env_file = ".env"
    if os.path.exists(env_file):
        print("✅ Found .env file")
        
        # Check if API keys are set
        with open(env_file, 'r') as f:
            content = f.read()
            
        has_groq = "GROQ_API_KEY" in content
        has_sarvam = "SARVAM_API_KEY" in content
        
        if has_groq and has_sarvam:
            print("✅ API keys appear to be configured")
        else:
            print("⚠️  Some API keys may be missing")
            if not has_groq:
                print("   - Missing GROQ_API_KEY")
            if not has_sarvam:
                print("   - Missing SARVAM_API_KEY")
                
    else:
        print("⚠️  No .env file found")
        print("Creating template .env file...")
        
        template = """# AI Learning Assistant Configuration
# Get your Groq API key from: https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here

# Get your Sarvam API key from: https://www.sarvam.ai/
SARVAM_API_KEY=your_sarvam_api_key_here
"""
        
        with open(env_file, 'w') as f:
            f.write(template)
            
        print(f"📝 Created {env_file} template")
        print("Please edit this file and add your API keys before running the assistant")

def main():
    """Main setup function"""
    print("🎓 AI Learning Assistant Setup")
    print("=" * 40)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Check system dependencies
    if not check_system_dependencies():
        sys.exit(1)
    
    # Install Python packages
    if not install_python_packages():
        sys.exit(1)
    
    # Check environment configuration
    check_env_file()
    
    print("\n🎉 Setup completed!")
    print("\nNext steps:")
    print("1. Edit the .env file with your API keys")
    print("2. Run the assistant: python voice.py")
    print("3. Open your learning app and start practicing!")
    print("\n📚 The AI assistant will help you learn by:")
    print("   - Answering questions about what you're viewing")
    print("   - Providing explanations and hints")
    print("   - Reading your screen content (including iframes)")
    print("   - Speaking responses using natural voice synthesis")

if __name__ == "__main__":
    main() 