# EMS Backend - Django REST API

This is the Django backend for the Employee Management System (EMS) frontend.

## Features

- **Employee Management**: CRUD operations for employee records
- **Attendance Tracking**: Record and manage employee attendance
- **Leave Management**: Handle leave requests and approvals
- **Task Management**: Assign and track employee tasks
- **RESTful API**: Full REST API with Django REST Framework
- **Admin Interface**: Django admin for data management

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Virtual environment (recommended)
- MySQL Server 8.0 or higher
- MySQL client libraries

## MySQL Setup

1. **Install MySQL Server** (if not already installed):
   - Windows: Download from [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)
   - Linux: `sudo apt-get install mysql-server` (Ubuntu/Debian)
   - macOS: `brew install mysql` (using Homebrew)

2. **Start MySQL Service**:
   - Windows: Start MySQL service from Services
   - Linux: `sudo systemctl start mysql`
   - macOS: `brew services start mysql`

3. **Create Database** (optional - the setup script will do this):
   ```sql
   CREATE DATABASE ems_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

## Setup

1. **Create Virtual Environment**:
   ```bash
   python -m venv django_env
   django_env\Scripts\activate  # Windows
   source django_env/bin/activate  # Linux/Mac
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Setup MySQL Database**:
   ```bash
   python setup_mysql.py
   ```

4. **Run Migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Populate Sample Data**:
   ```bash
   python manage.py populate_data
   ```

5. **Create Superuser** (optional):
   ```bash
   python manage.py createsuperuser
   ```

6. **Run Development Server**:
   ```bash
   python manage.py runserver
   ```

## API Endpoints

### Employees
- `GET /api/employees/` - List all employees
- `POST /api/employees/` - Create new employee
- `GET /api/employees/{id}/` - Get employee details
- `PUT /api/employees/{id}/` - Update employee
- `DELETE /api/employees/{id}/` - Delete employee
- `GET /api/employees/{id}/attendance/` - Get employee attendance
- `GET /api/employees/{id}/leave_requests/` - Get employee leave requests
- `GET /api/employees/{id}/tasks/` - Get employee tasks

### Attendance
- `GET /api/attendance/` - List all attendance records
- `POST /api/attendance/` - Create attendance record
- `GET /api/attendance/by_date/?date=YYYY-MM-DD` - Get attendance by date
- `GET /api/attendance/by_employee/?employee_id=EMP001` - Get attendance by employee

### Leave Requests
- `GET /api/leave-requests/` - List all leave requests
- `POST /api/leave-requests/` - Create leave request
- `GET /api/leave-requests/pending/` - Get pending requests
- `POST /api/leave-requests/{id}/approve/` - Approve leave request
- `POST /api/leave-requests/{id}/reject/` - Reject leave request

### Tasks
- `GET /api/tasks/` - List all tasks
- `POST /api/tasks/` - Create new task
- `GET /api/tasks/by_status/?status=In Progress` - Get tasks by status
- `GET /api/tasks/by_priority/?priority=High` - Get tasks by priority
- `POST /api/tasks/{id}/update_progress/` - Update task progress

## Admin Interface

Access the Django admin at `http://localhost:8000/admin/`

Default superuser credentials:
- Username: `admin`
- Password: `admin123`

## Database Models

### Employee
- Basic employee information (name, email, department, etc.)
- Salary and manager details
- Status tracking (Active/Inactive)

### AttendanceRecord
- Daily attendance tracking
- Check-in/check-out times
- Hours worked calculation
- Status (Present, Absent, Late, Half Day)

### LeaveRequest
- Leave application management
- Multiple leave types (Annual, Sick, Personal, Emergency)
- Approval workflow
- Date range and duration tracking

### Task
- Task assignment and tracking
- Priority and status management
- Progress tracking
- Department-based organization

## Authentication

The API uses Django's built-in authentication system:
- Session-based authentication
- Basic authentication support
- All endpoints require authentication (except admin)

## CORS Configuration

CORS is configured to allow cross-origin requests from the React frontend:
- `CORS_ALLOW_ALL_ORIGINS = True` (development only)
- `CORS_ALLOW_CREDENTIALS = True`

## Development

- **Database**: MySQL (configured for ems_db)
- **API Documentation**: Available through Django REST Framework browsable API
- **Testing**: Use Django's built-in testing framework
- **Environment**: Configure environment variables for production

## Production Considerations

- Change `DEBUG = False`
- Use environment variables for `SECRET_KEY`
- Configure proper database (PostgreSQL recommended)
- Set up proper CORS origins
- Use HTTPS
- Configure static file serving
- Set up logging
- Use production WSGI server (Gunicorn, uWSGI)
