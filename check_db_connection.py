import mysql.connector

try:
    # Database connection parameters
    config = {
        'user': 'root',
        'password': 'krishna27',
        'host': 'localhost',
        'database': 'ems_db'
    }
    
    # Try to connect to the database
    print("Attempting to connect to the database...")
    connection = mysql.connector.connect(**config)
    
    if connection.is_connected():
        print("Successfully connected to the database!")
        
        # Get database info
        cursor = connection.cursor()
        cursor.execute("SELECT DATABASE();")
        db_info = cursor.fetchone()
        print(f"Connected to database: {db_info[0]}")
        
        # List all tables
        cursor.execute("SHOW TABLES;")
        tables = cursor.fetchall()
        print("\nTables in the database:")
        for table in tables:
            print(f"- {table[0]}")
        
        # Check if employee table exists
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = 'ems_db' 
            AND table_name = 'ems_api_employee'
        """)
        
        if cursor.fetchone()[0] == 1:
            print("\nEmployee table found!")
            cursor.execute("SELECT COUNT(*) FROM ems_api_employee")
            count = cursor.fetchone()[0]
            print(f"Number of employees: {count}")
            
            # Show first 5 employees if any
            if count > 0:
                cursor.execute("""
                    SELECT id, employee_id, name, email, department 
                    FROM ems_api_employee 
                    LIMIT 5
                """)
                print("\nSample employee data:")
                for (id, emp_id, name, email, dept) in cursor:
                    print(f"ID: {id}, EmpID: {emp_id}, Name: {name}, Email: {email}, Department: {dept}")
        else:
            print("\nEmployee table not found!")
        
        cursor.close()
        connection.close()
        
except mysql.connector.Error as err:
    print(f"Error: {err}")
    
    if 'connection' in locals() and connection.is_connected():
        connection.close()
        print("MySQL connection is closed")
