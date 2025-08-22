import os
import sys
import django
from datetime import date, datetime, timedelta
import random

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from ems_api.models import Employee, AttendanceRecord

def generate_attendance_data():
    """Generate 320 mock attendance records for 20 employees from July 1 to August 15, 2025"""
    
    # Clear existing attendance data
    AttendanceRecord.objects.all().delete()
    print("Cleared existing attendance data")
    
    # Get all employees
    employees = list(Employee.objects.all().order_by('employee_id'))
    if len(employees) < 20:
        print(f"Warning: Only {len(employees)} employees found, need 20")
        return
    
    # Date range: July 1, 2025 to August 15, 2025 (46 days)
    start_date = date(2025, 7, 1)
    end_date = date(2025, 8, 15)
    
    # Calculate total days
    total_days = (end_date - start_date).days + 1
    print(f"Generating attendance for {total_days} days ({start_date} to {end_date})")
    
    attendance_statuses = ['Present', 'Absent', 'Late', 'Half Day']
    attendance_weights = [0.85, 0.05, 0.07, 0.03]  # 85% present, 5% absent, 7% late, 3% half day
    
    records_created = 0
    current_date = start_date
    
    while current_date <= end_date:
        # Skip weekends (Saturday=5, Sunday=6)
        if current_date.weekday() < 5:  # Monday=0 to Friday=4
            
            for employee in employees[:20]:  # Only first 20 employees
                # Generate realistic attendance pattern
                status = random.choices(attendance_statuses, weights=attendance_weights)[0]
                
                # Generate hours based on status
                if status == 'Present':
                    hours = random.choice([8.0, 8.5, 9.0])
                elif status == 'Late':
                    hours = random.choice([7.5, 8.0])
                elif status == 'Half Day':
                    hours = 4.0
                else:  # Absent
                    hours = 0.0
                
                # Create attendance record
                AttendanceRecord.objects.create(
                    employee=employee,
                    date=current_date,
                    status=status,
                    hours=hours
                )
                
                records_created += 1
        
        current_date += timedelta(days=1)
    
    print(f"Created {records_created} attendance records")
    print(f"Records per employee: {records_created // 20}")
    
    # Verify data
    print("\nAttendance summary by employee:")
    for employee in employees[:20]:
        count = AttendanceRecord.objects.filter(employee=employee).count()
        present_count = AttendanceRecord.objects.filter(employee=employee, status='Present').count()
        print(f"{employee.employee_id} ({employee.name}): {count} records, {present_count} present")
    
    total_records = AttendanceRecord.objects.count()
    print(f"\nTotal attendance records in database: {total_records}")

if __name__ == '__main__':
    generate_attendance_data()
