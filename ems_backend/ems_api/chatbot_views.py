from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
import os
from .chatbot import EMSGeminiChatbot

@method_decorator(csrf_exempt, name='dispatch')
class ChatbotView(APIView):
    """
    Chatbot API endpoint for handling user messages
    """
    permission_classes = [AllowAny]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.chatbot = None
        try:
            self.chatbot = EMSGeminiChatbot()
        except ValueError as e:
            # Log the error but don't fail the view
            print(f"Chatbot initialization error: {e}")
    
    def post(self, request):
        """
        Handle chat messages
        """
        try:
            # Check if chatbot is available
            if not self.chatbot:
                return Response({
                    'error': 'Chatbot service is not available. Please check GEMINI_API_KEY configuration.',
                    'response': 'I apologize, but the chatbot service is currently unavailable. Please contact your administrator.',
                    'suggested_questions': [
                        "How do I add a new employee?",
                        "How can I track daily attendance?",
                        "What's the process for approving leave requests?"
                    ]
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
            # Get user message
            data = request.data
            if isinstance(data, str):
                data = json.loads(data)
            
            user_message = data.get('message', '').strip()
            conversation_history = data.get('conversation_history', [])
            
            if not user_message:
                return Response({
                    'error': 'Message is required',
                    'response': 'Please provide a message to chat with me.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get chatbot response
            response_data = self.chatbot.chat(user_message, conversation_history)
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except json.JSONDecodeError:
            return Response({
                'error': 'Invalid JSON data',
                'response': 'Please send valid JSON data.'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': 'Internal server error',
                'response': f'I apologize, but I encountered an error: {str(e)}. Please try again later.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request):
        """
        Get chatbot information and suggested questions
        """
        try:
            if not self.chatbot:
                return Response({
                    'error': 'Chatbot service is not available',
                    'suggested_questions': [
                        "How do I add a new employee?",
                        "How can I track daily attendance?",
                        "What's the process for approving leave requests?"
                    ]
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
            return Response({
                'message': 'EMS Chatbot is ready to help!',
                'suggested_questions': self.chatbot.get_suggested_questions(),
                'available_features': [
                    'Employee Management',
                    'Attendance Tracking', 
                    'Leave Management',
                    'Task Management',
                    'Reports & Analytics'
                ]
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Internal server error',
                'message': 'Unable to get chatbot information.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class ChatbotHealthView(APIView):
    """
    Health check endpoint for chatbot service
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """
        Check chatbot service health
        """
        try:
            # Check if Gemini API key is configured
            api_key = os.getenv('GEMINI_API_KEY')
            
            if not api_key:
                return Response({
                    'status': 'unhealthy',
                    'message': 'GEMINI_API_KEY not configured',
                    'details': 'Please set the GEMINI_API_KEY environment variable'
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
            # Try to initialize chatbot
            try:
                chatbot = EMSGeminiChatbot()
                return Response({
                    'status': 'healthy',
                    'message': 'Chatbot service is operational',
                    'service': 'EMS Gemini Chatbot',
                    'model': 'gemini-1.5-flash'
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    'status': 'unhealthy',
                    'message': 'Chatbot initialization failed',
                    'details': str(e)
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
                
        except Exception as e:
            return Response({
                'status': 'error',
                'message': 'Health check failed',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
