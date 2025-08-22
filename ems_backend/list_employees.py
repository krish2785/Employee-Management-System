import os
import sys
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from ems_api.models import Employee

def list_all_employees():
    print("\n=== Current Employee Data ===")
    print("ID\tEmployee ID\tName\t\tEmail")
    print("-" * 60)
    
    employees = Employee.objects.all().order_by('id')
    for emp in employees:
        print(f"{emp.id}\t{emp.employee_id}\t{emp.name}\t{emp.email}")

if __name__ == "__main__":
    list_all_employees()
