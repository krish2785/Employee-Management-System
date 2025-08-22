import os
import sys
import django
from datetime import date, timedelta

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from ems_api.models import Employee, AttendanceRecord, LeaveRequest, Task, TaskAttachment, TaskProgressUpdate

def rollback_database():
    """Rollback to original database state with minimal sample data"""
    
    # Delete all existing data
    print("Rolling back database changes...")
    TaskProgressUpdate.objects.all().delete()
    TaskAttachment.objects.all().delete()
    Task.objects.all().delete()
    LeaveRequest.objects.all().delete()
    AttendanceRecord.objects.all().delete()
    Employee.objects.all().delete()
    
    print("Restoring original sample data...")
    
    # Create minimal original employees (as they were before)
    emp1 = Employee.objects.create(
        employee_id='emp001', 
        name='John Doe', 
        email='john@company.com',
        department='Engineering', 
        designation='Developer', 
        hire_date=date.today(),
        status='Active', 
        phone='1234567890', 
        salary=50000
    )
    
    emp2 = Employee.objects.create(
        employee_id='emp002', 
        name='Jane Smith', 
        email='jane@company.com',
        department='HR', 
        designation='HR Manager', 
        hire_date=date.today(),
        status='Active', 
        phone='1234567891', 
        salary=60000
    )
    
    # Create original attendance
    AttendanceRecord.objects.create(
        employee=emp1, 
        date=date.today(), 
        status='Present', 
        hours=8
    )
    
    # Create original leave request
    LeaveRequest.objects.create(
        employee=emp1, 
        leave_type='Annual Leave', 
        start_date=date.today(), 
        end_date=date.today() + timedelta(days=2),
        days=2, 
        status='Pending', 
        reason='Vacation'
    )
    
    # Create original task
    Task.objects.create(
        title='Sample Task', 
        description='Test task',
        assigned_to=emp1, 
        assigned_by=emp2,
        due_date=date.today() + timedelta(days=7),
        priority='Medium', 
        status='Not Started',
        department='Engineering'
    )
    
    print("Database rollback completed successfully!")
    print("Restored original minimal sample data")

if __name__ == '__main__':
    rollback_database()
