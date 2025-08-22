from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from ems_api.models import Employee, AttendanceRecord, LeaveRequest, Task
from datetime import date, time, timedelta
import random


class Command(BaseCommand):
    help = 'Populate database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create superuser if it doesn't exist
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
            self.stdout.write('Created superuser: admin/admin123')
        
        # Create sample employees
        employees_data = [
            {
                'employee_id': 'EMP001',
                'name': 'Rahul Sharma',
                'email': 'rahul.sharma@company.com',
                'department': 'Engineering',
                'designation': 'Senior Developer',
                'hire_date': date(2023, 1, 15),
                'status': 'Active',
                'phone': '+91 9876543210',
                'salary': 75000,
                'manager': 'Tech Lead'
            },
            {
                'employee_id': 'EMP002',
                'name': 'Priya Patel',
                'email': 'priya.patel@company.com',
                'department': 'HR',
                'designation': 'HR Manager',
                'hire_date': date(2022, 8, 10),
                'status': 'Active',
                'phone': '+91 9876543211',
                'salary': 65000
            },
            {
                'employee_id': 'EMP003',
                'name': 'Amit Verma',
                'email': 'amit.verma@company.com',
                'department': 'Marketing',
                'designation': 'Marketing Specialist',
                'hire_date': date(2023, 3, 20),
                'status': 'Active',
                'phone': '+91 9876543212',
                'salary': 55000,
                'manager': 'Marketing Head'
            },
            {
                'employee_id': 'EMP004',
                'name': 'Neha Gupta',
                'email': 'neha.gupta@company.com',
                'department': 'Finance',
                'designation': 'Financial Analyst',
                'hire_date': date(2022, 11, 5),
                'status': 'Active',
                'phone': '+91 9876543213',
                'salary': 60000,
                'manager': 'Finance Manager'
            }
        ]
        
        employees = []
        for emp_data in employees_data:
            employee, created = Employee.objects.get_or_create(
                employee_id=emp_data['employee_id'],
                defaults=emp_data
            )
            if created:
                self.stdout.write(f'Created employee: {employee.name}')
            employees.append(employee)
        
        # Create sample attendance records
        today = date.today()
        for i in range(7):  # Last 7 days
            current_date = today - timedelta(days=i)
            for employee in employees:
                check_in = time(9, 0)  # 9:00 AM
                check_out = time(17, 30)  # 5:30 PM
                hours = 8.5
                status = 'Present'
                
                # Random variations
                if random.random() < 0.1:  # 10% chance of being late
                    check_in = time(9, 30)
                    status = 'Late'
                elif random.random() < 0.05:  # 5% chance of being absent
                    status = 'Absent'
                    check_in = None
                    check_out = None
                    hours = 0
                
                attendance, created = AttendanceRecord.objects.get_or_create(
                    date=current_date,
                    employee=employee,
                    defaults={
                        'check_in': check_in,
                        'check_out': check_out,
                        'hours': hours,
                        'status': status
                    }
                )
                if created:
                    self.stdout.write(f'Created attendance record for {employee.name} on {current_date}')
        
        # Create sample leave requests
        leave_requests_data = [
            {
                'employee': employees[0],  # Rahul Sharma
                'leave_type': 'Annual Leave',
                'start_date': date(2024, 2, 1),
                'end_date': date(2024, 2, 3),
                'days': 3,
                'status': 'Approved',
                'reason': 'Family vacation',
                'approved_by': employees[1]  # Priya Patel (HR)
            },
            {
                'employee': employees[2],  # Amit Verma
                'leave_type': 'Sick Leave',
                'start_date': date(2024, 1, 20),
                'end_date': date(2024, 1, 22),
                'days': 3,
                'status': 'Pending',
                'reason': 'Fever and cold'
            },
            {
                'employee': employees[3],  # Neha Gupta
                'leave_type': 'Personal Leave',
                'start_date': date(2024, 2, 15),
                'end_date': date(2024, 2, 15),
                'days': 1,
                'status': 'Approved',
                'reason': 'Personal work',
                'approved_by': employees[1]  # Priya Patel (HR)
            }
        ]
        
        for leave_data in leave_requests_data:
            leave_request, created = LeaveRequest.objects.get_or_create(
                employee=leave_data['employee'],
                start_date=leave_data['start_date'],
                defaults=leave_data
            )
            if created:
                self.stdout.write(f'Created leave request for {leave_request.employee.name}')
        
        # Create sample tasks
        tasks_data = [
            {
                'title': 'Prepare Monthly Attendance Report',
                'description': 'Generate and analyze monthly attendance report for all departments',
                'assigned_to': employees[0],  # Rahul Sharma
                'assigned_by': employees[1],  # Priya Patel
                'due_date': date(2024, 2, 15),
                'priority': 'High',
                'status': 'In Progress',
                'progress': 75,
                'department': 'Engineering',
                'estimated_hours': 8
            },
            {
                'title': 'Update Employee Handbook',
                'description': 'Review and update the employee handbook with new policies',
                'assigned_to': employees[1],  # Priya Patel
                'assigned_by': employees[1],  # Self-assigned
                'due_date': date(2024, 2, 20),
                'priority': 'Medium',
                'status': 'Not Started',
                'progress': 0,
                'department': 'HR',
                'estimated_hours': 12
            }
        ]
        
        for task_data in tasks_data:
            task, created = Task.objects.get_or_create(
                title=task_data['title'],
                assigned_to=task_data['assigned_to'],
                defaults=task_data
            )
            if created:
                self.stdout.write(f'Created task: {task.title}')
        
        self.stdout.write(self.style.SUCCESS('Successfully populated database with sample data'))
