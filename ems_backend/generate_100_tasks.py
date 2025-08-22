import os
import sys
import django
from datetime import date, datetime, timedelta
import random

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from ems_api.models import Employee, Task

def generate_100_tasks():
    """Generate 100 tasks for all 20 employees"""
    
    # Clear existing task data
    Task.objects.all().delete()
    print("Cleared existing task data")
    
    # Get all employees
    employees = list(Employee.objects.all().order_by('employee_id'))
    if len(employees) < 20:
        print(f"Warning: Only {len(employees)} employees found, need 20")
        return
    
    # Task priorities and weights
    priorities = ['High', 'Medium', 'Low']
    priority_weights = [0.3, 0.5, 0.2]
    
    # Task statuses and weights
    statuses = ['Not Started', 'In Progress', 'Completed', 'On Hold']
    status_weights = [0.25, 0.4, 0.25, 0.1]
    
    # Department-specific task titles and descriptions
    task_templates = {
        'Engineering': [
            {'title': 'Code Review for Feature X', 'desc': 'Review and approve code changes for the new feature implementation'},
            {'title': 'Bug Fix - Login Issue', 'desc': 'Investigate and fix the login authentication bug reported by users'},
            {'title': 'Database Optimization', 'desc': 'Optimize database queries to improve application performance'},
            {'title': 'API Documentation Update', 'desc': 'Update API documentation with latest endpoint changes'},
            {'title': 'Unit Test Implementation', 'desc': 'Write comprehensive unit tests for the payment module'},
            {'title': 'Security Audit', 'desc': 'Conduct security audit of the application and fix vulnerabilities'},
            {'title': 'Performance Monitoring Setup', 'desc': 'Set up monitoring tools to track application performance'},
            {'title': 'Mobile App Testing', 'desc': 'Test mobile application on different devices and platforms'},
            {'title': 'Server Migration', 'desc': 'Migrate application from old server to new cloud infrastructure'},
            {'title': 'Integration Testing', 'desc': 'Perform integration testing with third-party services'}
        ],
        'HR': [
            {'title': 'Employee Onboarding Process', 'desc': 'Conduct onboarding session for new employees joining this month'},
            {'title': 'Performance Review Preparation', 'desc': 'Prepare performance review documents and schedule meetings'},
            {'title': 'Policy Update Documentation', 'desc': 'Update employee handbook with new company policies'},
            {'title': 'Training Program Coordination', 'desc': 'Coordinate technical training program for development team'},
            {'title': 'Exit Interview Scheduling', 'desc': 'Schedule and conduct exit interviews for departing employees'},
            {'title': 'Recruitment Drive Planning', 'desc': 'Plan and execute recruitment drive for Q4 hiring'},
            {'title': 'Employee Engagement Survey', 'desc': 'Conduct quarterly employee engagement survey and analyze results'},
            {'title': 'Benefits Administration', 'desc': 'Process employee benefits enrollment and claims'},
            {'title': 'Compliance Audit', 'desc': 'Ensure HR processes comply with labor laws and regulations'},
            {'title': 'Team Building Event', 'desc': 'Organize team building activities for department integration'}
        ],
        'Marketing': [
            {'title': 'Social Media Campaign', 'desc': 'Create and execute social media marketing campaign for product launch'},
            {'title': 'Content Creation for Blog', 'desc': 'Write and publish blog posts about industry trends and company updates'},
            {'title': 'Market Research Analysis', 'desc': 'Analyze market research data and prepare insights report'},
            {'title': 'Email Marketing Campaign', 'desc': 'Design and send email marketing campaign to customer segments'},
            {'title': 'Brand Guidelines Update', 'desc': 'Update brand guidelines and ensure consistency across materials'},
            {'title': 'Customer Survey Design', 'desc': 'Design customer satisfaction survey and analyze feedback'},
            {'title': 'Product Launch Strategy', 'desc': 'Develop comprehensive marketing strategy for new product launch'},
            {'title': 'Website Content Optimization', 'desc': 'Optimize website content for better SEO and user engagement'},
            {'title': 'Competitor Analysis', 'desc': 'Conduct detailed analysis of competitor marketing strategies'},
            {'title': 'Event Marketing Planning', 'desc': 'Plan marketing activities for upcoming industry conference'}
        ],
        'Finance': [
            {'title': 'Monthly Financial Report', 'desc': 'Prepare comprehensive monthly financial statements and analysis'},
            {'title': 'Budget Planning Q4', 'desc': 'Create detailed budget plan for the fourth quarter operations'},
            {'title': 'Expense Audit Review', 'desc': 'Review and audit employee expense reports for compliance'},
            {'title': 'Tax Preparation', 'desc': 'Prepare quarterly tax filings and ensure regulatory compliance'},
            {'title': 'Cash Flow Analysis', 'desc': 'Analyze cash flow patterns and prepare forecasting report'},
            {'title': 'Vendor Payment Processing', 'desc': 'Process vendor invoices and ensure timely payments'},
            {'title': 'Financial Risk Assessment', 'desc': 'Assess financial risks and recommend mitigation strategies'},
            {'title': 'Investment Portfolio Review', 'desc': 'Review company investment portfolio and suggest optimizations'},
            {'title': 'Cost Reduction Analysis', 'desc': 'Identify areas for cost reduction and efficiency improvements'},
            {'title': 'Financial Dashboard Update', 'desc': 'Update financial dashboard with latest KPIs and metrics'}
        ],
        'Sales': [
            {'title': 'Client Presentation Preparation', 'desc': 'Prepare sales presentation for potential enterprise client'},
            {'title': 'Lead Generation Campaign', 'desc': 'Execute lead generation campaign targeting new market segments'},
            {'title': 'Customer Relationship Management', 'desc': 'Update CRM system with latest customer interactions and data'},
            {'title': 'Sales Target Analysis', 'desc': 'Analyze current sales performance against quarterly targets'},
            {'title': 'Product Demo Scheduling', 'desc': 'Schedule and conduct product demonstrations for prospects'},
            {'title': 'Contract Negotiation', 'desc': 'Negotiate contract terms with key enterprise customers'},
            {'title': 'Market Expansion Research', 'desc': 'Research potential markets for business expansion opportunities'},
            {'title': 'Sales Training Session', 'desc': 'Conduct sales training session for new team members'},
            {'title': 'Customer Retention Strategy', 'desc': 'Develop strategy to improve customer retention rates'},
            {'title': 'Pipeline Review Meeting', 'desc': 'Review sales pipeline and update forecasting models'}
        ]
    }
    
    # Get admin employees for task assignment
    admin_employees = [emp for emp in employees if emp.designation in ['HR Manager', 'Finance Manager', 'Sales Director']]
    if not admin_employees:
        admin_employees = employees[:3]  # Use first 3 as admins
    
    records_created = 0
    
    # Generate 100 tasks
    for i in range(100):
        # Select random employee
        assigned_employee = random.choice(employees[:20])
        assigned_by_employee = random.choice(admin_employees)
        
        # Get department-specific tasks
        dept_tasks = task_templates.get(assigned_employee.department, task_templates['Engineering'])
        task_template = random.choice(dept_tasks)
        
        # Select priority and status
        priority = random.choices(priorities, weights=priority_weights)[0]
        status = random.choices(statuses, weights=status_weights)[0]
        
        # Generate progress based on status
        if status == 'Not Started':
            progress = 0
        elif status == 'In Progress':
            progress = random.randint(10, 80)
        elif status == 'Completed':
            progress = 100
        else:  # On Hold
            progress = random.randint(5, 50)
        
        # Generate dates
        base_date = date.today()
        assigned_offset = random.randint(-60, -1)  # Assigned 1-60 days ago
        assigned_date = base_date + timedelta(days=assigned_offset)
        
        due_offset = random.randint(1, 30)  # Due in 1-30 days
        due_date = base_date + timedelta(days=due_offset)
        
        # Generate estimated hours
        estimated_hours = random.choice([4, 8, 12, 16, 20, 24, 32, 40])
        
        try:
            # Create task
            Task.objects.create(
                title=task_template['title'],
                description=task_template['desc'],
                assigned_to=assigned_employee,
                assigned_by=assigned_by_employee,
                assigned_date=assigned_date,
                due_date=due_date,
                priority=priority,
                status=status,
                progress=progress,
                department=assigned_employee.department,
                estimated_hours=estimated_hours
            )
            
            records_created += 1
            print(f"Created task {i+1}: {assigned_employee.employee_id} - {task_template['title']} ({priority}, {status})")
            
        except Exception as e:
            print(f"Error creating task {i+1}: {e}")
    
    print(f"\nCreated {records_created} tasks")
    
    # Summary by employee
    print("\nTask summary by employee:")
    for employee in employees[:20]:
        count = Task.objects.filter(assigned_to=employee).count()
        if count > 0:
            completed = Task.objects.filter(assigned_to=employee, status='Completed').count()
            in_progress = Task.objects.filter(assigned_to=employee, status='In Progress').count()
            print(f"{employee.employee_id} ({employee.name}): {count} tasks ({completed} completed, {in_progress} in progress)")
    
    # Summary by department
    print("\nTask summary by department:")
    departments = ['Engineering', 'HR', 'Marketing', 'Finance', 'Sales']
    for dept in departments:
        count = Task.objects.filter(department=dept).count()
        print(f"{dept}: {count} tasks")
    
    # Summary by priority
    print("\nTask summary by priority:")
    for priority in priorities:
        count = Task.objects.filter(priority=priority).count()
        print(f"{priority}: {count} tasks")
    
    # Summary by status
    print("\nTask summary by status:")
    for status in statuses:
        count = Task.objects.filter(status=status).count()
        print(f"{status}: {count} tasks")
    
    total_records = Task.objects.count()
    print(f"\nTotal tasks in database: {total_records}")

if __name__ == '__main__':
    generate_100_tasks()
