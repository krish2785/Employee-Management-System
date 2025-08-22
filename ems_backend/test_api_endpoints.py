#!/usr/bin/env python
"""
Test API endpoints to debug attendance loading issue
"""
import os
import sys
import django
import json

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from django.test import Client
from ems_api.models import AttendanceRecord

def test_attendance_api():
    """Test attendance API endpoint"""
    print("Testing Attendance API...")
    
    client = Client()
    
    # Test the attendance endpoint
    response = client.get('/api/attendance/')
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Response type: {type(data)}")
        print(f"Number of records: {len(data) if isinstance(data, list) else 'Not a list'}")
        
        if isinstance(data, list) and len(data) > 0:
            print("Sample record:")
            print(json.dumps(data[0], indent=2, default=str))
        elif isinstance(data, dict):
            print("Response structure:")
            print(json.dumps(data, indent=2, default=str))
    else:
        print(f"Error: {response.content.decode()}")
    
    # Also test direct database query
    print(f"\nDirect database query: {AttendanceRecord.objects.count()} records")

if __name__ == '__main__':
    test_attendance_api()
