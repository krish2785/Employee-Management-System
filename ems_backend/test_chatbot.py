#!/usr/bin/env python3
"""
Test script for EMS Chatbot
This script tests the chatbot functionality without requiring the Gemini API key.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_chatbot_setup():
    """Test chatbot setup and configuration"""
    print("🧪 Testing EMS Chatbot Setup")
    print("=" * 50)
    
    # Check if required packages are installed
    try:
        import google.generativeai as genai
        print("✅ google-generativeai package is installed")
    except ImportError:
        print("❌ google-generativeai package is not installed")
        return False
    
    try:
        from ems_api.chatbot import EMSGeminiChatbot
        print("✅ Chatbot module can be imported")
    except ImportError as e:
        print(f"❌ Chatbot module import failed: {e}")
        return False
    
    # Check environment variables
    api_key = os.getenv('GEMINI_API_KEY')
    if api_key:
        print("✅ GEMINI_API_KEY is configured")
        print(f"   Key: {api_key[:10]}...{api_key[-4:] if len(api_key) > 14 else '***'}")
    else:
        print("⚠️  GEMINI_API_KEY is not configured")
        print("   Please create a .env file with your Gemini API key")
        print("   See GEMINI_SETUP.md for instructions")
    
    # Check Django settings
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
        import django
        django.setup()
        print("✅ Django is properly configured")
    except Exception as e:
        print(f"❌ Django configuration error: {e}")
        return False
    
    # Test chatbot initialization (without API key)
    try:
        if api_key:
            chatbot = EMSGeminiChatbot()
            print("✅ Chatbot initialized successfully")
            
            # Test intent recognition
            intent = chatbot.analyze_query_intent("How do I add a new employee?")
            print(f"✅ Intent recognition working: '{intent}'")
            
            # Test suggested questions
            questions = chatbot.get_suggested_questions()
            print(f"✅ Suggested questions working: {len(questions)} questions available")
            
        else:
            print("⚠️  Skipping chatbot initialization (no API key)")
            
    except Exception as e:
        print(f"❌ Chatbot initialization failed: {e}")
        if "GEMINI_API_KEY" in str(e):
            print("   This is expected without an API key")
        else:
            return False
    
    print("\n🎉 Chatbot setup test completed!")
    return True

def show_next_steps():
    """Show next steps for setting up the chatbot"""
    print("\n📋 Next Steps:")
    print("1. Get your Gemini API key from: https://makersuite.google.com/app/apikey")
    print("2. Create a .env file in the ems_backend directory:")
    print("   GEMINI_API_KEY=your_actual_api_key_here")
    print("3. Restart the Django server")
    print("4. Test the chatbot at: http://localhost:8000/api/chatbot/health/")
    print("5. Use the chatbot in your React app!")

if __name__ == "__main__":
    success = test_chatbot_setup()
    
    if success:
        show_next_steps()
    else:
        print("\n❌ Setup test failed. Please check the errors above.")
        sys.exit(1)
