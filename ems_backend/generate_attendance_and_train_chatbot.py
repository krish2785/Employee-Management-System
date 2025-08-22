import os
import sys
import django
from datetime import date, datetime, timedelta
import random
import json

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from ems_api.models import Employee, AttendanceRecord, LeaveRequest, Task

def generate_attendance_data():
    """Generate attendance data for 20 employees from July 1 to August 15, 2025"""
    
    # Clear existing attendance data
    AttendanceRecord.objects.all().delete()
    print("Cleared existing attendance data")
    
    # Get all employees
    employees = list(Employee.objects.all().order_by('employee_id'))
    if len(employees) < 20:
        print(f"Warning: Only {len(employees)} employees found, need 20")
        return
    
    # Date range: July 1, 2025 to August 15, 2025 (46 days)
    start_date = date(2025, 7, 1)
    end_date = date(2025, 8, 15)
    
    attendance_statuses = ['Present', 'Absent', 'Late', 'Half Day']
    attendance_weights = [0.85, 0.05, 0.07, 0.03]
    
    records_created = 0
    current_date = start_date
    
    while current_date <= end_date:
        # Skip weekends (Saturday=5, Sunday=6)
        if current_date.weekday() < 5:  # Monday=0 to Friday=4
            
            for employee in employees[:20]:
                status = random.choices(attendance_statuses, weights=attendance_weights)[0]
                
                if status == 'Present':
                    hours = random.choice([8.0, 8.5, 9.0])
                elif status == 'Late':
                    hours = random.choice([7.5, 8.0])
                elif status == 'Half Day':
                    hours = 4.0
                else:  # Absent
                    hours = 0.0
                
                AttendanceRecord.objects.create(
                    employee=employee,
                    date=current_date,
                    status=status,
                    hours=hours
                )
                
                records_created += 1
        
        current_date += timedelta(days=1)
    
    print(f"Created {records_created} attendance records")
    return records_created

def train_chatbot_with_complete_data():
    """Generate comprehensive training data for chatbot including attendance"""
    
    # Get all data from database
    employees = Employee.objects.all().order_by('employee_id')
    attendance_records = AttendanceRecord.objects.all()
    leave_requests = LeaveRequest.objects.all()
    tasks = Task.objects.all()
    
    training_data = {
        "employees": [],
        "departments": {},
        "attendance_summary": {},
        "leave_summary": {},
        "task_summary": {},
        "quick_facts": {}
    }
    
    print("Generating comprehensive chatbot training data...")
    
    # Employee data
    dept_counts = {}
    for employee in employees:
        emp_data = {
            "employee_id": employee.employee_id,
            "name": employee.name,
            "email": employee.email,
            "department": employee.department,
            "designation": employee.designation,
            "phone": employee.phone,
            "salary": float(employee.salary) if employee.salary else 0.0,
            "hire_date": str(employee.hire_date),
            "status": employee.status
        }
        training_data["employees"].append(emp_data)
        
        dept = employee.department
        if dept not in dept_counts:
            dept_counts[dept] = 0
        dept_counts[dept] += 1
    
    training_data["departments"] = dept_counts
    
    # Attendance summary
    attendance_stats = {
        "total_records": attendance_records.count(),
        "by_status": {},
        "by_employee": {},
        "date_range": {
            "start": "2025-07-01",
            "end": "2025-08-15"
        }
    }
    
    for status in ['Present', 'Absent', 'Late', 'Half Day']:
        attendance_stats["by_status"][status] = attendance_records.filter(status=status).count()
    
    for employee in employees:
        emp_attendance = attendance_records.filter(employee=employee)
        if emp_attendance.count() > 0:
            present_count = emp_attendance.filter(status='Present').count()
            total_count = emp_attendance.count()
            attendance_rate = (present_count / total_count * 100) if total_count > 0 else 0
            
            attendance_stats["by_employee"][employee.employee_id] = {
                "name": employee.name,
                "total_records": total_count,
                "present_days": present_count,
                "absent_days": emp_attendance.filter(status='Absent').count(),
                "late_days": emp_attendance.filter(status='Late').count(),
                "half_days": emp_attendance.filter(status='Half Day').count(),
                "attendance_rate": round(attendance_rate, 2)
            }
    
    training_data["attendance_summary"] = attendance_stats
    
    # Leave summary
    leave_stats = {
        "total_requests": leave_requests.count(),
        "by_status": {},
        "by_type": {},
        "by_employee": {}
    }
    
    for status in ['Approved', 'Pending', 'Rejected']:
        leave_stats["by_status"][status] = leave_requests.filter(status=status).count()
    
    for leave_type in ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Emergency Leave', 'Casual Leave']:
        leave_stats["by_type"][leave_type] = leave_requests.filter(leave_type=leave_type).count()
    
    for employee in employees:
        emp_leaves = leave_requests.filter(employee=employee).count()
        if emp_leaves > 0:
            leave_stats["by_employee"][employee.employee_id] = {
                "name": employee.name,
                "total_requests": emp_leaves,
                "approved": leave_requests.filter(employee=employee, status='Approved').count(),
                "pending": leave_requests.filter(employee=employee, status='Pending').count()
            }
    
    training_data["leave_summary"] = leave_stats
    
    # Task summary
    task_stats = {
        "total_tasks": tasks.count(),
        "by_status": {},
        "by_priority": {},
        "by_department": {},
        "by_employee": {}
    }
    
    for status in ['Not Started', 'In Progress', 'Completed', 'On Hold']:
        task_stats["by_status"][status] = tasks.filter(status=status).count()
    
    for priority in ['High', 'Medium', 'Low']:
        task_stats["by_priority"][priority] = tasks.filter(priority=priority).count()
    
    for dept in dept_counts.keys():
        task_stats["by_department"][dept] = tasks.filter(department=dept).count()
    
    for employee in employees:
        emp_tasks = tasks.filter(assigned_to=employee).count()
        if emp_tasks > 0:
            task_stats["by_employee"][employee.employee_id] = {
                "name": employee.name,
                "total_tasks": emp_tasks,
                "completed": tasks.filter(assigned_to=employee, status='Completed').count(),
                "in_progress": tasks.filter(assigned_to=employee, status='In Progress').count()
            }
    
    training_data["task_summary"] = task_stats
    
    # Quick facts for chatbot responses
    training_data["quick_facts"] = {
        "total_employees": employees.count(),
        "departments": list(dept_counts.keys()),
        "largest_department": max(dept_counts, key=dept_counts.get) if dept_counts else "N/A",
        "total_attendance_records": attendance_records.count(),
        "total_leave_requests": leave_requests.count(),
        "total_tasks": tasks.count(),
        "completed_tasks": tasks.filter(status='Completed').count(),
        "pending_leaves": leave_requests.filter(status='Pending').count(),
        "high_priority_tasks": tasks.filter(priority='High').count(),
        "average_attendance_rate": round(
            sum([stats["attendance_rate"] for stats in attendance_stats["by_employee"].values()]) / 
            len(attendance_stats["by_employee"]) if attendance_stats["by_employee"] else 0, 2
        )
    }
    
    # Save training data to JSON file
    output_file = 'chatbot_complete_training_data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(training_data, f, indent=2, ensure_ascii=False)
    
    print(f"Complete training data saved to {output_file}")
    
    # Generate knowledge base
    knowledge_base = generate_complete_knowledge_base(training_data)
    
    kb_file = 'chatbot_complete_knowledge_base.txt'
    with open(kb_file, 'w', encoding='utf-8') as f:
        f.write(knowledge_base)
    
    print(f"Complete knowledge base saved to {kb_file}")
    
    return training_data

def generate_complete_knowledge_base(data):
    """Generate comprehensive knowledge base for chatbot"""
    
    kb = "EMPLOYEE MANAGEMENT SYSTEM - COMPLETE CHATBOT KNOWLEDGE BASE\n"
    kb += "=" * 70 + "\n\n"
    
    # Quick facts
    kb += "QUICK FACTS:\n"
    kb += "-" * 12 + "\n"
    facts = data["quick_facts"]
    kb += f"• Total Employees: {facts['total_employees']}\n"
    kb += f"• Departments: {', '.join(facts['departments'])}\n"
    kb += f"• Largest Department: {facts['largest_department']}\n"
    kb += f"• Total Attendance Records: {facts['total_attendance_records']}\n"
    kb += f"• Average Attendance Rate: {facts['average_attendance_rate']}%\n"
    kb += f"• Total Leave Requests: {facts['total_leave_requests']}\n"
    kb += f"• Pending Leaves: {facts['pending_leaves']}\n"
    kb += f"• Total Tasks: {facts['total_tasks']}\n"
    kb += f"• Completed Tasks: {facts['completed_tasks']}\n"
    kb += f"• High Priority Tasks: {facts['high_priority_tasks']}\n\n"
    
    # Employee directory
    kb += "EMPLOYEE DIRECTORY:\n"
    kb += "-" * 18 + "\n"
    for emp in data["employees"]:
        kb += f"• {emp['employee_id']}: {emp['name']}\n"
        kb += f"  Department: {emp['department']}\n"
        kb += f"  Designation: {emp['designation']}\n"
        kb += f"  Email: {emp['email']}\n"
        kb += f"  Phone: {emp['phone']}\n\n"
    
    # Attendance summary
    kb += "ATTENDANCE SUMMARY:\n"
    kb += "-" * 19 + "\n"
    att_data = data["attendance_summary"]
    kb += f"Total Records: {att_data['total_records']}\n"
    kb += f"Date Range: {att_data['date_range']['start']} to {att_data['date_range']['end']}\n\n"
    
    kb += "By Status:\n"
    for status, count in att_data['by_status'].items():
        kb += f"• {status}: {count}\n"
    kb += "\n"
    
    kb += "Top Attendance Performers:\n"
    sorted_attendance = sorted(att_data['by_employee'].items(), 
                             key=lambda x: x[1]['attendance_rate'], reverse=True)
    for emp_id, stats in sorted_attendance[:5]:
        kb += f"• {emp_id} ({stats['name']}): {stats['attendance_rate']}%\n"
    kb += "\n"
    
    # Leave summary
    kb += "LEAVE REQUEST SUMMARY:\n"
    kb += "-" * 21 + "\n"
    leave_data = data["leave_summary"]
    kb += f"Total Requests: {leave_data['total_requests']}\n\n"
    
    kb += "By Status:\n"
    for status, count in leave_data['by_status'].items():
        kb += f"• {status}: {count}\n"
    kb += "\n"
    
    kb += "By Type:\n"
    for leave_type, count in leave_data['by_type'].items():
        kb += f"• {leave_type}: {count}\n"
    kb += "\n"
    
    # Task summary
    kb += "TASK SUMMARY:\n"
    kb += "-" * 13 + "\n"
    task_data = data["task_summary"]
    kb += f"Total Tasks: {task_data['total_tasks']}\n\n"
    
    kb += "By Status:\n"
    for status, count in task_data['by_status'].items():
        kb += f"• {status}: {count}\n"
    kb += "\n"
    
    kb += "By Priority:\n"
    for priority, count in task_data['by_priority'].items():
        kb += f"• {priority}: {count}\n"
    kb += "\n"
    
    kb += "By Department:\n"
    for dept, count in task_data['by_department'].items():
        kb += f"• {dept}: {count}\n"
    kb += "\n"
    
    return kb

def main():
    """Main function to generate attendance and train chatbot"""
    print("Step 1: Generating attendance data...")
    attendance_count = generate_attendance_data()
    
    print("\nStep 2: Training chatbot with complete dataset...")
    training_data = train_chatbot_with_complete_data()
    
    print(f"\nCOMPLETE! Generated:")
    print(f"• {attendance_count} attendance records")
    print(f"• {training_data['quick_facts']['total_leave_requests']} leave requests")
    print(f"• {training_data['quick_facts']['total_tasks']} tasks")
    print(f"• Complete chatbot training data and knowledge base")

if __name__ == '__main__':
    main()
