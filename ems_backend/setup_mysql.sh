#!/bin/bash

echo "========================================"
echo "    EMS Backend MySQL Setup Script"
echo "========================================"
echo

# Check if MySQL is running
if systemctl is-active --quiet mysql || systemctl is-active --quiet mysqld; then
    echo "✅ MySQL service is running"
else
    echo "❌ MySQL service is not running"
    echo "Please start MySQL service first:"
    echo "  Ubuntu/Debian: sudo systemctl start mysql"
    echo "  CentOS/RHEL: sudo systemctl start mysqld"
    echo "  macOS: brew services start mysql"
    exit 1
fi

echo
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo
echo "Setting up MySQL database..."
python3 setup_mysql.py

echo
echo "Running Django migrations..."
python3 manage.py makemigrations
python3 manage.py migrate

echo
echo "Populating database with sample data..."
python3 manage.py populate_data

echo
echo "========================================"
echo "    Setup Complete!"
echo "========================================"
echo
echo "You can now start the server with:"
echo "python3 manage.py runserver"
echo
echo "Access the application at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000/api/"
echo "- Admin Panel: http://localhost:8000/admin/"
echo
echo "Default admin credentials:"
echo "- Username: admin"
echo "- Password: admin123"
echo
