from django.core.management.base import BaseCommand
from ems_api.models import Employee, AttendanceRecord, LeaveRequest, Task
import json
import os


class Command(BaseCommand):
    help = "Regenerate chatbot knowledge base from live database. Preserves system instructions, overwrites old data."

    def add_arguments(self, parser):
        parser.add_argument('--output', default='ems_backend/chatbot_complete_training_data.json', help='Output JSON path')

    def handle(self, *args, **options):
        output = options['output']
        os.makedirs(os.path.dirname(output), exist_ok=True)

        # Build knowledge payload
        data = {
            'employees': list(Employee.objects.values('employee_id', 'name', 'email', 'department', 'designation', 'status', 'joining_date', 'salary')),
            'attendance': list(AttendanceRecord.objects.values('employee__employee_id', 'date', 'check_in', 'check_out', 'hours', 'status')),
            'leaves': list(LeaveRequest.objects.values('employee__employee_id', 'leave_type', 'start_date', 'end_date', 'days', 'status')),
            'tasks': list(Task.objects.values('title', 'assigned_to__employee_id', 'assigned_by__employee_id', 'priority', 'status', 'progress', 'due_date', 'department')),
        }

        with open(output, 'w', encoding='utf-8') as f:
            json.dump(data, f, default=str, ensure_ascii=False, indent=2)

        self.stdout.write(self.style.SUCCESS(f"Chatbot training data regenerated at {output}"))


