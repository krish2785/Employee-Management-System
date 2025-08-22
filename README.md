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
