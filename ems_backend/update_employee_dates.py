#!/usr/bin/env python
"""
Script to update employee joining dates with realistic values
"""
import os
import sys
import django
from datetime import date, timedelta
import random

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from ems_api.models import Employee

def update_joining_dates():
    """Update all employee joining dates with realistic values"""
    employees = Employee.objects.all()
    
    # Define realistic date ranges
    start_date = date(2018, 1, 1)  # Company started in 2018
    end_date = date(2024, 12, 31)   # Up to end of 2024
    
    print(f"Updating joining dates for {employees.count()} employees...")
    
    for i, employee in enumerate(employees):
        # Generate a random date between start_date and end_date
        time_between = end_date - start_date
        days_between = time_between.days
        random_days = random.randrange(days_between)
        random_date = start_date + timedelta(days=random_days)
        
        # Ensure the date is not in the future
        if random_date > date.today():
            random_date = date.today() - timedelta(days=random.randint(30, 365))
        
        # Update the employee
        old_date = employee.joining_date
        employee.joining_date = random_date
        employee.save()
        
        print(f"Employee {employee.employee_id} ({employee.name}): {old_date} -> {random_date}")
    
    print("All employee joining dates updated successfully!")

if __name__ == '__main__':
    update_joining_dates()
