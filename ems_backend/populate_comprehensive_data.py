#!/usr/bin/env python3
"""
Comprehensive Data Population Script for EMS System
Creates 20 additional employees and populates all modules with realistic Indian data
"""

import os
import sys
import django
from datetime import datetime, timedelta, date
import random

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from ems_api.models import Employee, AttendanceRecord, LeaveRequest, Task
from django.contrib.auth.models import User

def clear_existing_data():
    """Clear all existing data to start fresh"""
    print("Clearing existing data...")
    AttendanceRecord.objects.all().delete()
    LeaveRequest.objects.all().delete()
    Task.objects.all().delete()
    Employee.objects.all().delete()
    print("✅ All existing data cleared")

def create_employees():
    """Create 20 employees with Indian names and phone numbers"""
    print("Creating 20 employees with Indian names...")

    employee_data = [
        {"employee_id": "emp001", "name": "Rajesh Kumar", "email": "rajesh.kumar@company.com", "phone": "+91-9876543201", "department": "Engineering", "designation": "Senior Software Engineer", "hire_date": "2023-01-15", "salary": 950000, "status": "Active"},
        {"employee_id": "emp002", "name": "Priya Sharma", "email": "priya.sharma@company.com", "phone": "+91-9876543202", "department": "HR", "designation": "HR Manager", "hire_date": "2023-02-20", "salary": 850000, "status": "Active"},
        {"employee_id": "emp003", "name": "Amit Patel", "email": "amit.patel@company.com", "phone": "+91-9876543203", "department": "Sales", "designation": "Sales Director", "hire_date": "2023-03-10", "salary": 1200000, "status": "Active"},
        {"employee_id": "emp004", "name": "Neha Gupta", "email": "neha.gupta@company.com", "phone": "+91-9876543204", "department": "Finance", "designation": "Finance Manager", "hire_date": "2023-04-05", "salary": 1100000, "status": "Active"},
        {"employee_id": "emp005", "name": "Vikram Singh", "email": "vikram.singh@company.com", "phone": "+91-9876543205", "department": "Marketing", "designation": "Marketing Specialist", "hire_date": "2023-05-15", "salary": 650000, "status": "Active"},
        {"employee_id": "emp006", "name": "Anjali Verma", "email": "anjali.verma@company.com", "phone": "+91-9876543206", "department": "Engineering", "designation": "Software Engineer", "hire_date": "2023-06-20", "salary": 850000, "status": "Active"},
        {"employee_id": "emp007", "name": "Rahul Malhotra", "email": "rahul.malhotra@company.com", "phone": "+91-9876543207", "department": "HR", "designation": "HR Coordinator", "hire_date": "2023-07-10", "salary": 550000, "status": "Active"},
        {"employee_id": "emp008", "name": "Sneha Reddy", "email": "sneha.reddy@company.com", "phone": "+91-9876543208", "department": "Sales", "designation": "Sales Representative", "hire_date": "2023-08-05", "salary": 600000, "status": "Active"},
        {"employee_id": "emp009", "name": "Arjun Mehta", "email": "arjun.mehta@company.com", "phone": "+91-9876543209", "department": "Finance", "designation": "Financial Analyst", "hire_date": "2023-09-15", "salary": 700000, "status": "Active"},
        {"employee_id": "emp010", "name": "Ishita Joshi", "email": "ishita.joshi@company.com", "phone": "+91-9876543210", "department": "Engineering", "designation": "DevOps Engineer", "hire_date": "2023-10-20", "salary": 900000, "status": "Active"},
        {"employee_id": "emp011", "name": "Karan Khanna", "email": "karan.khanna@company.com", "phone": "+91-9876543211", "department": "Marketing", "designation": "Content Creator", "hire_date": "2023-11-10", "salary": 580000, "status": "Active"},
        {"employee_id": "emp012", "name": "Divya Nair", "email": "divya.nair@company.com", "phone": "+91-9876543212", "department": "Sales", "designation": "Sales Manager", "hire_date": "2023-12-05", "salary": 750000, "status": "Active"},
        {"employee_id": "emp013", "name": "Manish Iyer", "email": "manish.iyer@company.com", "phone": "+91-9876543213", "department": "HR", "designation": "Recruiter", "hire_date": "2024-01-15", "salary": 620000, "status": "Active"},
        {"employee_id": "emp014", "name": "Shreya Banerjee", "email": "shreya.banerjee@company.com", "phone": "+91-9876543214", "department": "Engineering", "designation": "QA Engineer", "hire_date": "2024-02-20", "salary": 780000, "status": "Active"},
        {"employee_id": "emp015", "name": "Aditya Kapoor", "email": "aditya.kapoor@company.com", "phone": "+91-9876543215", "department": "Finance", "designation": "Accountant", "hire_date": "2024-03-10", "salary": 650000, "status": "Active"},
        {"employee_id": "emp016", "name": "Meera Pillai", "email": "meera.pillai@company.com", "phone": "+91-9876543216", "department": "Marketing", "designation": "Digital Marketing Specialist", "hire_date": "2024-04-05", "salary": 680000, "status": "Active"},
        {"employee_id": "emp017", "name": "Siddharth Rao", "email": "siddharth.rao@company.com", "phone": "+91-9876543217", "department": "Engineering", "designation": "Frontend Developer", "hire_date": "2024-05-15", "salary": 820000, "status": "Active"},
        {"employee_id": "emp018", "name": "Pooja Mishra", "email": "pooja.mishra@company.com", "phone": "+91-9876543218", "department": "Sales", "designation": "Business Development", "hire_date": "2024-06-20", "salary": 700000, "status": "Active"},
        {"employee_id": "emp019", "name": "Rohan Desai", "email": "rohan.desai@company.com", "phone": "+91-9876543219", "department": "HR", "designation": "Training Specialist", "hire_date": "2024-07-10", "salary": 600000, "status": "Active"},
        {"employee_id": "emp020", "name": "Ananya Roy", "email": "ananya.roy@company.com", "phone": "+91-9876543220", "department": "Finance", "designation": "Budget Analyst", "hire_date": "2024-08-05", "salary": 720000, "status": "Active"},
    ]

    created_employees = []
    for data in employee_data:
        # Keep hire_date in YYYY-MM-DD format for database storage
        # Frontend will display it in DD:MM:YYYY format
        employee, created = Employee.objects.get_or_create(
            employee_id=data["employee_id"],
            defaults=data
        )
        if created:
            print(f"Created employee: {employee.name}")
            created_employees.append(employee)
        else:
            print(f"Employee already exists: {employee.name}")
            created_employees.append(employee)

    return created_employees

def create_attendance_records(employees):
    """Create attendance records from July 1 to August 17, 2025"""
    print("Creating attendance records...")

    start_date = date(2025, 7, 1)
    end_date = date(2025, 8, 17)
    current_date = start_date
    attendance_records = []

    while current_date <= end_date:
        if current_date.weekday() < 5:  # Mon-Fri
            for employee in employees:
                if random.random() < 0.95:
                    check_in_time = datetime.strptime(f"{random.randint(8,10):02d}:{random.randint(0,59):02d}", "%H:%M").time()
                    check_out_time = datetime.strptime(f"{random.randint(17,19):02d}:{random.randint(0,59):02d}", "%H:%M").time()
                    status = "Present"
                else:
                    check_in_time, check_out_time, status = None, None, "Absent"

                # Keep date in YYYY-MM-DD format for database storage
                # Frontend will display it in DD:MM:YYYY format
                record, created = AttendanceRecord.objects.get_or_create(
                    employee=employee,
                    date=current_date,
                    defaults={
                        'check_in': check_in_time,
                        'check_out': check_out_time,
                        'status': status,
                        'hours': 8.0 if status == "Present" else 0.0
                    }
                )
                if created:
                    attendance_records.append(record)
        current_date += timedelta(days=1)

    print(f"Created {len(attendance_records)} attendance records")
    return attendance_records

def create_leave_requests(employees):
    """Create realistic leave requests"""
    print("Creating leave requests...")
    leave_types = ["Annual Leave", "Sick Leave", "Personal Leave", "Emergency Leave"]
    leave_statuses = ["Pending", "Approved", "Rejected"]
    leave_requests = []

    for employee in employees:
        for _ in range(random.randint(0, 3)):
            start_date = date.today() - timedelta(days=random.randint(30, 180))
            duration = random.randint(1, 5)
            end_date = start_date + timedelta(days=duration - 1)
            applied_date = start_date - timedelta(days=random.randint(1, 7))
            
            # Keep dates in YYYY-MM-DD format for database storage
            # Frontend will display them in DD:MM:YYYY format
            leave_request, created = LeaveRequest.objects.get_or_create(
                employee=employee,
                start_date=start_date,
                end_date=end_date,
                leave_type=random.choice(leave_types),
                defaults={
                    'days': duration,
                    'reason': f"Leave for {duration} day(s)",
                    'status': random.choice(leave_statuses),
                    'applied_date': applied_date
                }
            )
            if created:
                leave_requests.append(leave_request)

    print(f"Created {len(leave_requests)} leave requests")
    return leave_requests

def create_tasks(employees):
    """Create tasks for employees"""
    print("Creating tasks...")
    task_titles = ["Prepare report", "Fix bug", "Conduct training", "Review budget", "Client meeting"]
    task_descriptions = [
        "Prepare detailed report",
        "Resolve critical issue",
        "Conduct session for staff",
        "Review financial budgets",
        "Coordinate with client"
    ]
    priorities = ["Low", "Medium", "High", "Critical"]
    statuses = ["Not Started", "In Progress", "Completed", "On Hold"]
    tasks = []

    for employee in employees:
        for _ in range(random.randint(1, 5)):
            status = random.choice(statuses)
            progress = 0 if status == "Not Started" else (100 if status == "Completed" else random.randint(10, 90))
            created_date = date.today() - timedelta(days=random.randint(1, 60))
            due_date = created_date + timedelta(days=random.randint(7, 30))
            
            # Keep dates in YYYY-MM-DD format for database storage
            # Frontend will display them in DD:MM:YYYY format
            task, created = Task.objects.get_or_create(
                title=random.choice(task_titles),
                assigned_to=employee,
                defaults={
                    'description': random.choice(task_descriptions),
                    'priority': random.choice(priorities),
                    'status': status,
                    'progress': progress,
                    'assigned_by': employee,
                    'assigned_date': created_date,
                    'due_date': due_date,
                    'department': employee.department,
                    'estimated_hours': random.randint(4, 40)
                }
            )
            if created:
                tasks.append(task)

    print(f"Created {len(tasks)} tasks")
    return tasks

def main():
    print("🚀 Starting comprehensive data population...")
    print("=" * 60)
    try:
        # Clear existing data first
        clear_existing_data()
        
        employees = create_employees()
        attendance_records = create_attendance_records(employees)
        leave_requests = create_leave_requests(employees)
        tasks = create_tasks(employees)
        print("=" * 60)
        print("🎉 Comprehensive data population completed successfully!")
        print(f"📊 Summary:")
        print(f"   • Employees: {len(employees)}")
        print(f"   • Attendance Records: {len(attendance_records)}")
        print(f"   • Leave Requests: {len(leave_requests)}")
        print(f"   • Tasks: {len(tasks)}")
        print("\n📝 Note: Dates are stored in YYYY-MM-DD format in database")
        print("   Frontend will display dates in DD:MM:YYYY format")
        print("\n🌐 Visit http://localhost:8000/api/ for API")
        print("   Frontend: http://localhost:5173/")
    except Exception as e:
        print(f"❌ Error during data population: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
