#!/usr/bin/env python
"""
Check attendance data and create sample records if needed
"""
import os
import sys
import django
from datetime import date, timedelta
import random

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from ems_api.models import Employee, AttendanceRecord

def check_and_create_attendance():
    """Check attendance data and create sample records"""
    print("Checking attendance data...")
    
    employees = Employee.objects.all()
    attendance_count = AttendanceRecord.objects.count()
    
    print(f"Total employees: {employees.count()}")
    print(f"Total attendance records: {attendance_count}")
    
    if attendance_count == 0:
        print("No attendance records found. Creating sample data...")
        
        # Create attendance records for the last 30 days
        for employee in employees[:10]:  # Limit to first 10 employees
            for i in range(30):
                record_date = date.today() - timedelta(days=i)
                
                # Skip weekends
                if record_date.weekday() >= 5:
                    continue
                
                # Random attendance status
                status_choices = ['Present', 'Present', 'Present', 'Late', 'Absent']
                status = random.choice(status_choices)
                
                # Generate realistic check-in/out times
                if status in ['Present', 'Late']:
                    check_in_hour = random.randint(8, 10)
                    check_in_minute = random.randint(0, 59)
                    check_out_hour = random.randint(17, 19)
                    check_out_minute = random.randint(0, 59)
                    
                    check_in = f"{check_in_hour:02d}:{check_in_minute:02d}:00"
                    check_out = f"{check_out_hour:02d}:{check_out_minute:02d}:00"
                    hours = check_out_hour - check_in_hour + (check_out_minute - check_in_minute) / 60
                else:
                    check_in = None
                    check_out = None
                    hours = 0
                
                AttendanceRecord.objects.get_or_create(
                    employee=employee,
                    date=record_date,
                    defaults={
                        'check_in': check_in,
                        'check_out': check_out,
                        'hours': round(hours, 2) if hours else 0,
                        'status': status
                    }
                )
        
        new_count = AttendanceRecord.objects.count()
        print(f"Created {new_count} attendance records")
    
    # Show sample records
    print("\nSample attendance records:")
    for record in AttendanceRecord.objects.all()[:5]:
        print(f"  {record.employee.name} - {record.date} - {record.status} - {record.hours}h")

if __name__ == '__main__':
    check_and_create_attendance()
