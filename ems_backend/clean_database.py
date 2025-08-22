import os
import sys
import django
from datetime import date, timedelta

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from ems_api.models import Employee, AttendanceRecord, LeaveRequest, Task, TaskAttachment, TaskProgressUpdate

def clean_database():
    """Clean database and create only EMP001 to EMP020 employees with proper data"""
    
    # Delete all existing data
    print("Cleaning existing data...")
    TaskProgressUpdate.objects.all().delete()
    TaskAttachment.objects.all().delete()
    Task.objects.all().delete()
    LeaveRequest.objects.all().delete()
    AttendanceRecord.objects.all().delete()
    Employee.objects.all().delete()
    
    print("Creating employees EMP001 to EMP020...")
    
    # Employee data with unique names to avoid chatbot confusion
    employee_data = [
        {'id': 'EMP001', 'name': 'John Smith', 'email': 'john.smith@company.com', 'dept': 'Engineering', 'role': 'Software Developer'},
        {'id': 'EMP002', 'name': 'Sarah Johnson', 'email': 'sarah.johnson@company.com', 'dept': 'HR', 'role': 'HR Manager'},
        {'id': 'EMP003', 'name': 'Michael Brown', 'email': 'michael.brown@company.com', 'dept': 'Finance', 'role': 'Financial Analyst'},
        {'id': 'EMP004', 'name': 'Emily Davis', 'email': 'emily.davis@company.com', 'dept': 'Marketing', 'role': 'Marketing Specialist'},
        {'id': 'EMP005', 'name': 'David Wilson', 'email': 'david.wilson@company.com', 'dept': 'Engineering', 'role': 'Senior Developer'},
        {'id': 'EMP006', 'name': 'Lisa Anderson', 'email': 'lisa.anderson@company.com', 'dept': 'HR', 'role': 'HR Assistant'},
        {'id': 'EMP007', 'name': 'Robert Taylor', 'email': 'robert.taylor@company.com', 'dept': 'Operations', 'role': 'Operations Manager'},
        {'id': 'EMP008', 'name': 'Jennifer Martinez', 'email': 'jennifer.martinez@company.com', 'dept': 'Sales', 'role': 'Sales Representative'},
        {'id': 'EMP009', 'name': 'Christopher Lee', 'email': 'christopher.lee@company.com', 'dept': 'Engineering', 'role': 'DevOps Engineer'},
        {'id': 'EMP010', 'name': 'Amanda White', 'email': 'amanda.white@company.com', 'dept': 'Finance', 'role': 'Accountant'},
        {'id': 'EMP011', 'name': 'James Garcia', 'email': 'james.garcia@company.com', 'dept': 'Marketing', 'role': 'Content Creator'},
        {'id': 'EMP012', 'name': 'Michelle Rodriguez', 'email': 'michelle.rodriguez@company.com', 'dept': 'Operations', 'role': 'Project Coordinator'},
        {'id': 'EMP013', 'name': 'Kevin Thompson', 'email': 'kevin.thompson@company.com', 'dept': 'Engineering', 'role': 'QA Engineer'},
        {'id': 'EMP014', 'name': 'Rachel Clark', 'email': 'rachel.clark@company.com', 'dept': 'Sales', 'role': 'Sales Manager'},
        {'id': 'EMP015', 'name': 'Daniel Lewis', 'email': 'daniel.lewis@company.com', 'dept': 'Finance', 'role': 'Budget Analyst'},
        {'id': 'EMP016', 'name': 'Nicole Walker', 'email': 'nicole.walker@company.com', 'dept': 'HR', 'role': 'Recruiter'},
        {'id': 'EMP017', 'name': 'Matthew Hall', 'email': 'matthew.hall@company.com', 'dept': 'Engineering', 'role': 'Frontend Developer'},
        {'id': 'EMP018', 'name': 'Stephanie Young', 'email': 'stephanie.young@company.com', 'dept': 'Marketing', 'role': 'Digital Marketing Manager'},
        {'id': 'EMP019', 'name': 'Andrew King', 'email': 'andrew.king@company.com', 'dept': 'Operations', 'role': 'Business Analyst'},
        {'id': 'EMP020', 'name': 'Rajesh Kumar', 'email': 'rajesh.kumar@company.com', 'dept': 'Engineering', 'role': 'Backend Developer'},
    ]
    
    employees = []
    for emp_data in employee_data:
        employee = Employee.objects.create(
            employee_id=emp_data['id'],
            name=emp_data['name'],
            email=emp_data['email'],
            department=emp_data['dept'],
            designation=emp_data['role'],
            hire_date=date.today() - timedelta(days=365),
            status='Active',
            phone=f'555-{emp_data["id"][-3:]}0',
            salary=50000 + (int(emp_data['id'][-3:]) * 1000)
        )
        employees.append(employee)
        print(f"Created {emp_data['id']}: {emp_data['name']}")
    
    # Create sample attendance records
    print("Creating attendance records...")
    for employee in employees[:10]:  # First 10 employees
        AttendanceRecord.objects.create(
            employee=employee,
            date=date.today(),
            status='Present',
            hours=8
        )
    
    # Create sample leave requests
    print("Creating leave requests...")
    for employee in employees[:5]:  # First 5 employees
        LeaveRequest.objects.create(
            employee=employee,
            leave_type='Annual Leave',
            start_date=date.today() + timedelta(days=10),
            end_date=date.today() + timedelta(days=12),
            days=2,
            status='Pending',
            reason='Personal work'
        )
    
    # Create sample tasks
    print("Creating tasks...")
    admin_employee = employees[1]  # Sarah Johnson (HR Manager) as admin
    
    # Tasks for Rajesh Kumar (EMP020)
    rajesh = employees[19]  # EMP020 - Rajesh Kumar
    
    Task.objects.create(
        title='Client meeting',
        description='Review financial budgets',
        assigned_to=rajesh,
        assigned_by=admin_employee,
        due_date=date.today() + timedelta(days=7),
        priority='Medium',
        status='Not Started',
        progress=0,
        department='Engineering'
    )
    
    Task.objects.create(
        title='Review budget',
        description='Prepare detailed report',
        assigned_to=rajesh,
        assigned_by=admin_employee,
        due_date=date.today() + timedelta(days=14),
        priority='Low',
        status='On Hold',
        progress=36,
        department='Engineering'
    )
    
    print("Database cleaned and populated successfully!")
    print(f"Created {len(employees)} employees (EMP001 to EMP020)")
    print("Each employee has unique name to avoid chatbot confusion")

if __name__ == '__main__':
    clean_database()
