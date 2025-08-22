#!/usr/bin/env python3
"""
Quick MySQL Configuration Script
This script will help you set up MySQL credentials for Django.
"""

import os

def configure_mysql():
    print("🔧 MySQL Configuration for EMS Backend")
    print("=" * 50)
    
    # Get MySQL credentials
    password = input("Enter your MySQL root password: ").strip()
    
    # Create mysql_config.py
    config_content = f'''# MySQL Configuration for EMS Backend
# This file contains your MySQL database credentials

MYSQL_CONFIG = {{
    'USER': 'root',
    'PASSWORD': '{password}',
    'HOST': 'localhost',
    'PORT': '3306',
    'NAME': 'ems_db',
}}
'''
    
    with open('mysql_config.py', 'w') as f:
        f.write(config_content)
    
    print("✅ MySQL configuration saved to mysql_config.py")
    print("🔍 Now testing connection...")
    
    # Test connection
    try:
        import mysql.connector
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password=password,
            port=3306
        )
        
        if connection.is_connected():
            print("✅ Successfully connected to MySQL server!")
            
            cursor = connection.cursor()
            
            # Create database if it doesn't exist
            cursor.execute("CREATE DATABASE IF NOT EXISTS ems_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print("✅ Database 'ems_db' created successfully!")
            
            # Show databases
            cursor.execute("SHOW DATABASES")
            databases = cursor.fetchall()
            print("\n📋 Available databases:")
            for db in databases:
                print(f"   - {db[0]}")
            
            cursor.close()
            connection.close()
            
            print("\n🎉 MySQL setup completed successfully!")
            print("\n📝 Next steps:")
            print("1. Run: python manage.py makemigrations")
            print("2. Run: python manage.py migrate")
            print("3. Run: python manage.py populate_data")
            print("4. Run: python manage.py runserver")
            
        else:
            print("❌ Failed to connect to MySQL")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n🔧 Please check:")
        print("1. MySQL server is running")
        print("2. Password is correct")
        print("3. MySQL is accessible on localhost:3306")

if __name__ == "__main__":
    configure_mysql()
