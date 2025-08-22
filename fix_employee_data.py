#!/usr/bin/env python3
"""
Fix Employee Data Inconsistencies
This script fixes the inconsistencies between employee and admin data
"""

import os
import sys
import django

# Setup Django environment - adjust path based on where script is run from
if os.path.exists('ems_backend'):
    sys.path.insert(0, 'ems_backend')
else:
    sys.path.insert(0, '.')
    
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from ems_api.models import Employee

def fix_employee_data():
    """Fix employee data inconsistencies"""
    print("=== Fixing Employee Data Inconsistencies ===")
    print("-" * 50)
    
    # 1. Fix EMP002 - Should be Priya Sharma, not Priya Patel
    try:
        emp002 = Employee.objects.get(employee_id='EMP002')
        if emp002.name == 'Priya Patel':
            print(f"Fixing EMP002: {emp002.name} -> Priya Sharma")
            emp002.name = 'Priya Sharma'
            emp002.email = 'priya.sharma@company.com'
            emp002.save()
            print("✓ EMP002 updated to Priya Sharma")
    except Employee.DoesNotExist:
        print("✗ EMP002 not found")
    
    # 2. Remove duplicate Priya Sharma (EMP010)
    try:
        emp010 = Employee.objects.get(employee_id='EMP010')
        if 'priya' in emp010.name.lower() and 'sharma' in emp010.name.lower():
            print(f"Found duplicate Priya Sharma as EMP010, updating to correct employee")
            # EMP010 should be Ishita Joshi based on the data
            emp010.name = 'Ishita Joshi'
            emp010.email = 'ishita.joshi@company.com'
            emp010.department = 'Engineering'
            emp010.designation = 'DevOps Engineer'
            emp010.save()
            print("✓ EMP010 updated to Ishita Joshi")
    except Employee.DoesNotExist:
        print("✗ EMP010 not found")
    
    # 3. Convert all employee IDs to lowercase format (emp001, emp002, etc.)
    print("\nConverting employee IDs to lowercase format...")
    employees = Employee.objects.all()
    converted_count = 0
    
    for emp in employees:
        if emp.employee_id.startswith('EMP'):
            old_id = emp.employee_id
            new_id = old_id.lower()
            
            # Check if lowercase version already exists
            if not Employee.objects.filter(employee_id=new_id).exists():
                emp.employee_id = new_id
                emp.save()
                print(f"  {old_id} -> {new_id}")
                converted_count += 1
            else:
                print(f"  Warning: {new_id} already exists, skipping {old_id}")
    
    print(f"\n✓ Converted {converted_count} employee IDs to lowercase")
    
    # 4. Fix any remaining data inconsistencies
    print("\nChecking for other inconsistencies...")
    
    # Fix Amit Patel (should be emp003 based on frontend data)
    try:
        amit = Employee.objects.get(name='Amit Patel')
        if amit.employee_id != 'emp003':
            # Update the existing emp003 if it's not Amit Patel
            try:
                emp003 = Employee.objects.get(employee_id='emp003')
                if emp003.name != 'Amit Patel':
                    print(f"Swapping {emp003.name} (emp003) with {amit.name} ({amit.employee_id})")
                    # Swap the employee IDs
                    temp_id = amit.employee_id
                    amit.employee_id = 'emp003'
                    amit.save()
                    emp003.employee_id = temp_id
                    emp003.save()
                    print("✓ Fixed Amit Patel as emp003")
            except Employee.DoesNotExist:
                amit.employee_id = 'emp003'
                amit.save()
                print("✓ Updated Amit Patel to emp003")
    except Employee.DoesNotExist:
        print("Amit Patel not found")
    
    print("\n=== Data Fix Complete ===")
    
    # Display final state
    print("\nFinal Employee List:")
    employees = Employee.objects.all().order_by('employee_id')
    for emp in employees[:10]:  # Show first 10
        print(f"  {emp.employee_id}: {emp.name} - {emp.email}")
    print(f"  ... and {employees.count() - 10} more employees")

if __name__ == "__main__":
    fix_employee_data()
    print("\nEmployee data inconsistencies have been fixed!")
