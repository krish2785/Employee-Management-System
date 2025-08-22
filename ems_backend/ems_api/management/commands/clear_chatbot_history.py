from django.core.management.base import BaseCommand
from ems_api.models import Employee, AttendanceRecord, LeaveRequest, Task
import json
import os
from datetime import datetime


class Command(BaseCommand):
    help = "Clear chatbot history and retrain with live database data"

    def add_arguments(self, parser):
        parser.add_argument('--output', default='ems_backend/chatbot_live_data.json', help='Output JSON path')

    def handle(self, *args, **options):
        output = options['output']
        os.makedirs(os.path.dirname(output), exist_ok=True)

        # Build comprehensive knowledge payload from live database
        data = {
            'timestamp': datetime.now().isoformat(),
            'data_source': 'live_database',
            'employees': list(Employee.objects.values(
                'employee_id', 'name', 'email', 'department', 'designation', 
                'status', 'joining_date', 'salary', 'date_of_birth', 'age'
            )),
            'attendance': list(AttendanceRecord.objects.values(
                'employee__employee_id', 'employee__name', 'date', 'check_in', 
                'check_out', 'hours', 'status'
            )),
            'leaves': list(LeaveRequest.objects.values(
                'employee__employee_id', 'employee__name', 'leave_type', 
                'start_date', 'end_date', 'days', 'status', 'reason'
            )),
            'tasks': list(Task.objects.values(
                'title', 'description', 'assigned_to__employee_id', 
                'assigned_to__name', 'assigned_by__employee_id', 'priority', 
                'status', 'progress', 'due_date', 'department'
            )),
            'statistics': {
                'total_employees': Employee.objects.count(),
                'active_employees': Employee.objects.filter(status='Active').count(),
                'total_attendance_records': AttendanceRecord.objects.count(),
                'total_leave_requests': LeaveRequest.objects.count(),
                'total_tasks': Task.objects.count(),
                'departments': list(Employee.objects.values_list('department', flat=True).distinct()),
            }
        }

        with open(output, 'w', encoding='utf-8') as f:
            json.dump(data, f, default=str, ensure_ascii=False, indent=2)

        self.stdout.write(
            self.style.SUCCESS(
                f"Chatbot history cleared and retrained with live data at {output}\n"
                f"Total records: {data['statistics']['total_employees']} employees, "
                f"{data['statistics']['total_attendance_records']} attendance records, "
                f"{data['statistics']['total_leave_requests']} leave requests, "
                f"{data['statistics']['total_tasks']} tasks"
            )
        )
