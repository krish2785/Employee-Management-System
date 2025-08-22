from rest_framework import serializers
from django.core.exceptions import ValidationError
from .models import Employee, AttendanceRecord, LeaveRequest, Task, TaskAttachment, TaskProgressUpdate
from datetime import datetime


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'
    
    def validate_employee_id(self, value):
        """Validate employee ID format and uniqueness"""
        if not value.startswith('emp') or len(value) != 6:
            raise serializers.ValidationError("Employee ID must be in format 'empXXX' (e.g., emp001)")
        
        # Check for uniqueness (exclude current instance if updating)
        instance = getattr(self, 'instance', None)
        if Employee.objects.filter(employee_id=value).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError("Employee ID already exists. Please use a different ID.")
        
        return value
    
    def validate_email(self, value):
        """Validate email format and uniqueness"""
        if not value or '@' not in value:
            raise serializers.ValidationError("Please provide a valid email address")
        return value
    
    def validate(self, data):
        """Cross-field validation"""
        if 'salary' in data and data['salary'] and data['salary'] < 0:
            raise serializers.ValidationError("Salary cannot be negative")
        
        # Calculate and validate age if DOB provided
        dob = data.get('date_of_birth')
        if dob:
            today = datetime.today().date()
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            if age < 21 or age > 60:
                raise serializers.ValidationError("Employee age must be between 21 and 60 years")
            # Automatically set the calculated age
            data['age'] = age
        
        return data

    def update(self, instance, validated_data):
        # Prevent non-staff users from changing joining_date
        request = self.context.get('request') if hasattr(self, 'context') else None
        if request and not (request.user and (request.user.is_staff or request.user.is_superuser)):
            validated_data.pop('joining_date', None)
        return super().update(instance, validated_data)


class AttendanceRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    department = serializers.CharField(source='employee.department', read_only=True)
    
    class Meta:
        model = AttendanceRecord
        fields = '__all__'
    
    def validate(self, data):
        """Validate attendance record data"""
        if 'check_in' in data and 'check_out' in data:
            if data['check_in'] and data['check_out'] and data['check_in'] >= data['check_out']:
                raise serializers.ValidationError("Check-out time must be after check-in time")
        return data


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    department = serializers.CharField(source='employee.department', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.name', read_only=True)
    
    class Meta:
        model = LeaveRequest
        fields = '__all__'
    
    def validate(self, data):
        """Validate leave request data"""
        if 'start_date' in data and 'end_date' in data:
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError("End date must be after start date")
        if 'days' in data and data['days'] <= 0:
            raise serializers.ValidationError("Number of days must be positive")
        return data


class TaskAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.name', read_only=True)
    
    class Meta:
        model = TaskAttachment
        fields = '__all__'
    
    def validate_file_size(self, value):
        """Validate file size (max 10MB)"""
        max_size = 10 * 1024 * 1024  # 10MB in bytes
        if value > max_size:
            raise serializers.ValidationError("File size cannot exceed 10MB")
        return value


class TaskProgressUpdateSerializer(serializers.ModelSerializer):
    updated_by_name = serializers.CharField(source='updated_by.name', read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)
    
    class Meta:
        model = TaskProgressUpdate
        fields = '__all__'


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.name', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.name', read_only=True)
    attachments = TaskAttachmentSerializer(many=True, read_only=True)
    progress_updates = TaskProgressUpdateSerializer(many=True, read_only=True)
    
    class Meta:
        model = Task
        fields = '__all__'
    
    def validate(self, data):
        """Validate task data"""
        if 'progress' in data and (data['progress'] < 0 or data['progress'] > 100):
            raise serializers.ValidationError("Progress must be between 0 and 100")
        if 'estimated_hours' in data and data['estimated_hours'] and data['estimated_hours'] < 0:
            raise serializers.ValidationError("Estimated hours cannot be negative")
        return data
