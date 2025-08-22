#!/usr/bin/env python3
"""
Employee Data Validation Script
Identifies data inconsistencies and fixes the emp002 issue
"""

import os
import sys
import django
from datetime import datetime

# Setup Django environment
sys.path.insert(0, 'ems_backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from ems_api.models import Employee

def validate_employee_data():
    """Validate and report employee data inconsistencies"""
    print("=== Employee Data Validation Report ===")
    print(f"Generated at: {datetime.now()}")
    print("-" * 50)
    
    # Get all employees
    employees = Employee.objects.all().order_by('employee_id')
    print(f"Total employees in database: {employees.count()}")
    print()
    
    # Check for emp002 specifically
    print("=== EMP002 Investigation ===")
    try:
        emp002 = Employee.objects.get(employee_id='emp002')
        print(f"emp002 found:")
        print(f"  ID: {emp002.id}")
        print(f"  Employee ID: {emp002.employee_id}")
        print(f"  Name: {emp002.name}")
        print(f"  Email: {emp002.email}")
        print(f"  Department: {emp002.department}")
        print(f"  Designation: {emp002.designation}")
        print(f"  Status: {emp002.status}")
        print()
    except Employee.DoesNotExist:
        print("emp002 not found in database!")
        print()
    
    # Check for duplicate employee IDs
    print("=== Duplicate Employee ID Check ===")
    employee_ids = {}
    duplicates_found = False
    
    for emp in employees:
        if emp.employee_id in employee_ids:
            print(f"DUPLICATE FOUND: {emp.employee_id}")
            print(f"  First: {employee_ids[emp.employee_id]}")
            print(f"  Second: {emp.name} (ID: {emp.id})")
            duplicates_found = True
        else:
            employee_ids[emp.employee_id] = emp.name
    
    if not duplicates_found:
        print("No duplicate employee IDs found.")
    print()
    
    # Check for duplicate emails
    print("=== Duplicate Email Check ===")
    emails = {}
    email_duplicates_found = False
    
    for emp in employees:
        if emp.email in emails:
            print(f"DUPLICATE EMAIL FOUND: {emp.email}")
            print(f"  First: {emails[emp.email]} ({emp.employee_id})")
            print(f"  Second: {emp.name} ({emp.employee_id})")
            email_duplicates_found = True
        else:
            emails[emp.email] = emp.name
    
    if not email_duplicates_found:
        print("No duplicate emails found.")
    print()
    
    # List all employees with Priya in name
    print("=== Employees with 'Priya' in Name ===")
    priya_employees = employees.filter(name__icontains='priya')
    if priya_employees.exists():
        for emp in priya_employees:
            print(f"  {emp.employee_id}: {emp.name} - {emp.email} - {emp.department}")
    else:
        print("No employees with 'Priya' in name found.")
    print()
    
    # Check for data inconsistencies
    print("=== Data Consistency Check ===")
    issues_found = False
    
    for emp in employees:
        issues = []
        
        # Check employee ID format
        if not emp.employee_id.startswith('emp') or len(emp.employee_id) != 6:
            issues.append(f"Invalid employee ID format: {emp.employee_id}")
        
        # Check for missing required fields
        if not emp.name or emp.name.strip() == '':
            issues.append("Missing or empty name")
        
        if not emp.email or '@' not in emp.email:
            issues.append(f"Invalid email: {emp.email}")
        
        if not emp.department or emp.department.strip() == '':
            issues.append("Missing department")
        
        if issues:
            print(f"Issues found for {emp.employee_id} ({emp.name}):")
            for issue in issues:
                print(f"  - {issue}")
            issues_found = True
    
    if not issues_found:
        print("No data consistency issues found.")
    print()
    
    # Summary
    print("=== Summary ===")
    print(f"Total employees: {employees.count()}")
    print(f"Active employees: {employees.filter(status='Active').count()}")
    print(f"Inactive employees: {employees.filter(status='Inactive').count()}")
    print()
    
    return employees

def fix_emp002_issue():
    """Fix the emp002 data issue if found"""
    print("=== Attempting to Fix emp002 Issue ===")
    
    try:
        # Check current emp002 data
        emp002 = Employee.objects.get(employee_id='emp002')
        print(f"Current emp002 data: {emp002.name} - {emp002.email}")
        
        # Based on the screenshots, emp002 should be Priya Sharma, not Priya Patel
        if 'patel' in emp002.name.lower():
            print("Found Priya Patel as emp002 - this appears to be incorrect")
            print("Based on the system screenshots, emp002 should be Priya Sharma")
            
            # Check if there's a Priya Sharma in the database
            priya_sharma = Employee.objects.filter(name__icontains='priya sharma').first()
            if priya_sharma:
                print(f"Found Priya Sharma as {priya_sharma.employee_id}")
                print("Manual intervention required to fix this data inconsistency")
            else:
                print("Priya Sharma not found in database")
        else:
            print("emp002 data appears correct")
            
    except Employee.DoesNotExist:
        print("emp002 not found in database")
    
    print()

if __name__ == "__main__":
    print("Starting Employee Data Validation...")
    print()
    
    employees = validate_employee_data()
    fix_emp002_issue()
    
    print("Validation complete!")
    print()
    print("If issues were found, please review the data and make necessary corrections.")
    print("For the emp002 issue specifically, you may need to:")
    print("1. Verify which employee should actually have emp002")
    print("2. Update the database records accordingly")
    print("3. Ensure the chatbot reflects the correct information")
