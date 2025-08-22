#!/usr/bin/env python3
"""
MySQL Setup Script for EMS Backend
This script helps set up the MySQL database for the EMS project.
"""

import mysql.connector
from mysql.connector import Error
import os
import sys

def create_database():
    """Create the ems_db database if it doesn't exist."""
    try:
        # Get MySQL root password from user
        password = input("Enter MySQL root password (or press Enter if no password): ").strip()
        
        # Connect to MySQL server (without specifying database)
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password=password
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Create database if it doesn't exist
            cursor.execute("CREATE DATABASE IF NOT EXISTS ems_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print("✅ Database 'ems_db' created successfully or already exists")
            
            # Show databases
            cursor.execute("SHOW DATABASES")
            databases = cursor.fetchall()
            print("\n📋 Available databases:")
            for db in databases:
                print(f"   - {db[0]}")
            
            cursor.close()
            connection.close()
            print("\n✅ MySQL setup completed successfully!")
            
    except Error as e:
        print(f"❌ Error connecting to MySQL: {e}")
        print("\n🔧 Troubleshooting tips:")
        print("1. Make sure MySQL server is running")
        print("2. Verify MySQL is installed and accessible")
        print("3. Check if the root user password is correct")
        print("4. Try running: mysql -u root -p")
        return False
    
    return True

def test_connection():
    """Test connection to the ems_db database."""
    try:
        # Get MySQL root password from user
        password = input("Enter MySQL root password (or press Enter if no password): ").strip()
        
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password=password,
            database='ems_db'
        )
        
        if connection.is_connected():
            print("✅ Successfully connected to ems_db database")
            cursor = connection.cursor()
            
            # Test a simple query
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            print(f"📊 MySQL Version: {version[0]}")
            
            cursor.close()
            connection.close()
            return True
            
    except Error as e:
        print(f"❌ Error connecting to ems_db: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Setting up MySQL for EMS Backend...")
    print("=" * 50)
    
    # Create database
    if create_database():
        print("\n🔍 Testing database connection...")
        test_connection()
        
        print("\n📝 Next steps:")
        print("1. Run: python manage.py makemigrations")
        print("2. Run: python manage.py migrate")
        print("3. Run: python manage.py populate_data")
        print("4. Run: python manage.py runserver")
    else:
        print("\n❌ MySQL setup failed. Please check the error messages above.")
        sys.exit(1)
