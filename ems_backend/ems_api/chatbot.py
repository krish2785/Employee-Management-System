import google.generativeai as genai
import os
import datetime
from typing import Dict, List, Any
from django.conf import settings
import json
from .chatbot_tools import ChatbotTools

class EMSGeminiChatbot:
    """
    Gemini-powered chatbot for Employee Management System
    """
    
    def __init__(self):
        # Initialize Gemini API
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Load live data from the latest training file
        self.live_data = self.load_live_data()
        
        # System prompt for EMS context
        self.system_prompt = """
        You are an AI assistant for an Employee Management System (EMS). 
        You help users with queries about employees, attendance, leave management, and tasks.
        
        IMPORTANT: Always verify employee data accuracy. When providing employee information:
        1. Double-check employee ID matches the correct employee name
        2. Ensure data consistency across all fields
        3. If there's any data inconsistency, flag it immediately
        
        You have access to the following database tools:
        - Employee data: get_all_employees, get_employee_by_id, get_employees_by_department, search_employees
        - Attendance data: get_attendance_records, get_attendance_summary
        - Leave data: get_leave_requests, get_leave_summary
        - Task data: get_tasks, get_task_summary
        - Summary data: get_department_summary
        
        You also have access to live database data that includes:
        - Current employee information with joining dates, DOB, and age
        - Real-time attendance records
        - Live leave request data
        - Current task assignments and progress
        
        Use these tools and live data to provide accurate, real-time information from the database.
        Be helpful, professional, and provide specific data when available.
        If you don't have specific data, provide general guidance about EMS processes.
        
        When asked about specific employees (like emp002), always fetch the exact data from the database
        and verify the employee ID corresponds to the correct person.
        
        Note: This is a fresh chat session. Previous conversation history has been cleared.
        """
    
    def generate_response(self, user_message: str, context: Dict[str, Any] = None) -> str:
        """
        Generate a response using Gemini AI
        """
        try:
            # Build the full prompt with context
            full_prompt = self.system_prompt + "\n\n"
            
            # Add live data context
            if self.live_data:
                full_prompt += f"Live Database Data: {json.dumps(self.live_data, indent=2)}\n\n"
            
            if context:
                full_prompt += f"Context: {json.dumps(context, indent=2)}\n\n"
            
            full_prompt += f"User: {user_message}\n\nAssistant:"
            
            # Generate response
            response = self.model.generate_content(full_prompt)
            return response.text.strip()
            
        except Exception as e:
            return f"I apologize, but I encountered an error: {str(e)}. Please try again later."
    
    def get_ems_context(self, query_type: str = None) -> Dict[str, Any]:
        """
        Get relevant EMS context based on query type
        """
        context = {
            "system_info": "Employee Management System with modules for employees, attendance, leave, and tasks",
            "available_features": [
                "Employee Management - Add, edit, view, delete employees",
                "Attendance Tracking - Daily check-in/check-out records",
                "Leave Management - Request, approve, reject leave applications",
                "Task Management - Assign, track, and monitor task progress",
                "Reports - Generate insights and analytics"
            ]
        }
        
        if query_type:
            context["query_type"] = query_type
            
        return context
    
    def get_database_data(self, intent: str, user_message: str) -> Dict[str, Any]:
        """
        Get relevant database data based on user intent and message
        """
        try:
            data = {}
            message_lower = user_message.lower()
            
            # Employee queries
            if intent == 'employee_management':
                # Check for specific employee ID patterns (emp001, emp002, etc.)
                import re
                emp_id_pattern = r'emp\d{3}'
                emp_ids = re.findall(emp_id_pattern, message_lower)
                
                if emp_ids:
                    # Get specific employee by ID
                    for emp_id in emp_ids:
                        employee_data = ChatbotTools.get_employee_by_id(emp_id)
                        if 'error' not in employee_data:
                            data[f'employee_{emp_id}'] = employee_data
                        else:
                            data[f'employee_{emp_id}_error'] = employee_data
                elif 'all' in message_lower or 'list' in message_lower:
                    data['employees'] = ChatbotTools.get_all_employees()
                elif 'department' in message_lower:
                    # Extract department name from message
                    departments = ['engineering', 'hr', 'sales', 'finance', 'marketing']
                    for dept in departments:
                        if dept in message_lower:
                            data['employees_by_department'] = ChatbotTools.get_employees_by_department(dept)
                            break
                elif 'search' in message_lower or 'find' in message_lower:
                    # Extract search term - improved search logic
                    words = message_lower.split()
                    search_terms = []
                    skip_words = ['search', 'find', 'for', 'employee', 'with', 'name', 'show', 'me', 'get', 'details', 'about']
                    
                    for word in words:
                        if word not in skip_words and len(word) > 2:
                            search_terms.append(word)
                    
                    if search_terms:
                        for term in search_terms:
                            search_results = ChatbotTools.search_employees(term)
                            if search_results and 'error' not in search_results[0]:
                                data['search_results'] = search_results
                                break
            
            # Attendance queries
            elif intent == 'attendance':
                if 'summary' in message_lower or 'statistics' in message_lower:
                    data['attendance_summary'] = ChatbotTools.get_attendance_summary()
                elif 'records' in message_lower or 'history' in message_lower:
                    data['attendance_records'] = ChatbotTools.get_attendance_records()
                elif 'department' in message_lower:
                    departments = ['engineering', 'hr', 'sales', 'finance', 'marketing']
                    for dept in departments:
                        if dept in message_lower:
                            data['attendance_summary'] = ChatbotTools.get_attendance_summary(department=dept)
                            break
            
            # Leave queries
            elif intent == 'leave_management':
                if 'summary' in message_lower or 'statistics' in message_lower:
                    data['leave_summary'] = ChatbotTools.get_leave_summary()
                elif 'requests' in message_lower or 'pending' in message_lower:
                    data['leave_requests'] = ChatbotTools.get_leave_requests()
                elif 'department' in message_lower:
                    departments = ['engineering', 'hr', 'sales', 'finance', 'marketing']
                    for dept in departments:
                        if dept in message_lower:
                            data['leave_summary'] = ChatbotTools.get_leave_summary(department=dept)
                            break
            
            # Task queries
            elif intent == 'task_management':
                if 'summary' in message_lower or 'statistics' in message_lower:
                    data['task_summary'] = ChatbotTools.get_task_summary()
                elif 'tasks' in message_lower or 'assignments' in message_lower:
                    data['tasks'] = ChatbotTools.get_tasks()
                elif 'department' in message_lower:
                    departments = ['engineering', 'hr', 'sales', 'finance', 'marketing']
                    for dept in departments:
                        if dept in message_lower:
                            data['task_summary'] = ChatbotTools.get_task_summary(department=dept)
                            break
            
            # Report queries
            elif intent == 'reports':
                data['department_summary'] = ChatbotTools.get_department_summary()
            
            return data
            
        except Exception as e:
            return {'error': f'Failed to fetch database data: {str(e)}'}
    
    def analyze_query_intent(self, message: str) -> str:
        """
        Analyze user message to determine intent
        """
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['employee', 'staff', 'worker', 'hire', 'fire']):
            return 'employee_management'
        elif any(word in message_lower for word in ['attendance', 'check-in', 'check-out', 'present', 'absent']):
            return 'attendance'
        elif any(word in message_lower for word in ['leave', 'vacation', 'sick', 'holiday', 'approve']):
            return 'leave_management'
        elif any(word in message_lower for word in ['task', 'project', 'assignment', 'progress']):
            return 'task_management'
        elif any(word in message_lower for word in ['report', 'analytics', 'statistics', 'dashboard']):
            return 'reports'
        else:
            return 'general'
    
    def get_suggested_questions(self) -> List[str]:
        """
        Get suggested questions for users
        """
        return [
            "How do I add a new employee?",
            "How can I track daily attendance?",
            "What's the process for approving leave requests?",
            "How do I assign tasks to employees?",
            "Can you show me attendance reports?",
            "What are the different leave types available?",
            "How do I update employee information?",
            "Can you help me with task progress tracking?"
        ]
    
    def chat(self, user_message: str, conversation_history: List[Dict] = None) -> Dict[str, Any]:
        """
        Main chat method that handles user messages
        """
        # Analyze intent
        intent = self.analyze_query_intent(user_message)
        
        # Get relevant context
        context = self.get_ems_context(intent)
        
        # Get database data based on intent
        database_data = self.get_database_data(intent, user_message)
        if database_data:
            context["database_data"] = database_data
        
        # Add conversation history if available
        if conversation_history:
            context["conversation_history"] = conversation_history[-5:]  # Last 5 messages
        
        # Generate response
        response = self.generate_response(user_message, context)
        
        # Prepare response data
        response_data = {
            "response": response,
            "intent": intent,
            "suggested_questions": self.get_suggested_questions(),
            "timestamp": str(datetime.datetime.now()),
            "context": context,
            "database_data": database_data
        }
        
        return response_data
    
    def load_live_data(self) -> Dict[str, Any]:
        """
        Load the latest live data from the training file
        """
        try:
            # Try to load the new live data file first
            live_data_path = os.path.join(settings.BASE_DIR, 'ems_backend', 'chatbot_live_data.json')
            if os.path.exists(live_data_path):
                with open(live_data_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            
            # Fallback to the original training data
            training_data_path = os.path.join(settings.BASE_DIR, 'ems_backend', 'chatbot_complete_training_data.json')
            if os.path.exists(training_data_path):
                with open(training_data_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            
            return {}
        except Exception as e:
            print(f"Error loading live data: {e}")
            return {}
