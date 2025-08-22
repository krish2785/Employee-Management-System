import os
import sys
import django

# Add the Django project to the path
sys.path.insert(0, 'ems_backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')

django.setup()

from ems_api.models import Employee

# Check current employees
employees = Employee.objects.all().order_by('employee_id')
print(f"Total employees: {employees.count()}")
print("Current employee IDs:")
for emp in employees:
    print(f"  {emp.employee_id} - {emp.name}")

# Check if emp021-emp030 exist
target_ids = [f"emp{str(i).zfill(3)}" for i in range(21, 31)]
existing = Employee.objects.filter(employee_id__in=target_ids)
print(f"\nEmployees to delete (emp021-emp030):")
print(f"Found {existing.count()} employees in range emp021-emp030:")
for emp in existing:
    print(f"  {emp.employee_id} - {emp.name}")
