from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.db import IntegrityError, transaction
from django.core.exceptions import ValidationError
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import uuid
from .models import Employee, AttendanceRecord, LeaveRequest, Task, TaskAttachment, TaskProgressUpdate
from .serializers import (
    EmployeeSerializer, 
    AttendanceRecordSerializer, 
    LeaveRequestSerializer, 
    TaskSerializer,
    TaskAttachmentSerializer,
    TaskProgressUpdateSerializer
)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Username and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        if user is not None:
            # Issue or get token
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'message': 'Login successful',
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            })
        else:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):
    def post(self, request):
        # Expect token in header, delete it to revoke access
        if request.user.is_authenticated:
            try:
                Token.objects.filter(user=request.user).delete()
            except Exception:
                pass
        return Response({'message': 'Logout successful'})


class CurrentUserView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            return Response({
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
            })
        return Response(
            {'error': 'User not authenticated'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        """List employees with optional filtering by employee_id or username"""
        queryset = self.get_queryset()
        employee_id = request.query_params.get('employee_id')
        username = request.query_params.get('username')
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if username:
            queryset = queryset.filter(user__username=username)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """Create a new employee with proper error handling"""
        try:
            with transaction.atomic():
                # Allow optional 'password' and 'date_of_birth' for creating linked auth user
                incoming_data = request.data.copy()
                provided_password = incoming_data.pop('password', None)
                serializer = self.get_serializer(data=incoming_data)
                if serializer.is_valid():
                    employee = serializer.save()
                    # Calculate and save age if DOB provided
                    if employee.date_of_birth:
                        from datetime import date
                        today = date.today()
                        employee.age = today.year - employee.date_of_birth.year - ((today.month, today.day) < (employee.date_of_birth.month, employee.date_of_birth.day))
                        employee.save()
                    # Auto-create linked auth user if not provided
                    if not employee.user:
                        # Derive username from employee_id, set temporary password
                        username = employee.employee_id
                        temp_password = provided_password or employee.employee_id
                        user = User.objects.create_user(
                            username=username,
                            email=employee.email,
                            password=temp_password,
                            first_name=employee.name.split(' ')[0] if employee.name else '',
                            last_name=' '.join(employee.name.split(' ')[1:]) if employee.name and len(employee.name.split(' ')) > 1 else ''
                        )
                        employee.user = user
                        employee.save()
                        # Optionally, include clear guidance for admin to set password via separate flow
                    return Response(self.get_serializer(employee).data, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError as e:
            error_message = str(e)
            if 'employee_id' in error_message:
                return Response(
                    {'error': 'Employee ID already exists. Please use a unique employee ID.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif 'email' in error_message:
                return Response(
                    {'error': 'Email address already exists. Please use a unique email address.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            else:
                return Response(
                    {'error': 'A database constraint was violated. Please check your data.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValidationError as e:
            return Response(
                {'error': f'Validation error: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'An unexpected error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        """Update an employee with proper error handling"""
        try:
            with transaction.atomic():
                partial = kwargs.pop('partial', False)
                instance = self.get_object()
                incoming_data = request.data.copy()
                # Handle optional password update for linked user
                new_password = incoming_data.pop('password', None)
                serializer = self.get_serializer(instance, data=incoming_data, partial=partial)
                if serializer.is_valid():
                    self.perform_update(serializer)
                    # Recalculate age if DOB changed
                    if instance.date_of_birth:
                        from datetime import date
                        today = date.today()
                        instance.age = today.year - instance.date_of_birth.year - ((today.month, today.day) < (instance.date_of_birth.month, instance.date_of_birth.day))
                        instance.save()
                    # Sync user active state on status change
                    if instance.user and 'status' in serializer.validated_data:
                        if serializer.validated_data['status'] == 'Inactive':
                            instance.user.is_active = False
                            instance.user.save()
                            try:
                                Token.objects.filter(user=instance.user).delete()
                            except Exception:
                                pass
                        else:
                            instance.user.is_active = True
                            instance.user.save()
                    # Update password if provided
                    if instance.user and new_password:
                        instance.user.set_password(new_password)
                        instance.user.save()
                    return Response(serializer.data)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError as e:
            error_message = str(e)
            if 'employee_id' in error_message:
                return Response(
                    {'error': 'Employee ID already exists. Please use a unique employee ID.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif 'email' in error_message:
                return Response(
                    {'error': 'Email address already exists. Please use a unique email address.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            else:
                return Response(
                    {'error': 'A database constraint was violated. Please check your data.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValidationError as e:
            return Response(
                {'error': f'Validation error: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'An unexpected error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, *args, **kwargs):
        """Delete an employee with proper error handling for related records"""
        try:
            with transaction.atomic():
                instance = self.get_object()
                
                # Check for related records
                attendance_count = AttendanceRecord.objects.filter(employee=instance).count()
                leave_count = LeaveRequest.objects.filter(employee=instance).count()
                task_count = Task.objects.filter(assigned_to=instance).count()
                created_task_count = Task.objects.filter(assigned_by=instance).count()
                
                if attendance_count > 0 or leave_count > 0 or task_count > 0 or created_task_count > 0:
                    return Response(
                        {
                            'error': 'Cannot delete employee with existing records.',
                            'details': {
                                'attendance_records': attendance_count,
                                'leave_requests': leave_count,
                                'assigned_tasks': task_count,
                                'created_tasks': created_task_count
                            },
                            'suggestion': 'Consider deactivating the employee instead of deleting, or remove all related records first.'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Delete linked auth user and tokens so login is canceled
                linked_user = instance.user
                self.perform_destroy(instance)
                if linked_user:
                    try:
                        Token.objects.filter(user=linked_user).delete()
                    except Exception:
                        pass
                    linked_user.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {'error': f'An error occurred while deleting the employee: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate an employee instead of deleting"""
        try:
            employee = self.get_object()
            employee.status = 'Inactive'
            employee.save()
            serializer = self.get_serializer(employee)
            return Response({
                'message': 'Employee has been deactivated successfully.',
                'employee': serializer.data
            })
        except Exception as e:
            return Response(
                {'error': f'An error occurred while deactivating the employee: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def attendance(self, request, pk=None):
        """Get attendance records for a specific employee"""
        employee = self.get_object()
        attendance_records = AttendanceRecord.objects.filter(employee=employee)
        serializer = AttendanceRecordSerializer(attendance_records, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def leave_requests(self, request, pk=None):
        """Get leave requests for a specific employee"""
        employee = self.get_object()
        leave_requests = LeaveRequest.objects.filter(employee=employee)
        serializer = LeaveRequestSerializer(leave_requests, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def tasks(self, request, pk=None):
        """Get tasks assigned to a specific employee"""
        employee = self.get_object()
        tasks = Task.objects.filter(assigned_to=employee)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_photo(self, request, pk=None):
        """Upload or replace an employee profile photo"""
        employee = self.get_object()
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        file = request.FILES['file']
        # Basic validation: max 5MB
        if file.size > 5 * 1024 * 1024:
            return Response({'error': 'File size cannot exceed 5MB'}, status=status.HTTP_400_BAD_REQUEST)
        employee.profile_photo = file
        employee.save()
        serializer = self.get_serializer(employee)
        return Response(serializer.data)


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    queryset = AttendanceRecord.objects.all().order_by('-date', 'employee__name')
    serializer_class = AttendanceRecordSerializer
    permission_classes = [permissions.AllowAny]  # Allow access for development
    
    def list(self, request, *args, **kwargs):
        """List all attendance records with optional filtering"""
        queryset = self.get_queryset()
        
        # Apply filters if provided
        employee_id = request.query_params.get('employee_id')
        date = request.query_params.get('date')
        department = request.query_params.get('department')
        status = request.query_params.get('status')
        
        if employee_id:
            queryset = queryset.filter(employee__employee_id=employee_id)
        if date:
            queryset = queryset.filter(date=date)
        if department:
            queryset = queryset.filter(employee__department=department)
        if status:
            queryset = queryset.filter(status=status)
            
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_date(self, request):
        """Get attendance records for a specific date"""
        date = request.query_params.get('date')
        if date:
            records = self.queryset.filter(date=date)
            serializer = self.get_serializer(records, many=True)
            return Response(serializer.data)
        return Response({'error': 'Date parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def by_employee(self, request):
        """Get attendance records for a specific employee"""
        employee_id = request.query_params.get('employee_id')
        if employee_id:
            records = self.queryset.filter(employee__employee_id=employee_id)
            serializer = self.get_serializer(records, many=True)
            return Response(serializer.data)
        return Response({'error': 'Employee ID parameter is required'}, status=status.HTTP_400_BAD_REQUEST)


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.AllowAny]  # Allow anonymous access for development
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a leave request"""
        leave_request = self.get_object()
        leave_request.status = 'Approved'
        leave_request.approved_by = request.user.employee if hasattr(request.user, 'employee') else None
        leave_request.save()
        serializer = self.get_serializer(leave_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a leave request"""
        leave_request = self.get_object()
        leave_request.status = 'Rejected'
        leave_request.approved_by = request.user.employee if hasattr(request.user, 'employee') else None
        leave_request.save()
        serializer = self.get_serializer(leave_request)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending leave requests"""
        pending_requests = self.queryset.filter(status='Pending')
        serializer = self.get_serializer(pending_requests, many=True)
        return Response(serializer.data)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.AllowAny]  # Allow anonymous access for development
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    
    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Update task progress with history tracking"""
        task = self.get_object()
        progress = request.data.get('progress')
        update_notes = request.data.get('notes', '')
        
        if progress is not None and 0 <= progress <= 100:
            # Get employee making the update
            employee = None
            if hasattr(request.user, 'employee'):
                employee = request.user.employee
            else:
                # Fallback for development - find employee by user ID or use first employee
                try:
                    employee = Employee.objects.get(user=request.user)
                except Employee.DoesNotExist:
                    employee = Employee.objects.first()
            
            if not employee:
                return Response({'error': 'Employee profile not found'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Store previous values
            previous_progress = task.progress
            previous_status = task.status
            
            # Update task
            task.progress = progress
            if progress == 100:
                task.status = 'Completed'
            elif progress > 0 and task.status == 'Not Started':
                task.status = 'In Progress'
            
            # Create progress update record
            TaskProgressUpdate.objects.create(
                task=task,
                updated_by=employee,
                previous_progress=previous_progress,
                new_progress=progress,
                previous_status=previous_status,
                new_status=task.status,
                update_notes=update_notes
            )
            
            task.save()
            serializer = self.get_serializer(task)
            return Response(serializer.data)
        return Response({'error': 'Progress must be between 0 and 100'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def upload_file(self, request, pk=None):
        """Upload file attachment to task"""
        task = self.get_object()
        
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        description = request.data.get('description', '')
        
        # Get employee making the upload
        employee = None
        if hasattr(request.user, 'employee'):
            employee = request.user.employee
        else:
            try:
                employee = Employee.objects.get(user=request.user)
            except Employee.DoesNotExist:
                employee = Employee.objects.first()
        
        if not employee:
            return Response({'error': 'Employee profile not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file size (10MB max)
        if file.size > 10 * 1024 * 1024:
            return Response({'error': 'File size cannot exceed 10MB'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.name)[1]
        unique_filename = f"task_{task.id}_{uuid.uuid4().hex[:8]}{file_extension}"
        
        # Save file
        file_path = f"task_attachments/{unique_filename}"
        saved_path = default_storage.save(file_path, ContentFile(file.read()))
        
        # Create attachment record
        attachment = TaskAttachment.objects.create(
            task=task,
            file_name=file.name,
            file_path=saved_path,
            file_size=file.size,
            file_type=file.content_type or 'application/octet-stream',
            uploaded_by=employee,
            description=description
        )
        
        serializer = TaskAttachmentSerializer(attachment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def attachments(self, request, pk=None):
        """Get all attachments for a task"""
        task = self.get_object()
        attachments = TaskAttachment.objects.filter(task=task)
        serializer = TaskAttachmentSerializer(attachments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def progress_history(self, request, pk=None):
        """Get progress update history for a task"""
        task = self.get_object()
        updates = TaskProgressUpdate.objects.filter(task=task)
        serializer = TaskProgressUpdateSerializer(updates, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Get tasks by status"""
        status_filter = request.query_params.get('status')
        if status_filter:
            tasks = self.queryset.filter(status=status_filter)
            serializer = self.get_serializer(tasks, many=True)
            return Response(serializer.data)
        return Response({'error': 'Status parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def by_priority(self, request):
        """Get tasks by priority"""
        priority_filter = request.query_params.get('priority')
        if priority_filter:
            tasks = self.queryset.filter(priority=priority_filter)
            serializer = self.get_serializer(tasks, many=True)
            return Response(serializer.data)
        return Response({'error': 'Priority parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def employee_tasks_with_files(self, request):
        """Get all tasks with their attachments for admin view"""
        employee_id = request.query_params.get('employee_id')
        if employee_id:
            tasks = self.queryset.filter(assigned_to__employee_id=employee_id)
        else:
            tasks = self.queryset.all()
        
        # Include attachments and progress updates
        tasks = tasks.prefetch_related('attachments', 'progress_updates')
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)


class TaskAttachmentViewSet(viewsets.ModelViewSet):
    queryset = TaskAttachment.objects.all()
    serializer_class = TaskAttachmentSerializer
    permission_classes = [permissions.AllowAny]
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download attachment file"""
        attachment = self.get_object()
        try:
            if default_storage.exists(attachment.file_path):
                file_url = default_storage.url(attachment.file_path)
                return Response({'download_url': file_url})
            else:
                return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
