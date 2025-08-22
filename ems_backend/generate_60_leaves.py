import os
import sys
import django
from datetime import date, datetime, timedelta
import random

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from ems_api.models import Employee, LeaveRequest

def generate_60_leaves():
    """Generate 60 leave requests for all 20 employees"""
    
    # Clear existing leave data
    LeaveRequest.objects.all().delete()
    print("Cleared existing leave data")
    
    # Get all employees
    employees = list(Employee.objects.all().order_by('employee_id'))
    if len(employees) < 20:
        print(f"Warning: Only {len(employees)} employees found, need 20")
        return
    
    # Leave types and their weights
    leave_types = ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Emergency Leave', 'Casual Leave']
    leave_weights = [0.4, 0.3, 0.15, 0.1, 0.05]
    
    # Leave statuses and their weights
    leave_statuses = ['Approved', 'Pending', 'Rejected']
    status_weights = [0.7, 0.2, 0.1]
    
    # Reasons for different leave types
    reasons = {
        'Annual Leave': ['Family vacation', 'Personal trip', 'Wedding ceremony', 'Festival celebration', 'Rest and relaxation'],
        'Sick Leave': ['Fever and cold', 'Medical checkup', 'Surgery recovery', 'Flu symptoms', 'Doctor appointment'],
        'Personal Leave': ['Personal work', 'Family function', 'House shifting', 'Legal matters', 'Personal emergency'],
        'Emergency Leave': ['Family emergency', 'Medical emergency', 'Urgent personal matter', 'Death in family'],
        'Casual Leave': ['Mental health day', 'Personal appointment', 'Short break', 'Family time']
    }
    
    records_created = 0
    
    # Generate 60 leave requests
    for i in range(60):
        # Select random employee
        employee = random.choice(employees[:20])
        
        # Select leave type and status
        leave_type = random.choices(leave_types, weights=leave_weights)[0]
        status = random.choices(leave_statuses, weights=status_weights)[0]
        
        # Generate random dates (past 4 months to future 2 months)
        base_date = date.today()
        start_offset = random.randint(-120, 60)  # -4 months to +2 months
        start_date = base_date + timedelta(days=start_offset)
        
        # Generate leave duration (1-7 days, weighted towards shorter leaves)
        duration_options = [1, 2, 3, 4, 5, 7]
        duration_weights = [0.35, 0.25, 0.2, 0.1, 0.07, 0.03]
        days = random.choices(duration_options, weights=duration_weights)[0]
        
        end_date = start_date + timedelta(days=days-1)
        
        # Applied date (usually before start date)
        applied_offset = random.randint(1, 21)  # 1-21 days before start
        applied_date = start_date - timedelta(days=applied_offset)
        
        # Select reason
        reason = random.choice(reasons[leave_type])
        
        try:
            # Create leave request
            LeaveRequest.objects.create(
                employee=employee,
                leave_type=leave_type,
                start_date=start_date,
                end_date=end_date,
                days=days,
                status=status,
                reason=reason,
                applied_date=applied_date
            )
            
            records_created += 1
            print(f"Created leave {i+1}: {employee.employee_id} - {leave_type} ({days} days) - {status}")
            
        except Exception as e:
            print(f"Error creating leave request {i+1}: {e}")
    
    print(f"\nCreated {records_created} leave requests")
    
    # Summary by employee
    print("\nLeave summary by employee:")
    for employee in employees[:20]:
        count = LeaveRequest.objects.filter(employee=employee).count()
        if count > 0:
            approved = LeaveRequest.objects.filter(employee=employee, status='Approved').count()
            pending = LeaveRequest.objects.filter(employee=employee, status='Pending').count()
            print(f"{employee.employee_id} ({employee.name}): {count} requests ({approved} approved, {pending} pending)")
    
    # Summary by type
    print("\nLeave summary by type:")
    for leave_type in leave_types:
        count = LeaveRequest.objects.filter(leave_type=leave_type).count()
        print(f"{leave_type}: {count} requests")
    
    # Summary by status
    print("\nLeave summary by status:")
    for status in leave_statuses:
        count = LeaveRequest.objects.filter(status=status).count()
        print(f"{status}: {count} requests")
    
    total_records = LeaveRequest.objects.count()
    print(f"\nTotal leave requests in database: {total_records}")

if __name__ == '__main__':
    generate_60_leaves()
