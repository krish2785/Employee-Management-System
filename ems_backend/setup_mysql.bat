@echo off
echo ========================================
echo    EMS Backend MySQL Setup Script
echo ========================================
echo.

echo Checking if MySQL is running...
net start | findstr /i "MySQL" >nul
if %errorlevel% equ 0 (
    echo ✅ MySQL service is running
) else (
    echo ❌ MySQL service is not running
    echo Please start MySQL service first
    echo You can do this from Services (services.msc)
    echo Or run: net start MySQL
    pause
    exit /b 1
)

echo.
echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Setting up MySQL database...
python setup_mysql.py

echo.
echo Running Django migrations...
python manage.py makemigrations
python manage.py migrate

echo.
echo Populating database with sample data...
python manage.py populate_data

echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo You can now start the server with:
echo python manage.py runserver
echo.
echo Access the application at:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8000/api/
echo - Admin Panel: http://localhost:8000/admin/
echo.
echo Default admin credentials:
echo - Username: admin
echo - Password: admin123
echo.
pause
