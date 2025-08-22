import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from ems_api.models import Employee

def check_employee_data():
    print("\n=== Employee Data ===")
    print("ID\tEmployee ID\tName\t\tEmail")
    print("-" * 50)
    
    for emp in Employee.objects.all():
        print(f"{emp.id}\t{emp.employee_id}\t\t{emp.name}\t{emp.email}")

if __name__ == "__main__":
    check_employee_data()
