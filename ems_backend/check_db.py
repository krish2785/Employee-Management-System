import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from ems_api.models import Employee

def check_database():
    count = Employee.objects.count()
    print(f'Total employees: {count}')
    
    for emp in Employee.objects.all():
        print(f'{emp.employee_id}: {emp.name}')

if __name__ == '__main__':
    check_database()
