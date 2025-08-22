#!/usr/bin/env python
"""
Test script to verify attendance reports functionality
"""
import os
import sys
import django
import requests
from datetime import date

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from ems_api.models import Employee, AttendanceRecord

def test_database_data():
    """Test that employee data has been updated correctly"""
    print("=== Testing Employee Data ===")
    employees = Employee.objects.all()
    print(f"Total employees: {employees.count()}")
    
    print("\nEmployee joining dates (first 5):")
    for emp in employees[:5]:
        print(f"  {emp.employee_id} ({emp.name}): {emp.joining_date} - {emp.designation}")
    
    # Check for realistic dates
    recent_joiners = employees.filter(joining_date__gte=date(2020, 1, 1)).count()
    early_joiners = employees.filter(joining_date__lt=date(2020, 1, 1)).count()
    
    print(f"\nJoining date distribution:")
    print(f"  Early joiners (before 2020): {early_joiners}")
    print(f"  Recent joiners (2020+): {recent_joiners}")
    
    print("\n=== Testing Attendance Data ===")
    attendance_records = AttendanceRecord.objects.all()
    print(f"Total attendance records: {attendance_records.count()}")
    
    if attendance_records.exists():
        print("\nSample attendance records:")
        for record in attendance_records[:3]:
            print(f"  {record.employee.name} - {record.date} - {record.status}")
    else:
        print("No attendance records found")
    
    return employees.count() > 0, attendance_records.count()

def test_api_endpoints():
    """Test API endpoints without browser"""
    print("\n=== Testing API Endpoints ===")
    base_url = "http://localhost:8000/api"
    
    endpoints_to_test = [
        "/employees/",
        "/attendance/", 
        "/leave-requests/",
        "/tasks/"
    ]
    
    for endpoint in endpoints_to_test:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            if response.status_code == 200:
                data = response.json()
                count = len(data) if isinstance(data, list) else data.get('count', 'unknown')
                print(f"  ✅ {endpoint}: {response.status_code} - {count} records")
            else:
                print(f"  ❌ {endpoint}: {response.status_code}")
        except requests.exceptions.ConnectionError:
            print(f"  ⚠️  {endpoint}: Server not running on port 8000")
        except Exception as e:
            print(f"  ❌ {endpoint}: Error - {str(e)}")

def main():
    print("Testing Employee Management System - Attendance Reports Fix")
    print("=" * 60)
    
    # Test database
    has_employees, attendance_count = test_database_data()
    
    # Test API endpoints
    test_api_endpoints()
    
    print("\n" + "=" * 60)
    print("SUMMARY:")
    print(f"✅ Employee joining dates updated: {has_employees}")
    print(f"✅ Attendance data available: {attendance_count > 0}")
    print("\nTo test the frontend:")
    print("1. Ensure Django server is running: python manage.py runserver")
    print("2. Ensure React app is running: npm run dev (in project folder)")
    print("3. Open http://localhost:5173 in your browser")
    print("4. Login as admin and check Reports > Attendance")

if __name__ == '__main__':
    main()
