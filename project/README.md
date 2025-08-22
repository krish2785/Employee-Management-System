# Employee Management System (EMS)

A comprehensive Employee Management System built with React frontend and designed to integrate with Django backend. This system provides complete HR management capabilities including employee management, attendance tracking, leave management, task assignment, and performance analytics.

## 🚀 Features

### Frontend (React + Tailwind CSS)
- **Authentication System**: Login with admin/employee roles
- **Dashboard**: Real-time statistics and activity feeds
- **Employee Management**: Add, edit, view employee profiles (Admin only)
- **Attendance Management**: Track check-in/out, view attendance records
- **Leave Management**: Apply for leave, approve/reject requests
- **Task Management**: Assign tasks, track progress, update status
- **Reports & Analytics**: Generate comprehensive reports (Admin only)
- **Chatbot Integration**: HR assistant for common queries
- **Profile Management**: User profiles with settings and preferences
- **Responsive Design**: Mobile-first design with modern UI

### Backend Requirements (Django + MySQL)
The frontend is designed to integrate with a Django backend with the following structure:

#### Django Apps:
1. **employees** - Employee management, profiles, departments
2. **attendance** - Check-in/out tracking, working hours
3. **leave** - Leave applications, approvals, balance tracking
4. **tasks** - Task assignment, progress tracking, performance
5. **chatbot** - Dialogflow webhook integration
6. **reports** - Analytics and report generation

#### API Endpoints:
```
/api/employees/          - Employee CRUD operations
/api/attendance/         - Attendance management
/api/leave/             - Leave management
/api/tasks/             - Task management
/api/reports/           - Report generation
/chatbot/webhook/       - Dialogflow webhook
```

## 🛠️ Setup Instructions

### Frontend Setup (React)
1. **Clone and Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Login Credentials**:
   - **Admin**: username: `admin`, password: `admin123`
   - **Employee**: username: `emp001`, password: `emp123`

### Backend Setup (Django + MySQL)
1. **Create Virtual Environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install django djangorestframework django-cors-headers mysqlclient python-decouple
   ```

3. **Database Configuration** (settings.py):
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.mysql',
           'NAME': 'employee_management',
           'USER': 'your_username',
           'PASSWORD': 'your_password',
           'HOST': 'localhost',
           'PORT': '3306',
       }
   }
   ```

4. **Create Django Project**:
   ```bash
   django-admin startproject ems_backend
   cd ems_backend
   python manage.py startapp employees
   python manage.py startapp attendance
   python manage.py startapp leave
   python manage.py startapp tasks
   python manage.py startapp chatbot
   ```

5. **Run Migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser
   ```

6. **Start Django Server**:
   ```bash
   python manage.py runserver 8000
   ```

### Database Schema (MySQL)
```sql
-- Core tables needed
CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(20) UNIQUE,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    department VARCHAR(50),
    designation VARCHAR(50),
    hire_date DATE,
    status ENUM('Active', 'Inactive'),
    phone VARCHAR(20),
    salary DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(20),
    date DATE,
    check_in TIME,
    check_out TIME,
    hours DECIMAL(4,2),
    status ENUM('Present', 'Absent', 'Late', 'Half Day'),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

CREATE TABLE leave_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(20),
    leave_type ENUM('Annual Leave', 'Sick Leave', 'Personal Leave', 'Emergency Leave'),
    start_date DATE,
    end_date DATE,
    days INT,
    reason TEXT,
    status ENUM('Pending', 'Approved', 'Rejected'),
    applied_date DATE,
    approved_by VARCHAR(20),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

CREATE TABLE tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200),
    description TEXT,
    assigned_to VARCHAR(20),
    assigned_by VARCHAR(20),
    assigned_date DATE,
    due_date DATE,
    priority ENUM('High', 'Medium', 'Low'),
    status ENUM('Not Started', 'In Progress', 'Completed', 'On Hold'),
    progress INT DEFAULT 0,
    department VARCHAR(50),
    FOREIGN KEY (assigned_to) REFERENCES employees(employee_id)
);
```

## 🤖 Dialogflow Integration

### Setup Dialogflow Agent:
1. Create a new Dialogflow project
2. Create intents for common HR queries:
   - Leave balance inquiry
   - Attendance status
   - Apply for leave
   - Task status
   - Salary information

### Sample Intents:
```json
{
  "displayName": "leave.balance",
  "trainingPhrases": [
    "What's my leave balance?",
    "How many leaves do I have?",
    "Show me my remaining leaves"
  ],
  "webhookState": "WEBHOOK_STATE_ENABLED"
}
```

### Webhook Setup:
1. **Django Webhook View**:
   ```python
   from django.http import JsonResponse
   from django.views.decorators.csrf import csrf_exempt
   import json

   @csrf_exempt
   def dialogflow_webhook(request):
       if request.method == 'POST':
           req = json.loads(request.body)
           intent_name = req.get('queryResult', {}).get('intent', {}).get('displayName')
           
           if intent_name == 'leave.balance':
               # Query employee leave balance
               response_text = "Your leave balance: Annual: 15 days, Sick: 10 days"
           
           return JsonResponse({
               'fulfillmentText': response_text
           })
   ```

2. **ngrok for Local Testing**:
   ```bash
   npm install -g ngrok
   ngrok http 8000
   ```
   Use the ngrok URL as your webhook URL in Dialogflow.

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify):
1. **Build for Production**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**:
   ```bash
   npm install -g vercel
   vercel --prod
   ```

### Backend Deployment (Heroku/AWS):
1. **Heroku Deployment**:
   ```bash
   # Create Procfile
   echo "web: gunicorn ems_backend.wsgi" > Procfile
   
   # Install gunicorn
   pip install gunicorn
   
   # Create requirements.txt
   pip freeze > requirements.txt
   
   # Deploy to Heroku
   heroku create your-app-name
   heroku addons:create cleardb:ignite
   git push heroku main
   ```

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   └── Login.tsx
│   ├── Layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   └── ProtectedRoute.tsx
├── context/
│   └── AuthContext.tsx
├── data/
│   └── mockData.ts
├── pages/
│   ├── Dashboard.tsx
│   ├── Employees.tsx
│   ├── Attendance.tsx
│   ├── Leave.tsx
│   ├── Tasks.tsx
│   ├── Reports.tsx
│   └── Chatbot.tsx
└── App.tsx
```

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (Admin/Employee)
- Protected routes and API endpoints
- CORS configuration for cross-origin requests
- Input validation and sanitization
- Session management with auto-logout

## 📱 Mobile Responsiveness

The application is fully responsive with:
- Mobile-first design approach
- Collapsible sidebar navigation
- Touch-friendly interface elements
- Optimized layouts for tablets and phones
- Progressive Web App (PWA) capabilities

## 🧪 Testing

### Frontend Testing:
```bash
npm run test
```

### Backend Testing:
```bash
python manage.py test
```

## 📊 Performance Features

- Lazy loading of components
- Optimized bundle size
- Caching strategies
- Database query optimization
- CDN integration for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 💬 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Contact the development team

---

**Note**: This frontend is designed to work with a Django backend. The mock data provided allows for development and testing without a backend connection. For production use, implement the corresponding Django models and API endpoints as described in this documentation.