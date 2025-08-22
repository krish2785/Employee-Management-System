import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from ems_api.models import Employee

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
    else:
        print(f"EMP002 is already {emp002.name}")
except Employee.DoesNotExist:
    print("✗ EMP002 not found")

# 2. Fix duplicate Priya Sharma (EMP010) 
try:
    emp010 = Employee.objects.get(employee_id='EMP010')
    if 'priya' in emp010.name.lower() and 'sharma' in emp010.name.lower():
        print(f"Found duplicate Priya Sharma as EMP010")
        # Check if ishita.joshi@company.com already exists
        existing_ishita = Employee.objects.filter(email='ishita.joshi@company.com').exclude(employee_id='EMP010').first()
        if existing_ishita:
            print(f"  Email ishita.joshi@company.com already used by {existing_ishita.employee_id}")
            # Delete the duplicate EMP010 entry
            emp010.delete()
            print("✓ Deleted duplicate EMP010 (Priya Sharma)")
        else:
            # EMP010 should be Ishita Joshi based on the data
            emp010.name = 'Ishita Joshi'
            emp010.email = 'ishita.joshi@company.com'
            emp010.department = 'Engineering'
            emp010.designation = 'DevOps Engineer'
            emp010.save()
            print("✓ EMP010 updated to Ishita Joshi")
    else:
        print(f"EMP010 is {emp010.name}")
except Employee.DoesNotExist:
    print("✗ EMP010 not found")

# 3. Convert all employee IDs to lowercase format
print("\nConverting employee IDs to lowercase format...")
employees = Employee.objects.all()
converted_count = 0

for emp in employees:
    if emp.employee_id.startswith('EMP'):
        old_id = emp.employee_id
        # Convert to lowercase with proper padding
        num = old_id[3:]  # Get the number part
        new_id = f"emp{num.lower()}"
        
        # Check if lowercase version already exists
        existing = Employee.objects.filter(employee_id=new_id).exclude(id=emp.id).first()
        if not existing:
            emp.employee_id = new_id
            emp.save()
            print(f"  {old_id} -> {new_id}")
            converted_count += 1
        else:
            print(f"  Warning: {new_id} already exists, skipping {old_id}")

print(f"\n✓ Converted {converted_count} employee IDs to lowercase")

# 4. Ensure emp002 is Priya Sharma (after conversion)
try:
    emp002 = Employee.objects.get(employee_id='emp002')
    if emp002.name != 'Priya Sharma':
        print(f"\nFixing emp002: {emp002.name} -> Priya Sharma")
        emp002.name = 'Priya Sharma'
        emp002.email = 'priya.sharma@company.com'
        emp002.department = 'HR'
        emp002.designation = 'HR Manager'
        emp002.save()
        print("✓ emp002 is now Priya Sharma")
except Employee.DoesNotExist:
    print("\n✗ emp002 not found after conversion")

print("\n=== Data Fix Complete ===")

# Display final state
print("\nFinal Employee List (first 10):")
employees = Employee.objects.all().order_by('employee_id')
for emp in employees[:10]:
    print(f"  {emp.employee_id}: {emp.name} - {emp.email}")
print(f"  ... and {employees.count() - 10} more employees")

print("\n✓ Employee data inconsistencies have been fixed!")
