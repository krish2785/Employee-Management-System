import os
import sys
import django
from datetime import date, timedelta

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from ems_api.models import Employee, AttendanceRecord, LeaveRequest, Task

# Create sample data
def create_data():
    # Create employees
    emp1 = Employee.objects.create(
        employee_id='emp001', name='John Doe', email='john@company.com',
        department='Engineering', designation='Developer', hire_date=date.today(),
        status='Active', phone='1234567890', salary=50000
    )
    
    emp2 = Employee.objects.create(
        employee_id='emp002', name='Jane Smith', email='jane@company.com',
        department='HR', designation='HR Manager', hire_date=date.today(),
        status='Active', phone='1234567891', salary=60000
    )
    
    # Create attendance
    AttendanceRecord.objects.create(
        employee=emp1, date=date.today(), status='Present', hours=8
    )
    
    # Create leave request
    LeaveRequest.objects.create(
        employee=emp1, leave_type='Annual Leave', 
        start_date=date.today(), end_date=date.today() + timedelta(days=2),
        days=2, status='Pending', reason='Vacation'
    )
    
    # Create task
    Task.objects.create(
        title='Sample Task', description='Test task',
        assigned_to=emp1, assigned_by=emp2,
        due_date=date.today() + timedelta(days=7),
        priority='Medium', status='Not Started',
        department='Engineering'
    )
    
    print("Sample data created successfully!")

if __name__ == '__main__':
    create_data()
