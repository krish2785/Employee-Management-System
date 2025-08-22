from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from datetime import date

def validate_joining_date(value):
    """Validate that joining date is not in the future and not before 2000"""
    if value > date.today():
        raise ValidationError('Joining date cannot be in the future')
    if value < date(2000, 1, 1):
        raise ValidationError('Joining date cannot be before year 2000')

def validate_date_of_birth(value):
    """Validate that date of birth is realistic (at least 18 years old)"""
    today = date.today()
    age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
    if age < 18:
        raise ValidationError('Employee must be at least 18 years old')
    if value < date(1900, 1, 1):
        raise ValidationError('Date of birth is not realistic')


class Employee(models.Model):
    EMPLOYEE_STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
    ]
    
    id = models.AutoField(primary_key=True)
    employee_id = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=50)
    designation = models.CharField(max_length=100)
    joining_date = models.DateField(
        help_text='Date when the employee joined the company'
    )
    status = models.CharField(max_length=10, choices=EMPLOYEE_STATUS_CHOICES, default='Active')
    phone = models.CharField(max_length=15)
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    manager = models.CharField(max_length=100, null=True, blank=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
    date_of_birth = models.DateField(
        null=True, 
        blank=True,
        help_text='Format: YYYY-MM-DD'
    )
    age = models.IntegerField(null=True, blank=True, editable=False)
    
    def save(self, *args, **kwargs):
        # Calculate age from date of birth if provided
        if self.date_of_birth:
            today = date.today()
            self.age = today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        super().save(*args, **kwargs)
        
    def __str__(self):
        return f"{self.employee_id} - {self.name}"
    
    class Meta:
        db_table = 'employees'


class AttendanceRecord(models.Model):
    ATTENDANCE_STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Late', 'Late'),
        ('Half Day', 'Half Day'),
    ]
    
    id = models.AutoField(primary_key=True)
    date = models.DateField()
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_records')
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    hours = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    status = models.CharField(max_length=10, choices=ATTENDANCE_STATUS_CHOICES, default='Present')
    
    def __str__(self):
        return f"{self.employee.name} - {self.date} - {self.status}"
    
    class Meta:
        db_table = 'attendance_records'
        unique_together = ['date', 'employee']


class LeaveRequest(models.Model):
    LEAVE_TYPE_CHOICES = [
        ('Annual Leave', 'Annual Leave'),
        ('Sick Leave', 'Sick Leave'),
        ('Personal Leave', 'Personal Leave'),
        ('Emergency Leave', 'Emergency Leave'),
    ]
    
    LEAVE_STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]
    
    id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    days = models.IntegerField()
    applied_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=LEAVE_STATUS_CHOICES, default='Pending')
    reason = models.TextField(null=True, blank=True)
    approved_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves')
    
    def __str__(self):
        return f"{self.employee.name} - {self.leave_type} - {self.start_date}"
    
    class Meta:
        db_table = 'leave_requests'


class Task(models.Model):
    PRIORITY_CHOICES = [
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low'),
    ]
    
    STATUS_CHOICES = [
        ('Not Started', 'Not Started'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('On Hold', 'On Hold'),
    ]
    
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    assigned_to = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='assigned_tasks')
    assigned_by = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='created_tasks')
    assigned_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='Medium')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Not Started')
    progress = models.IntegerField(default=0)
    department = models.CharField(max_length=50)
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.assigned_to.name}"
    
    class Meta:
        db_table = 'tasks'


class TaskAttachment(models.Model):
    id = models.AutoField(primary_key=True)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='attachments')
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField()
    file_type = models.CharField(max_length=100)
    uploaded_by = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='uploaded_files')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.file_name} - {self.task.title}"
    
    class Meta:
        db_table = 'task_attachments'


class TaskProgressUpdate(models.Model):
    id = models.AutoField(primary_key=True)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='progress_updates')
    updated_by = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='task_updates')
    previous_progress = models.IntegerField()
    new_progress = models.IntegerField()
    previous_status = models.CharField(max_length=15)
    new_status = models.CharField(max_length=15)
    update_notes = models.TextField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.task.title} - {self.previous_progress}% to {self.new_progress}%"
    
    class Meta:
        db_table = 'task_progress_updates'
        ordering = ['-updated_at']
