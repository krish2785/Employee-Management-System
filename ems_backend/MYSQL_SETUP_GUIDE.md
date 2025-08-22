# MySQL Setup Guide for EMS Backend

This guide will help you set up MySQL for the EMS backend project.

## Prerequisites

- MySQL Server 8.0 or higher installed
- Python 3.8 or higher
- pip package manager

## Quick Setup (Automated)

### Windows Users
1. Make sure MySQL service is running
2. Double-click `setup_mysql.bat`
3. Follow the prompts

### Linux/Mac Users
1. Make sure MySQL service is running
2. Run: `chmod +x setup_mysql.sh`
3. Run: `./setup_mysql.sh`

## Manual Setup

### 1. Install MySQL Server

#### Windows
1. Download MySQL from [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)
2. Run the installer
3. Choose "Developer Default" or "Server only"
4. Set root password (or leave blank for development)
5. Complete installation

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

#### CentOS/RHEL
```bash
sudo yum install mysql-server
sudo systemctl start mysqld
sudo mysql_secure_installation
```

#### macOS
```bash
brew install mysql
brew services start mysql
```

### 2. Start MySQL Service

#### Windows
- Open Services (services.msc)
- Find "MySQL" service
- Right-click and select "Start"

#### Linux
```bash
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### macOS
```bash
brew services start mysql
```

### 3. Create Database

Connect to MySQL and create the database:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE ems_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
EXIT;
```

### 4. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 5. Run Setup Script

```bash
python setup_mysql.py
```

### 6. Run Django Commands

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py populate_data
```

## Configuration

The Django settings are configured to use MySQL with these default values:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'ems_db',
        'USER': 'root',
        'PASSWORD': '',  # Change this if you set a password
        'HOST': 'localhost',
        'PORT': '3306',
        'OPTIONS': {
            'charset': 'utf8mb4',
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}
```

## Troubleshooting

### Common Issues

#### 1. "Access denied for user 'root'@'localhost'"
- Make sure MySQL is running
- Check if root password is set
- Try: `mysql -u root -p` and enter password

#### 2. "Can't connect to MySQL server"
- Check if MySQL service is running
- Verify port 3306 is not blocked
- Check firewall settings

#### 3. "mysqlclient not found"
- Install MySQL client libraries:
  - Windows: Install MySQL Connector/C
  - Linux: `sudo apt-get install python3-dev default-libmysqlclient-dev build-essential`
  - macOS: `brew install mysql-connector-c`

#### 4. "Authentication plugin 'caching_sha2_password' cannot be loaded"
- This is a MySQL 8.0+ issue
- Create a user with older authentication:
```sql
CREATE USER 'ems_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
GRANT ALL PRIVILEGES ON ems_db.* TO 'ems_user'@'localhost';
FLUSH PRIVILEGES;
```
- Update Django settings to use this user

#### 5. "Unknown database 'ems_db'"
- Run the setup script: `python setup_mysql.py`
- Or manually create: `CREATE DATABASE ems_db;`

### Reset Database

If you need to start fresh:

```bash
mysql -u root -p
```

```sql
DROP DATABASE IF EXISTS ems_db;
CREATE DATABASE ems_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

Then run:
```bash
python manage.py migrate
python manage.py populate_data
```

## Testing Connection

Test your MySQL connection:

```bash
python setup_mysql.py
```

This will:
1. Test connection to MySQL server
2. Create the `ems_db` database if it doesn't exist
3. Test connection to the database
4. Show available databases

## Production Considerations

For production use:

1. **Security**:
   - Use strong passwords
   - Create dedicated database user (not root)
   - Limit user privileges
   - Use SSL connections

2. **Performance**:
   - Configure MySQL buffer pool size
   - Enable query cache
   - Optimize table indexes

3. **Backup**:
   - Set up regular backups
   - Test restore procedures
   - Monitor disk space

## Support

If you encounter issues:

1. Check MySQL error logs
2. Verify Django settings
3. Test MySQL connection manually
4. Check system resources
5. Review Django and MySQL documentation

## Useful Commands

```bash
# Check MySQL status
sudo systemctl status mysql

# Connect to MySQL
mysql -u root -p

# Show databases
SHOW DATABASES;

# Show users
SELECT User, Host FROM mysql.user;

# Check MySQL version
SELECT VERSION();
```
