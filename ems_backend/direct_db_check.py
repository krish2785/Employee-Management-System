import mysql.connector
from mysql_config import MYSQL_CONFIG

def check_employee_data():
    try:
        # Connect to MySQL database
        conn = mysql.connector.connect(
            host=MYSQL_CONFIG['HOST'],
            user=MYSQL_CONFIG['USER'],
            password=MYSQL_CONFIG['PASSWORD'],
            database=MYSQL_CONFIG['NAME']
        )
        
        cursor = conn.cursor(dictionary=True)
        
        # Execute query to get all employees
        cursor.execute("""
            SELECT id, employee_id, name, email, department, designation 
            FROM ems_api_employee
            ORDER BY id
        """)
        
        employees = cursor.fetchall()
        
        print("\n=== Employee Data ===")
        print("ID\tEmployee ID\tName\t\tEmail\t\tDepartment")
        print("-" * 80)
        
        for emp in employees:
            print(f"{emp['id']}\t{emp['employee_id']}\t\t{emp['name']}\t{emp['email']}\t{emp['department']}")
        
        cursor.close()
        conn.close()
        
        return employees
        
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

if __name__ == "__main__":
    check_employee_data()
