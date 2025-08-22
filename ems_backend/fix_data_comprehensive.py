import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from ems_api.models import Employee

print("=== Comprehensive Employee Data Fix ===")
print("-" * 50)

# First, let's see what we have
print("\nCurrent employees:")
employees = Employee.objects.all().order_by('employee_id')
for emp in employees:
    print(f"  {emp.employee_id}: {emp.name} - {emp.email}")

print(f"\nTotal: {employees.count()} employees")

# Check for duplicate emails
print("\nChecking for duplicate emails...")
emails = {}
for emp in employees:
    if emp.email in emails:
        print(f"  DUPLICATE: {emp.email} used by {emails[emp.email]} and {emp.employee_id}")
    else:
        emails[emp.email] = emp.employee_id

# Fix specific issues
print("\n=== Applying Fixes ===")

# 1. Fix EMP002 - Should be Priya Sharma
try:
    emp002 = Employee.objects.get(employee_id='EMP002')
    if emp002.name != 'Priya Sharma':
        print(f"Fixing EMP002: {emp002.name} -> Priya Sharma")
        emp002.name = 'Priya Sharma'
        emp002.email = 'priya.sharma@company.com'
        emp002.save()
        print("✓ EMP002 updated to Priya Sharma")
except Employee.DoesNotExist:
    print("✗ EMP002 not found")

# 2. Handle EMP010 (duplicate Priya Sharma)
try:
    emp010 = Employee.objects.get(employee_id='EMP010')
    if 'priya' in emp010.name.lower() and 'sharma' in emp010.name.lower():
        print(f"Found duplicate Priya Sharma as EMP010")
        # Delete this duplicate
        emp010.delete()
        print("✓ Deleted duplicate EMP010 (Priya Sharma)")
except Employee.DoesNotExist:
    print("EMP010 not found (already deleted)")

# 3. Handle EMP018 (Ishita Joshi) - check if there's a duplicate
ishita_employees = Employee.objects.filter(name__icontains='ishita')
if ishita_employees.count() > 1:
    print(f"Found {ishita_employees.count()} Ishita entries:")
    for emp in ishita_employees:
        print(f"  {emp.employee_id}: {emp.name} - {emp.email}")
    # Keep only EMP018
    for emp in ishita_employees:
        if emp.employee_id != 'EMP018':
            print(f"  Deleting duplicate: {emp.employee_id}")
            emp.delete()

# 4. Convert employee IDs to lowercase
print("\nConverting employee IDs to lowercase...")
employees = Employee.objects.all()
for emp in employees:
    if emp.employee_id.startswith('EMP'):
        old_id = emp.employee_id
        num = old_id[3:]
        new_id = f"emp{num.lower()}"
        emp.employee_id = new_id
        emp.save()
        print(f"  {old_id} -> {new_id}")

# 5. Final verification
print("\n=== Final State ===")
employees = Employee.objects.all().order_by('employee_id')
print(f"Total employees: {employees.count()}")
print("\nFirst 10 employees:")
for emp in employees[:10]:
    print(f"  {emp.employee_id}: {emp.name} - {emp.email}")

# Check emp002 specifically
try:
    emp002 = Employee.objects.get(employee_id='emp002')
    print(f"\n✓ emp002 is correctly set to: {emp002.name}")
except Employee.DoesNotExist:
    print("\n✗ emp002 not found!")

print("\n✓ Data fix complete!")
