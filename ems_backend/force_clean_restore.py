import os
import sys
import django
from datetime import date, datetime, timedelta

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from ems_api.models import Employee, AttendanceRecord, LeaveRequest, Task, TaskAttachment, TaskProgressUpdate
from django.db import connection

def parse_date(date_str):
    """Parse date from various formats"""
    if not date_str:
        return date.today()
    
    # Handle DD:MM:YYYY format
    if ':' in date_str:
        try:
            day, month, year = date_str.split(':')
            return date(int(year), int(month), int(day))
        except:
            pass
    
    # Handle YYYY-MM-DD format
    try:
        return datetime.strptime(date_str, '%Y-%m-%d').date()
    except:
        return date.today()

def force_clean_restore():
    """Force clean database and restore 20 employees"""
    
    print("Force cleaning database...")
    
    # Delete all data in correct order
    TaskProgressUpdate.objects.all().delete()
    TaskAttachment.objects.all().delete()
    Task.objects.all().delete()
    LeaveRequest.objects.all().delete()
    AttendanceRecord.objects.all().delete()
    Employee.objects.all().delete()
    
    # Reset auto-increment counters
    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM ems_api_taskprogressupdate")
        cursor.execute("DELETE FROM ems_api_taskattachment")
        cursor.execute("DELETE FROM ems_api_task")
        cursor.execute("DELETE FROM ems_api_leaverequest")
        cursor.execute("DELETE FROM ems_api_attendancerecord")
        cursor.execute("DELETE FROM ems_api_employee")
        cursor.execute("ALTER TABLE ems_api_employee AUTO_INCREMENT = 1")
    
    print("Database completely cleared. Creating 20 employees...")
    
    # First 20 employees from original data
    employees_data = [
        {"employee_id": "EMP001", "name": "Rahul Sharma", "email": "rahul.sharma@company.com", "department": "Engineering", "designation": "Senior Developer", "hire_date": "15:01:2023", "phone": "+91 9876543210", "salary": 75000},
        {"employee_id": "EMP002", "name": "Priya Patel", "email": "priya.patel@company.com", "department": "HR", "designation": "HR Manager", "hire_date": "10:08:2022", "phone": "+91 9876543211", "salary": 65000},
        {"employee_id": "EMP003", "name": "Amit Verma", "email": "amit.verma@company.com", "department": "Marketing", "designation": "Marketing Specialist", "hire_date": "20:03:2023", "phone": "+91 9876543212", "salary": 55000},
        {"employee_id": "EMP004", "name": "Neha Gupta", "email": "neha.gupta@company.com", "department": "Finance", "designation": "Financial Analyst", "hire_date": "05:11:2022", "phone": "+91 9876543213", "salary": 60000},
        {"employee_id": "EMP005", "name": "Ananya Desai", "email": "ananya.desai@company.com", "department": "Marketing", "designation": "Marketing Specialist", "hire_date": "15:09:2023", "phone": "+91 9876500005", "salary": 65000},
        {"employee_id": "EMP006", "name": "Vikram Malhotra", "email": "vikram.malhotra@company.com", "department": "Engineering", "designation": "Software Engineer", "hire_date": "20:10:2023", "phone": "+91 9876500006", "salary": 85000},
        {"employee_id": "EMP007", "name": "Pooja Reddy", "email": "pooja.reddy@company.com", "department": "HR", "designation": "HR Coordinator", "hire_date": "10:11:2023", "phone": "+91 9876500007", "salary": 55000},
        {"employee_id": "EMP008", "name": "Arjun Mehta", "email": "arjun.mehta@company.com", "department": "Sales", "designation": "Sales Representative", "hire_date": "05:12:2023", "phone": "+91 9876500008", "salary": 60000},
        {"employee_id": "EMP009", "name": "Rajesh Kumar", "email": "rajesh.kumar@company.com", "phone": "+91-9876543201", "department": "Engineering", "designation": "Senior Software Engineer", "hire_date": "2023-01-15", "salary": 950000},
        {"employee_id": "EMP010", "name": "Priya Sharma", "email": "priya.sharma@company.com", "phone": "+91-9876543202", "department": "HR", "designation": "HR Manager", "hire_date": "2023-02-20", "salary": 850000},
        {"employee_id": "EMP011", "name": "Amit Patel", "email": "amit.patel@company.com", "phone": "+91-9876543203", "department": "Sales", "designation": "Sales Director", "hire_date": "2023-03-10", "salary": 1200000},
        {"employee_id": "EMP012", "name": "Neha Singh", "email": "neha.singh@company.com", "phone": "+91-9876543204", "department": "Finance", "designation": "Finance Manager", "hire_date": "2023-04-05", "salary": 1100000},
        {"employee_id": "EMP013", "name": "Vikram Singh", "email": "vikram.singh@company.com", "phone": "+91-9876543205", "department": "Marketing", "designation": "Marketing Specialist", "hire_date": "2023-05-15", "salary": 650000},
        {"employee_id": "EMP014", "name": "Anjali Verma", "email": "anjali.verma@company.com", "phone": "+91-9876543206", "department": "Engineering", "designation": "Software Engineer", "hire_date": "2023-06-20", "salary": 850000},
        {"employee_id": "EMP015", "name": "Rahul Malhotra", "email": "rahul.malhotra@company.com", "phone": "+91-9876543207", "department": "HR", "designation": "HR Coordinator", "hire_date": "2023-07-10", "salary": 550000},
        {"employee_id": "EMP016", "name": "Sneha Reddy", "email": "sneha.reddy@company.com", "phone": "+91-9876543208", "department": "Sales", "designation": "Sales Representative", "hire_date": "2023-08-05", "salary": 600000},
        {"employee_id": "EMP017", "name": "Arjun Joshi", "email": "arjun.joshi@company.com", "phone": "+91-9876543209", "department": "Finance", "designation": "Financial Analyst", "hire_date": "2023-09-15", "salary": 700000},
        {"employee_id": "EMP018", "name": "Ishita Joshi", "email": "ishita.joshi@company.com", "phone": "+91-9876543210", "department": "Engineering", "designation": "DevOps Engineer", "hire_date": "2023-10-20", "salary": 900000},
        {"employee_id": "EMP019", "name": "Karan Khanna", "email": "karan.khanna@company.com", "phone": "+91-9876543211", "department": "Marketing", "designation": "Content Creator", "hire_date": "2023-11-10", "salary": 580000},
        {"employee_id": "EMP020", "name": "Divya Nair", "email": "divya.nair@company.com", "phone": "+91-9876543212", "department": "Sales", "designation": "Sales Manager", "hire_date": "2023-12-05", "salary": 750000}
    ]
    
    created_employees = {}
    for emp_data in employees_data:
        try:
            employee = Employee.objects.create(
                employee_id=emp_data['employee_id'],
                name=emp_data['name'],
                email=emp_data['email'],
                department=emp_data['department'],
                designation=emp_data['designation'],
                hire_date=parse_date(emp_data['hire_date']),
                status='Active',
                phone=emp_data['phone'],
                salary=emp_data['salary']
            )
            created_employees[emp_data['employee_id']] = employee
            print(f"Created {emp_data['employee_id']}: {emp_data['name']}")
        except Exception as e:
            print(f"Error creating {emp_data['employee_id']}: {e}")
    
    # Create attendance records for first 8 employees
    print("Creating attendance records...")
    attendance_data = [
        {"employee_id": "EMP001", "date": "2025-08-06", "hours": 8.5, "status": "Present"},
        {"employee_id": "EMP002", "date": "2025-08-06", "hours": 8.5, "status": "Present"},
        {"employee_id": "EMP003", "date": "2025-08-06", "hours": 8.5, "status": "Present"},
        {"employee_id": "EMP004", "date": "2025-08-06", "hours": 8.5, "status": "Present"},
        {"employee_id": "EMP005", "date": "2025-08-06", "hours": 8.5, "status": "Present"},
        {"employee_id": "EMP006", "date": "2025-08-06", "hours": 8.5, "status": "Present"},
        {"employee_id": "EMP007", "date": "2025-08-06", "hours": 8.5, "status": "Present"},
        {"employee_id": "EMP008", "date": "2025-08-06", "hours": 8.5, "status": "Present"}
    ]
    
    for att_data in attendance_data:
        if att_data['employee_id'] in created_employees:
            AttendanceRecord.objects.create(
                employee=created_employees[att_data['employee_id']],
                date=parse_date(att_data['date']),
                status=att_data['status'],
                hours=att_data['hours']
            )
    
    # Create leave requests
    print("Creating leave requests...")
    leave_data = [
        {"employee_id": "EMP001", "leave_type": "Annual Leave", "start_date": "2024-02-01", "end_date": "2024-02-03", "days": 3, "status": "Approved", "reason": "Family vacation"},
        {"employee_id": "EMP003", "leave_type": "Sick Leave", "start_date": "2024-01-20", "end_date": "2024-01-22", "days": 3, "status": "Pending", "reason": "Fever and cold"},
        {"employee_id": "EMP004", "leave_type": "Personal Leave", "start_date": "2024-02-15", "end_date": "2024-02-15", "days": 1, "status": "Approved", "reason": "Personal work"}
    ]
    
    for leave in leave_data:
        if leave['employee_id'] in created_employees:
            LeaveRequest.objects.create(
                employee=created_employees[leave['employee_id']],
                leave_type=leave['leave_type'],
                start_date=parse_date(leave['start_date']),
                end_date=parse_date(leave['end_date']),
                days=leave['days'],
                status=leave['status'],
                reason=leave['reason']
            )
    
    # Create tasks
    print("Creating tasks...")
    if 'EMP001' in created_employees and 'EMP002' in created_employees:
        Task.objects.create(
            title='Prepare Monthly Attendance Report',
            description='Generate and analyze monthly attendance report for all departments',
            assigned_to=created_employees['EMP001'],
            assigned_by=created_employees['EMP002'],
            due_date=date.today() + timedelta(days=15),
            priority='High',
            status='In Progress',
            progress=75,
            department='Engineering',
            estimated_hours=8
        )
        
        Task.objects.create(
            title='Update Employee Handbook',
            description='Review and update the employee handbook with new policies',
            assigned_to=created_employees['EMP002'],
            assigned_by=created_employees['EMP002'],
            due_date=date.today() + timedelta(days=20),
            priority='Medium',
            status='Not Started',
            progress=0,
            department='HR',
            estimated_hours=12
        )
    
    # Create tasks for Rajesh Kumar (EMP009)
    if 'EMP009' in created_employees and 'EMP002' in created_employees:
        Task.objects.create(
            title='Client meeting',
            description='Review financial budgets',
            assigned_to=created_employees['EMP009'],
            assigned_by=created_employees['EMP002'],
            due_date=date.today() + timedelta(days=7),
            priority='Medium',
            status='Not Started',
            progress=0,
            department='Engineering'
        )
        
        Task.objects.create(
            title='Review budget',
            description='Prepare detailed report',
            assigned_to=created_employees['EMP009'],
            assigned_by=created_employees['EMP002'],
            due_date=date.today() + timedelta(days=14),
            priority='Low',
            status='On Hold',
            progress=36,
            department='Engineering'
        )
    
    print("Database restoration completed successfully!")
    print(f"Created {len(created_employees)} employees (EMP001-EMP020)")
    print("Created attendance, leave requests, and tasks")
    print("Rajesh Kumar is now EMP009")

if __name__ == '__main__':
    force_clean_restore()
