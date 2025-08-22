"""
Chatbot Tools for EMS System
Provides tools for the chatbot to access employee, attendance, leave, and task data
"""

import os
import sys
import django
from datetime import datetime, date
from typing import List, Dict, Any, Optional

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from .models import Employee, AttendanceRecord, LeaveRequest, Task

class ChatbotTools:
    """Tools for chatbot to access EMS data"""
    
    @staticmethod
    def get_all_employees() -> List[Dict[str, Any]]:
        """Get all employees with their details"""
        try:
            employees = Employee.objects.all()
            return [
                {
                    'id': emp.id,
                    'employee_id': emp.employee_id,
                    'name': emp.name,
                    'email': emp.email,
                    'phone': emp.phone,
                    'department': emp.department,
                    'designation': emp.designation,
                    'joining_date': emp.joining_date.strftime('%Y-%m-%d'),
                    'salary': emp.salary,
                    'status': emp.status
                }
                for emp in employees
            ]
        except Exception as e:
            return [{'error': f'Failed to fetch employees: {str(e)}'}]
    
    @staticmethod
    def get_employee_by_id(employee_id: str) -> Dict[str, Any]:
        """Get employee details by employee ID with data validation"""
        try:
            # Ensure we get the exact employee by employee_id
            employee = Employee.objects.get(employee_id=employee_id)
            
            # Validate data consistency
            result = {
                'id': employee.id,
                'employee_id': employee.employee_id,
                'name': employee.name,
                'email': employee.email,
                'phone': employee.phone,
                'department': employee.department,
                'designation': employee.designation,
                'joining_date': employee.joining_date.strftime('%Y-%m-%d'),
                'salary': float(employee.salary) if employee.salary else None,
                'status': employee.status,
                'manager': employee.manager
            }
            
            # Add data validation flag
            result['data_validated'] = True
            result['retrieved_at'] = str(datetime.now())
            
            return result
        except Employee.DoesNotExist:
            return {'error': f'Employee with ID {employee_id} not found'}
        except Exception as e:
            return {'error': f'Failed to fetch employee: {str(e)}'}
    
    @staticmethod
    def get_employees_by_department(department: str) -> List[Dict[str, Any]]:
        """Get all employees in a specific department"""
        try:
            employees = Employee.objects.filter(department__icontains=department)
            return [
                {
                    'id': emp.id,
                    'employee_id': emp.employee_id,
                    'name': emp.name,
                    'email': emp.email,
                    'department': emp.department,
                    'designation': emp.designation,
                    'status': emp.status
                }
                for emp in employees
            ]
        except Exception as e:
            return [{'error': f'Failed to fetch employees by department: {str(e)}'}]
    
    @staticmethod
    def get_attendance_records(start_date: Optional[str] = None, end_date: Optional[str] = None, employee_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get attendance records with optional filters"""
        try:
            records = AttendanceRecord.objects.all()
            
            if start_date:
                start = datetime.strptime(start_date, '%Y-%m-%d').date()
                records = records.filter(date__gte=start)
            
            if end_date:
                end = datetime.strptime(end_date, '%Y-%m-%d').date()
                records = records.filter(date__lte=end)
            
            if employee_id:
                records = records.filter(employee__employee_id=employee_id)
            
            return [
                {
                    'id': record.id,
                    'employee_name': record.employee.name,
                    'employee_id': record.employee.employee_id,
                    'department': record.employee.department,
                    'date': record.date.strftime('%Y-%m-%d'),
                    'check_in': record.check_in.strftime('%H:%M:%S') if record.check_in else None,
                    'check_out': record.check_out.strftime('%H:%M:%S') if record.check_out else None,
                    'hours': record.hours,
                    'status': record.status
                }
                for record in records
            ]
        except Exception as e:
            return [{'error': f'Failed to fetch attendance records: {str(e)}'}]
    
    @staticmethod
    def get_attendance_summary(department: Optional[str] = None, date: Optional[str] = None) -> Dict[str, Any]:
        """Get attendance summary statistics"""
        try:
            records = AttendanceRecord.objects.all()
            
            if department:
                records = records.filter(employee__department__icontains=department)
            
            if date:
                target_date = datetime.strptime(date, '%Y-%m-%d').date()
                records = records.filter(date=target_date)
            
            total_records = records.count()
            present_count = records.filter(status='Present').count()
            absent_count = records.filter(status='Absent').count()
            late_count = records.filter(status='Late').count()
            
            return {
                'total_records': total_records,
                'present': present_count,
                'absent': absent_count,
                'late': late_count,
                'attendance_rate': round((present_count / total_records * 100), 2) if total_records > 0 else 0
            }
        except Exception as e:
            return {'error': f'Failed to fetch attendance summary: {str(e)}'}
    
    @staticmethod
    def get_leave_requests(status: Optional[str] = None, employee_id: Optional[str] = None, department: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get leave requests with optional filters"""
        try:
            requests = LeaveRequest.objects.all()
            
            if status:
                requests = requests.filter(status__icontains=status)
            
            if employee_id:
                requests = requests.filter(employee__employee_id=employee_id)
            
            if department:
                requests = requests.filter(employee__department__icontains=department)
            
            return [
                {
                    'id': req.id,
                    'employee_name': req.employee.name,
                    'employee_id': req.employee.employee_id,
                    'department': req.employee.department,
                    'leave_type': req.leave_type,
                    'start_date': req.start_date.strftime('%Y-%m-%d'),
                    'end_date': req.end_date.strftime('%Y-%m-%d'),
                    'days': req.days,
                    'applied_date': req.applied_date.strftime('%Y-%m-%d'),
                    'status': req.status,
                    'reason': req.reason
                }
                for req in requests
            ]
        except Exception as e:
            return [{'error': f'Failed to fetch leave requests: {str(e)}'}]
    
    @staticmethod
    def get_leave_summary(department: Optional[str] = None) -> Dict[str, Any]:
        """Get leave summary statistics"""
        try:
            requests = LeaveRequest.objects.all()
            
            if department:
                requests = requests.filter(employee__department__icontains=department)
            
            total_requests = requests.count()
            pending_count = requests.filter(status='Pending').count()
            approved_count = requests.filter(status='Approved').count()
            rejected_count = requests.filter(status='Rejected').count()
            
            return {
                'total_requests': total_requests,
                'pending': pending_count,
                'approved': approved_count,
                'rejected': rejected_count
            }
        except Exception as e:
            return {'error': f'Failed to fetch leave summary: {str(e)}'}
    
    @staticmethod
    def get_tasks(status: Optional[str] = None, priority: Optional[str] = None, assigned_to: Optional[str] = None, department: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get tasks with optional filters"""
        try:
            tasks = Task.objects.all()
            
            if status:
                tasks = tasks.filter(status__icontains=status)
            
            if priority:
                tasks = tasks.filter(priority__icontains=priority)
            
            if assigned_to:
                tasks = tasks.filter(assigned_to__employee_id=assigned_to)
            
            if department:
                tasks = tasks.filter(assigned_to__department__icontains=department)
            
            return [
                {
                    'id': task.id,
                    'title': task.title,
                    'description': task.description,
                    'assigned_to_name': task.assigned_to.name,
                    'assigned_to_id': task.assigned_to.employee_id,
                    'assigned_by_name': task.assigned_by.name,
                    'assigned_date': task.assigned_date.strftime('%Y-%m-%d'),
                    'due_date': task.due_date.strftime('%Y-%m-%d'),
                    'priority': task.priority,
                    'status': task.status,
                    'progress': task.progress,
                    'department': task.assigned_to.department,
                    'estimated_hours': task.estimated_hours
                }
                for task in tasks
            ]
        except Exception as e:
            return [{'error': f'Failed to fetch tasks: {str(e)}'}]
    
    @staticmethod
    def get_task_summary(department: Optional[str] = None) -> Dict[str, Any]:
        """Get task summary statistics"""
        try:
            tasks = Task.objects.all()
            
            if department:
                tasks = tasks.filter(assigned_to__department__icontains=department)
            
            total_tasks = tasks.count()
            not_started = tasks.filter(status='Not Started').count()
            in_progress = tasks.filter(status='In Progress').count()
            completed = tasks.filter(status='Completed').count()
            on_hold = tasks.filter(status='On Hold').count()
            
            high_priority = tasks.filter(priority='High').count()
            medium_priority = tasks.filter(priority='Medium').count()
            low_priority = tasks.filter(priority='Low').count()
            
            return {
                'total_tasks': total_tasks,
                'not_started': not_started,
                'in_progress': in_progress,
                'completed': completed,
                'on_hold': on_hold,
                'high_priority': high_priority,
                'medium_priority': medium_priority,
                'low_priority': low_priority
            }
        except Exception as e:
            return {'error': f'Failed to fetch task summary: {str(e)}'}
    
    @staticmethod
    def get_department_summary() -> Dict[str, Any]:
        """Get summary statistics by department"""
        try:
            departments = Employee.objects.values_list('department', flat=True).distinct()
            summary = {}
            
            for dept in departments:
                emp_count = Employee.objects.filter(department=dept).count()
                attendance_summary = ChatbotTools.get_attendance_summary(department=dept)
                leave_summary = ChatbotTools.get_leave_summary(department=dept)
                task_summary = ChatbotTools.get_task_summary(department=dept)
                
                summary[dept] = {
                    'employee_count': emp_count,
                    'attendance': attendance_summary,
                    'leave': leave_summary,
                    'tasks': task_summary
                }
            
            return summary
        except Exception as e:
            return {'error': f'Failed to fetch department summary: {str(e)}'}
    
    @staticmethod
    def search_employees(query: str) -> List[Dict[str, Any]]:
        """Search employees by name, email, or employee ID"""
        try:
            employees = Employee.objects.filter(
                name__icontains=query
            ) | Employee.objects.filter(
                email__icontains=query
            ) | Employee.objects.filter(
                employee_id__icontains=query
            )
            
            return [
                {
                    'id': emp.id,
                    'employee_id': emp.employee_id,
                    'name': emp.name,
                    'email': emp.email,
                    'department': emp.department,
                    'designation': emp.designation,
                    'status': emp.status
                }
                for emp in employees
            ]
        except Exception as e:
            return [{'error': f'Failed to search employees: {str(e)}'}]

# Create a function to get all available tools
def get_chatbot_tools() -> Dict[str, Any]:
    """Get all available chatbot tools"""
    return {
        'get_all_employees': ChatbotTools.get_all_employees,
        'get_employee_by_id': ChatbotTools.get_employee_by_id,
        'get_employees_by_department': ChatbotTools.get_employees_by_department,
        'get_attendance_records': ChatbotTools.get_attendance_records,
        'get_attendance_summary': ChatbotTools.get_attendance_summary,
        'get_leave_requests': ChatbotTools.get_leave_requests,
        'get_leave_summary': ChatbotTools.get_leave_summary,
        'get_tasks': ChatbotTools.get_tasks,
        'get_task_summary': ChatbotTools.get_task_summary,
        'get_department_summary': ChatbotTools.get_department_summary,
        'search_employees': ChatbotTools.search_employees
    }
