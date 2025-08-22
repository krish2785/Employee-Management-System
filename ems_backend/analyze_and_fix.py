import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from ems_api.models import Employee
from django.db import transaction

print("=== Employee Data Analysis ===")
print("-" * 50)

# Analyze current state
employees = Employee.objects.all().order_by('employee_id')
print(f"Total employees: {employees.count()}\n")

# Check for duplicate emails
email_map = {}
duplicate_emails = []
for emp in employees:
    if emp.email in email_map:
        duplicate_emails.append((emp.email, email_map[emp.email], emp.employee_id))
    else:
        email_map[emp.email] = emp.employee_id

if duplicate_emails:
    print("Duplicate emails found:")
    for email, id1, id2 in duplicate_emails:
        print(f"  {email}: {id1}, {id2}")
else:
    print("No duplicate emails found")

# Check specific employees
print("\nKey employees to fix:")
for emp_id in ['EMP002', 'EMP010', 'EMP018']:
    try:
        emp = Employee.objects.get(employee_id=emp_id)
        print(f"  {emp_id}: {emp.name} - {emp.email}")
    except Employee.DoesNotExist:
        print(f"  {emp_id}: NOT FOUND")

# Apply fixes
print("\n=== Applying Fixes ===")

with transaction.atomic():
    # 1. Fix EMP002 to be Priya Sharma
    try:
        emp002 = Employee.objects.get(employee_id='EMP002')
        if emp002.name != 'Priya Sharma':
            old_name = emp002.name
            emp002.name = 'Priya Sharma'
            emp002.email = 'priya.sharma@company.com'
            emp002.department = 'HR'
            emp002.designation = 'HR Manager'
            emp002.save()
            print(f"✓ Fixed EMP002: {old_name} -> Priya Sharma")
        else:
            print("✓ EMP002 already correct")
    except Employee.DoesNotExist:
        print("✗ EMP002 not found")
    
    # 2. Handle duplicate Priya at EMP010
    try:
        emp010 = Employee.objects.get(employee_id='EMP010')
        if 'priya' in emp010.name.lower():
            print(f"Removing duplicate Priya at EMP010: {emp010.name}")
            emp010.delete()
            print("✓ Deleted EMP010")
    except Employee.DoesNotExist:
        print("✓ EMP010 already removed")
    
    # 3. Convert all employee IDs to lowercase
    print("\nConverting employee IDs to lowercase:")
    for emp in Employee.objects.all():
        if emp.employee_id.startswith('EMP'):
            old_id = emp.employee_id
            new_id = old_id.lower()
            emp.employee_id = new_id
            emp.save()
            print(f"  {old_id} -> {new_id}")

print("\n=== Final Verification ===")
employees = Employee.objects.all().order_by('employee_id')
print(f"Total employees: {employees.count()}")
print("\nFirst 10 employees:")
for emp in employees[:10]:
    print(f"  {emp.employee_id}: {emp.name}")

# Verify emp002
try:
    emp002 = Employee.objects.get(employee_id='emp002')
    print(f"\n✓ SUCCESS: emp002 is {emp002.name} ({emp002.email})")
except Employee.DoesNotExist:
    print("\n✗ ERROR: emp002 not found after conversion")

print("\n✓ Data fix complete!")
