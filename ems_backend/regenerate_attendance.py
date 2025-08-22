#!/usr/bin/env python3
"""
Script to regenerate attendance records from July 1st to August 17th, 2025
"""

import os
import sys
import django
from datetime import datetime, timedelta, date
import random

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from ems_api.models import Employee, AttendanceRecord

def clear_attendance_records():
    """Clear all existing attendance records"""
    print("Clearing existing attendance records...")
    AttendanceRecord.objects.all().delete()
    print("✅ All attendance records cleared")

def create_attendance_records():
    """Create attendance records from July 1 to August 17, 2025"""
    print("Creating attendance records from July 1 to August 17, 2025...")

    start_date = date(2025, 7, 1)
    end_date = date(2025, 8, 17)
    current_date = start_date
    attendance_records = []

    employees = Employee.objects.all()
    print(f"Found {employees.count()} employees")

    while current_date <= end_date:
        if current_date.weekday() < 5:  # Mon-Fri
            for employee in employees:
                if random.random() < 0.95:  # 95% attendance rate
                    check_in_time = datetime.strptime(f"{random.randint(8,10):02d}:{random.randint(0,59):02d}", "%H:%M").time()
                    check_out_time = datetime.strptime(f"{random.randint(17,19):02d}:{random.randint(0,59):02d}", "%H:%M").time()
                    status = "Present"
                    
                    # Calculate hours
                    in_minutes = check_in_time.hour * 60 + check_in_time.minute
                    out_minutes = check_out_time.hour * 60 + check_out_time.minute
                    hours = round((out_minutes - in_minutes) / 60, 2)
                else:
                    check_in_time, check_out_time, status = None, None, "Absent"
                    hours = 0

                record = AttendanceRecord.objects.create(
                    employee=employee,
                    date=current_date,
                    check_in=check_in_time,
                    check_out=check_out_time,
                    hours=hours,
                    status=status
                )
                attendance_records.append(record)
        
        current_date += timedelta(days=1)
        
        # Progress indicator
        if current_date.day == 1:
            print(f"✅ Generated records for {current_date.strftime('%B %Y')}")

    print(f"✅ Created {len(attendance_records)} attendance records")
    return attendance_records

def main():
    """Main function to regenerate attendance data"""
    print("🔄 Starting attendance data regeneration...")
    
    # Clear existing records
    clear_attendance_records()
    
    # Create new records
    attendance_records = create_attendance_records()
    
    print(f"🎉 Successfully regenerated {len(attendance_records)} attendance records")
    print("📅 Date range: July 1, 2025 to August 17, 2025")
    print("👥 Employees covered: All active employees")
    print("📊 Attendance rate: 95% (realistic workplace attendance)")

if __name__ == "__main__":
    main()
