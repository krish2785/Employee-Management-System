<<<<<<< HEAD
# Employee Management System (EMS)

A full-stack Employee Management System with Django backend and React frontend.

## 🏗️ Project Structure

```
EMSTEMP/
├── project/                 # React Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── data/          # Mock data (can be replaced with API calls)
│   ├── package.json
│   └── README.md
└── ems_backend/            # Django Backend
    ├── ems_api/           # Main API app
    ├── ems_backend/       # Django project settings
    ├── requirements.txt
    └── README.md
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- MySQL Server 8.0+

### 1. Backend Setup (Django)

```bash
# Navigate to backend directory
cd ems_backend

# Create virtual environment
python -m venv django_env

# Activate virtual environment
# Windows:
django_env\Scripts\activate
# Linux/Mac:
source django_env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup MySQL database (see MYSQL_SETUP_GUIDE.md for details)
python setup_mysql.py

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Populate with sample data
python manage.py populate_data

# Start Django server
python manage.py runserver
```

**Backend will be available at:** http://localhost:8000
**Admin interface:** http://localhost:8000/admin
**API endpoints:** http://localhost:8000/api/
**Database:** MySQL (ems_db)

**Default admin credentials:**
- Username: `admin`
- Password: `admin123`

### 2. Frontend Setup (React)

```bash
# Navigate to frontend directory
cd project

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend will be available at:** http://localhost:5173

## 🔌 API Connection

The frontend is configured to connect to the Django backend at `http://localhost:8000/api/`. 

**Key API endpoints:**
- **Employees:** `/api/employees/`
- **Attendance:** `/api/attendance/`
- **Leave Requests:** `/api/leave-requests/`
- **Tasks:** `/api/tasks/`
- **Authentication:** `/api/auth/`

## 🗄️ Database Models

### Employee
- Basic info (name, email, department, designation)
- Salary and manager details
- Status tracking

### AttendanceRecord
- Daily attendance tracking
- Check-in/check-out times
- Hours worked calculation

### LeaveRequest
- Leave application management
- Multiple leave types
- Approval workflow

### Task
- Task assignment and tracking
- Priority and status management
- Progress tracking

## 🛠️ Features

### Backend (Django)
- ✅ RESTful API with Django REST Framework
- ✅ Comprehensive data models
- ✅ Admin interface
- ✅ Authentication system
- ✅ CORS configuration for frontend
- ✅ Sample data population
- ✅ Custom management commands

### Frontend (React)
- ✅ Modern UI with Tailwind CSS
- ✅ Responsive design
- ✅ API integration service
- ✅ Component-based architecture
- ✅ TypeScript support
- ✅ React Router for navigation

## 🔧 Development

### Backend Development
```bash
# Create new migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Shell access
python manage.py shell
```

### Frontend Development
```bash
# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## 🌐 API Documentation

### Authentication
```bash
# Login
POST /api/auth/login/
{
  "username": "admin",
  "password": "admin123"
}

# Get current user
GET /api/auth/user/

# Logout
POST /api/auth/logout/
```

### Employees
```bash
# List all employees
GET /api/employees/

# Get employee details
GET /api/employees/{id}/

# Create employee
POST /api/employees/
{
  "employee_id": "EMP005",
  "name": "John Doe",
  "email": "john.doe@company.com",
  "department": "Engineering",
  "designation": "Developer",
  "hire_date": "2024-01-01",
  "status": "Active",
  "phone": "+1234567890"
}

# Update employee
PUT /api/employees/{id}/

# Delete employee
DELETE /api/employees/{id}/
```

### Attendance
```bash
# List all attendance records
GET /api/attendance/

# Get attendance by date
GET /api/attendance/by_date/?date=2024-01-15

# Get attendance by employee
GET /api/attendance/by_employee/?employee_id=EMP001

# Create attendance record
POST /api/attendance/
{
  "date": "2024-01-15",
  "employee": 1,
  "check_in": "09:00:00",
  "check_out": "17:30:00",
  "hours": 8.5,
  "status": "Present"
}
```

### Leave Requests
```bash
# List all leave requests
GET /api/leave-requests/

# Get pending requests
GET /api/leave-requests/pending/

# Create leave request
POST /api/leave-requests/
{
  "employee": 1,
  "leave_type": "Annual Leave",
  "start_date": "2024-02-01",
  "end_date": "2024-02-03",
  "days": 3,
  "reason": "Family vacation"
}

# Approve/Reject leave request
POST /api/leave-requests/{id}/approve/
POST /api/leave-requests/{id}/reject/
```

### Tasks
```bash
# List all tasks
GET /api/tasks/

# Get tasks by status
GET /api/tasks/by_status/?status=In Progress

# Get tasks by priority
GET /api/tasks/by_priority/?priority=High

# Create task
POST /api/tasks/
{
  "title": "New Task",
  "description": "Task description",
  "assigned_to": 1,
  "assigned_by": 2,
  "due_date": "2024-02-15",
  "priority": "Medium",
  "department": "Engineering"
}

# Update task progress
POST /api/tasks/{id}/update_progress/
{
  "progress": 75
}
```

## 🔒 Security Considerations

### Development
- CORS allows all origins (for development only)
- Debug mode enabled
- SQLite database

### Production
- Set `DEBUG = False`
- Configure proper CORS origins
- Use environment variables for secrets
- Use production database (PostgreSQL recommended)
- Enable HTTPS
- Configure proper authentication

## 🚀 Deployment

### Backend Deployment
1. Set `DEBUG = False`
2. Configure production database
3. Set up environment variables
4. Use production WSGI server (Gunicorn, uWSGI)
5. Configure static file serving
6. Set up logging

### Frontend Deployment
1. Build with `npm run build`
2. Serve static files from web server
3. Configure API base URL for production
4. Set up proper CORS on backend

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if virtual environment is activated
- Verify all dependencies are installed
- Check if port 8000 is available

**Frontend can't connect to backend:**
- Ensure Django server is running
- Check CORS configuration
- Verify API endpoints are correct

**Database errors:**
- Run migrations: `python manage.py migrate`
- Check database configuration
- Verify model relationships

**Authentication issues:**
- Check if user exists in database
- Verify password is correct
- Check session configuration

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Django and React documentation
3. Check browser console for frontend errors
4. Check Django server logs for backend errors
=======
# Employee-Management-System 
EMS Project Complete Functionality Summary
1. Employee Management System
Core Employee Features:
•	Employee Profiles: Complete employee records with 28 employees across departments
•	Employee ID System: Unique employee IDs (EMP001-EMP028, emp001-emp020)
•	Personal Information: Name, email, phone, department, designation, hire date
•	Employment Details: Salary (₹550,000-₹1,200,000), employment status (Active/Inactive)
•	Organizational Structure: Department assignments (Engineering, HR, Marketing, Finance, Sales)
•	Manager Relationships: Hierarchical reporting structure
•	User Account Integration: Linked to Django user accounts
2. Attendance Tracking System
Daily Attendance Management:
•	Check-in/Check-out: Daily time tracking (09:00-17:30 standard hours)
•	320 Attendance Records: Comprehensive daily attendance tracking
•	Status Tracking: Present/Absent/Late status indicators
•	Hours Calculation: Automatic working hours calculation (8.5 hours standard)
•	Department-wise Attendance: Organized by department for easy monitoring
•	Real-time Updates: Live attendance status dashboard
3. Leave Management System
Comprehensive Leave Handling:
•	60 Leave Requests: Complete leave application history
•	Leave Types: Annual Leave, Sick Leave, Personal Leave
•	Application Process: Employee self-service leave requests
•	Approval Workflow: Multi-level approval (HR Manager approval)
•	Duration Tracking: 1-3 days typical leave duration
•	Status Management: Approved/Pending/Rejected status tracking
•	Reason Documentation: Detailed leave reasons for audit trail
4. Task Management System
Project & Task Tracking:
•	100 Active Tasks: Comprehensive task management across departments
•	Task Assignment: Manager-to-employee task delegation
•	Priority Levels: High, Medium, Low priority classification
•	Progress Tracking: 0-100% completion status
•	Due Date Management: Deadline tracking with estimated hours
•	Department-wise Tasks: Organized by department (Engineering, HR, Marketing, etc.)
•	Task Descriptions: Detailed task requirements and deliverables
5. Department & Organizational Structure
Organizational Hierarchy:
•	Engineering Department: Senior Developers, Software Engineers, DevOps, QA Engineers
•	HR Department: HR Manager, HR Coordinator, Recruiter, Training Specialist
•	Marketing Department: Marketing Manager, Marketing Specialist, Content Creator, Digital Marketing
•	Finance Department: Finance Manager, Financial Analyst, Accountant, Budget Analyst
•	Sales Department: Sales Director, Sales Manager, Sales Representative, Business Development
6. Salary & Compensation Management
Comprehensive Compensation System:
•	Salary Range: ₹550,000 - ₹1,200,000 annual salary
•	Department-wise Salaries: Engineering (₹750,000-₹950,000), HR (₹550,000-₹850,000)
•	Designation-based Pay: Senior roles command higher salaries
•	Currency: Indian Rupees (INR) with proper formatting
7. Contact & Communication Management
Employee Contact System:
•	Email Integration: Company email addresses for all employees
•	Phone Numbers: Complete contact information with country codes
•	Communication Channels: Email and phone-based notifications
8. Date & Time Management
Temporal Data Handling:
•	Hire Dates: Ranging from 2022-2024 showing employment history
•	Attendance Dates: Daily tracking with time stamps
•	Leave Dates: Start and end date tracking for leave periods
•	Due Dates: Task deadline management
•	Date Format: YYYY-MM-DD with DD:MM:YYYY display format
9. Status & Workflow Management
System Status Tracking:
•	Employee Status: Active/Inactive employment tracking
•	Attendance Status: Present/Absent/Late
•	Leave Status: Approved/Pending/Rejected
•	Task Status: Not Started/In Progress/Completed
•	Progress Tracking: Percentage-based completion tracking
10. Reporting & Analytics
Comprehensive Reporting:
•	Employee Reports: 28 employees across 5 departments
•	Attendance Analytics: 320 attendance records
•	Leave Analytics: 60 leave requests with approval rates
•	Task Analytics: 100 tasks with completion tracking
•	Department-wise Reports: Organized by department for management insights
11. API & Integration Features
Backend API System:
•	RESTful API: Django REST Framework endpoints
•	Employee API: /api/employees/ for employee management
•	Attendance API: /api/attendance/ for attendance tracking
•	Leave API: /api/leave-requests/ for leave management
•	Task API: /api/tasks/ for task management
•	Database Schema: MySQL with proper relationships
12. User Experience & Interface
Frontend Features:
•	Dashboard Overview: Real-time widgets showing key metrics
•	Employee Portal: Self-service access for employees
•	Manager Dashboard: Team oversight and management tools
•	HR Admin Panel: Full system administration capabilities
•	Mobile Responsive: Optimized for mobile and tablet devices
13. Data Validation & Integrity
System Reliability:
•	Unique IDs: Employee IDs and system-generated IDs
•	Data Relationships: Proper foreign key relationships between modules
•	Validation Rules: Input validation for all data fields
•	Audit Trail: Complete history of all system activities
14. Scalability & Performance
Enterprise-grade Features:
•	Scalable Architecture: Designed for thousands of employees
•	Performance Optimization: Efficient database queries
•	Backup System: Automated data backup and recovery
•	Security: Role-based access control and data encryption
This EMS system provides a complete, integrated solution for managing the entire employee lifecycle from hiring to retirement, with comprehensive tracking of attendance, leave, tasks, and performance across all organizational departments.
Task Completed
EMS Project Complete Functionality Summary
Based on comprehensive analysis of the EMS project data, here is a complete and detailed summary of all functionalities:
1. Employee Management System
•	28 Employee Profiles: Complete records with unique IDs (EMP001-EMP028, emp001-emp020)
•	Personal Information: Name, email, phone, department, designation, hire date
•	Employment Details: Salary range ₹550,000-₹1,200,000, Active/Inactive status
•	Departments: Engineering, HR, Marketing, Finance, Sales with hierarchical structure
2. Attendance Tracking
•	320 Daily Records: Comprehensive attendance tracking
•	Time Management: Check-in/out (09:00-17:30), 8.5-hour standard workday
•	Status Tracking: Present/Absent/Late with real-time updates
•	Department-wise Organization: Organized by department for easy monitoring
3. Leave Management
•	60 Leave Requests: Complete leave application history
•	Leave Types: Annual, Sick, Personal leave (1-3 days typical duration)
•	Approval Workflow: HR Manager approval with Approved/Pending/Rejected status
•	Documentation: Detailed reasons and approval tracking
4. Task Management
•	100 Active Tasks: Comprehensive task tracking across departments
•	Assignment System: Manager-to-employee task delegation
•	Progress Tracking: 0-100% completion with High/Medium/Low priority
•	Deadline Management: Due dates with estimated hours tracking
5. Organizational Structure
•	5 Departments: Engineering (10), HR (5), Marketing (4), Finance (5), Sales (4)
•	Designation Hierarchy: From Specialist to Manager/Director levels
•	Reporting Structure: Manager relationships and team oversight
6. Compensation Management
•	Salary System: ₹550,000-₹1,200,000 annual range by role and department
•	Currency: Indian Rupees (INR) with proper formatting
•	Pay Scale: Role-based compensation structure
7. Communication System
•	Contact Management: Complete email and phone contact information
•	Notifications: Email and phone-based communication channels
8. API & Backend
•	RESTful API: Django REST Framework with 4 main endpoints
•	Database: MySQL with proper relationships and data integrity
•	Security: JWT authentication and role-based access control
9. Reporting & Analytics
•	Comprehensive Reports: Employee, attendance, leave, task analytics
•	Real-time Dashboard: Live metrics and performance indicators
•	Export Capabilities: PDF, Excel, CSV export options
10. User Experience
•	Responsive Design: Mobile and tablet optimized interface
•	Dashboard Overview: Real-time widgets and key metrics
•	Self-service Portal: Employee self-management capabilities
This EMS system provides a complete, integrated solution for managing the entire employee lifecycle with comprehensive tracking across attendance, leave, tasks, and performance across all organizational departments.
EMS Project Technology Stack & Build Information
Backend Technologies
•	Framework: Django REST Framework (Python-based)
•	Database: MySQL with Django ORM
•	Authentication: JWT (JSON Web Tokens)
•	API: RESTful API endpoints
•	Models: Django models for Employee, Attendance, Leave, Tasks
Frontend Technologies
•	Framework: React with TypeScript
•	Styling: Tailwind CSS for responsive design
•	Build Tool: Vite for development and production builds
•	State Management: React Context API
•	Routing: React Router for navigation
Development Tools
•	Package Manager: npm (Node Package Manager)
•	Linting: ESLint for code quality
•	Type Checking: TypeScript compiler
•	CSS Processing: PostCSS with Tailwind CSS
Database & Storage
•	Primary Database: MySQL
•	ORM: Django ORM for database operations
•	Migration System: Django migrations for schema changes
API & Integration
•	Backend API: Django REST Framework endpoints
•	Frontend Integration: Axios for API calls
•	Authentication: JWT tokens for secure access
Build & Deployment
•	Frontend Build: Vite build system
•	Backend: Django development server
•	Database Setup: MySQL configuration scripts
•	Environment: Python virtual environment
Key Configuration Files
•	Backend: requirements.txt, settings.py, manage.py
•	Frontend: package.json, vite.config.ts, tailwind.config.js
•	Database: MySQL setup scripts and configuration
This project uses a modern full-stack architecture with Django REST API backend and React frontend, deployed with MySQL database and built using industry-standard development tools.

>>>>>>> 31590692b29e30436c7efed73dcffe7a788105b4
