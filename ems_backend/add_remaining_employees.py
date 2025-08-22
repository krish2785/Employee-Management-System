import os
import sys
import django
from datetime import date

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from ems_api.models import Employee

def add_remaining_employees():
    """Add the remaining 12 employees to make it 20 total"""
    
    current_count = Employee.objects.count()
    print(f"Current employees: {current_count}")
    
    # Add remaining employees (EMP009-EMP020)
    remaining_employees = [
        {"employee_id": "EMP009", "name": "Rajesh Kumar", "email": "rajesh.kumar@company.com", "department": "Engineering", "designation": "Senior Software Engineer", "phone": "+91-9876543201", "salary": 950000},
        {"employee_id": "EMP010", "name": "Priya Sharma", "email": "priya.sharma@company.com", "department": "HR", "designation": "HR Manager", "phone": "+91-9876543202", "salary": 850000},
        {"employee_id": "EMP011", "name": "Amit Patel", "email": "amit.patel@company.com", "department": "Sales", "designation": "Sales Director", "phone": "+91-9876543203", "salary": 1200000},
        {"employee_id": "EMP012", "name": "Neha Singh", "email": "neha.singh@company.com", "department": "Finance", "designation": "Finance Manager", "phone": "+91-9876543204", "salary": 1100000},
        {"employee_id": "EMP013", "name": "Vikram Singh", "email": "vikram.singh@company.com", "department": "Marketing", "designation": "Marketing Specialist", "phone": "+91-9876543205", "salary": 650000},
        {"employee_id": "EMP014", "name": "Anjali Verma", "email": "anjali.verma@company.com", "department": "Engineering", "designation": "Software Engineer", "phone": "+91-9876543206", "salary": 850000},
        {"employee_id": "EMP015", "name": "Rahul Malhotra", "email": "rahul.malhotra@company.com", "department": "HR", "designation": "HR Coordinator", "phone": "+91-9876543207", "salary": 550000},
        {"employee_id": "EMP016", "name": "Sneha Reddy", "email": "sneha.reddy@company.com", "department": "Sales", "designation": "Sales Representative", "phone": "+91-9876543208", "salary": 600000},
        {"employee_id": "EMP017", "name": "Arjun Joshi", "email": "arjun.joshi@company.com", "department": "Finance", "designation": "Financial Analyst", "phone": "+91-9876543209", "salary": 700000},
        {"employee_id": "EMP018", "name": "Ishita Joshi", "email": "ishita.joshi@company.com", "department": "Engineering", "designation": "DevOps Engineer", "phone": "+91-9876543210", "salary": 900000},
        {"employee_id": "EMP019", "name": "Karan Khanna", "email": "karan.khanna@company.com", "department": "Marketing", "designation": "Content Creator", "phone": "+91-9876543211", "salary": 580000},
        {"employee_id": "EMP020", "name": "Divya Nair", "email": "divya.nair@company.com", "department": "Sales", "designation": "Sales Manager", "phone": "+91-9876543212", "salary": 750000}
    ]
    
    for emp_data in remaining_employees:
        try:
            # Check if employee already exists
            if not Employee.objects.filter(employee_id=emp_data['employee_id']).exists():
                employee = Employee.objects.create(
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
            else:
                print(f"Skipped {emp_data['employee_id']}: already exists")
        except Exception as e:
            print(f"Error adding {emp_data['employee_id']}: {e}")
    
    final_count = Employee.objects.count()
    print(f"Final employee count: {final_count}")

if __name__ == '__main__':
    add_remaining_employees()
