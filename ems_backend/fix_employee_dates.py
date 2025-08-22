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
    
    print(f"Found {employees.count()} employees to update...")
    
    # Define realistic date ranges based on employee roles
    date_ranges = {
        'CEO': (date(2018, 1, 1), date(2018, 6, 30)),      # Early joiners
        'CTO': (date(2018, 1, 1), date(2018, 6, 30)),      # Early joiners
        'Manager': (date(2018, 6, 1), date(2022, 12, 31)), # Mid-range
        'Senior': (date(2019, 1, 1), date(2023, 12, 31)),  # Mid to recent
        'Developer': (date(2020, 1, 1), date(2024, 8, 31)), # Recent joiners
        'Analyst': (date(2020, 1, 1), date(2024, 8, 31)),   # Recent joiners
        'HR': (date(2018, 6, 1), date(2023, 12, 31)),       # Mid-range
        'default': (date(2019, 1, 1), date(2024, 6, 30))    # Default range
    }
    
    for employee in employees:
        # Determine date range based on designation
        designation = employee.designation.lower()
        
        if 'ceo' in designation or 'chief' in designation:
            start_date, end_date = date_ranges['CEO']
        elif 'cto' in designation or 'technical' in designation:
            start_date, end_date = date_ranges['CTO']
        elif 'manager' in designation or 'lead' in designation:
            start_date, end_date = date_ranges['Manager']
        elif 'senior' in designation:
            start_date, end_date = date_ranges['Senior']
        elif 'developer' in designation or 'engineer' in designation:
            start_date, end_date = date_ranges['Developer']
        elif 'analyst' in designation:
            start_date, end_date = date_ranges['Analyst']
        elif 'hr' in designation or 'human' in designation:
            start_date, end_date = date_ranges['HR']
        else:
            start_date, end_date = date_ranges['default']
        
        # Generate a random date within the range
        time_between = end_date - start_date
        days_between = time_between.days
        random_days = random.randrange(days_between)
        new_joining_date = start_date + timedelta(days=random_days)
        
        # Ensure the date is not in the future
        if new_joining_date > date.today():
            new_joining_date = date.today() - timedelta(days=random.randint(30, 365))
        
        # Update the employee
        old_date = employee.joining_date
        employee.joining_date = new_joining_date
        
        # Also update date of birth to be realistic (25-55 years old)
        if not employee.date_of_birth:
            birth_year = new_joining_date.year - random.randint(25, 55)
            birth_month = random.randint(1, 12)
            birth_day = random.randint(1, 28)  # Safe day for all months
            employee.date_of_birth = date(birth_year, birth_month, birth_day)
        
        employee.save()
        
        print(f"Updated {employee.employee_id} ({employee.name}): {old_date} -> {new_joining_date}")
    
    print("\nAll employee dates updated successfully!")
    print(f"Updated {employees.count()} employees with realistic joining dates.")

if __name__ == '__main__':
    update_joining_dates()
