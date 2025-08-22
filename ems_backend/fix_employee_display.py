import os
import sys
import django
from datetime import date

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from ems_api.models import Employee, AttendanceRecord, LeaveRequest, Task

def fix_employee_display():
    """Fix employee display by ensuring all 20 employees exist"""
    
    print("Current employees in database:")
    current_employees = Employee.objects.all().order_by('employee_id')
    for emp in current_employees:
        print(f"{emp.employee_id}: {emp.name}")
    
    print(f"\nTotal count: {Employee.objects.count()}")
    
    # Check if first 8 employees exist
    missing_employees = []
    for i in range(1, 9):
        emp_id = f"EMP{i:03d}"
        if not Employee.objects.filter(employee_id=emp_id).exists():
            missing_employees.append(emp_id)
    
    if missing_employees:
        print(f"Missing employees: {missing_employees}")
        
        # Add missing first 8 employees
        first_8_employees = [
            {"employee_id": "EMP001", "name": "Rahul Sharma", "email": "rahul.sharma@company.com", "department": "Engineering", "designation": "Senior Developer", "phone": "+91 9876543210", "salary": 75000},
            {"employee_id": "EMP002", "name": "Priya Patel", "email": "priya.patel@company.com", "department": "HR", "designation": "HR Manager", "phone": "+91 9876543211", "salary": 65000},
            {"employee_id": "EMP003", "name": "Amit Verma", "email": "amit.verma@company.com", "department": "Marketing", "designation": "Marketing Specialist", "phone": "+91 9876543212", "salary": 55000},
            {"employee_id": "EMP004", "name": "Neha Gupta", "email": "neha.gupta@company.com", "department": "Finance", "designation": "Financial Analyst", "phone": "+91 9876543213", "salary": 60000},
            {"employee_id": "EMP005", "name": "Ananya Desai", "email": "ananya.desai@company.com", "department": "Marketing", "designation": "Marketing Specialist", "phone": "+91 9876500005", "salary": 65000},
            {"employee_id": "EMP006", "name": "Vikram Malhotra", "email": "vikram.malhotra@company.com", "department": "Engineering", "designation": "Software Engineer", "phone": "+91 9876500006", "salary": 85000},
            {"employee_id": "EMP007", "name": "Pooja Reddy", "email": "pooja.reddy@company.com", "department": "HR", "designation": "HR Coordinator", "phone": "+91 9876500007", "salary": 55000},
            {"employee_id": "EMP008", "name": "Arjun Mehta", "email": "arjun.mehta@company.com", "department": "Sales", "designation": "Sales Representative", "phone": "+91 9876500008", "salary": 60000}
        ]
        
        for emp_data in first_8_employees:
            if emp_data['employee_id'] in missing_employees:
                try:
                    Employee.objects.create(
                        employee_id=emp_data['employee_id'],
                        name=emp_data['name'],
                        email=emp_data['email'],
                        department=emp_data['department'],
                        designation=emp_data['designation'],
                        hire_date=date.today(),
                        status='Active',
                        phone=emp_data['phone'],
                        salary=emp_data['salary']
                    )
                    print(f"Added {emp_data['employee_id']}: {emp_data['name']}")
                except Exception as e:
                    print(f"Error adding {emp_data['employee_id']}: {e}")
    else:
        print("All first 8 employees exist")
    
    print(f"\nFinal employee count: {Employee.objects.count()}")
    print("\nAll employees:")
    for emp in Employee.objects.all().order_by('employee_id'):
        print(f"{emp.employee_id}: {emp.name}")

if __name__ == '__main__':
    fix_employee_display()
