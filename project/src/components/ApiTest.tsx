import React, { useState, useEffect } from 'react';
import { employeeAPI, attendanceAPI, leaveRequestAPI, taskAPI } from '../services/api';

const ApiTest = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch all data from different endpoints
      const [empData, attData, leaveData, taskData] = await Promise.all([
        employeeAPI.getAll(),
        attendanceAPI.getAll(),
        leaveRequestAPI.getAll(),
        taskAPI.getAll()
      ]);
      
      setEmployees(empData);
      setAttendance(attData);
      setLeaveRequests(leaveData);
      setTasks(taskData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading data from Django backend...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">API Connection Test</h2>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employees */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employees ({employees.length})</h3>
          <div className="space-y-2">
            {employees.slice(0, 3).map((emp: any) => (
              <div key={emp.id} className="text-sm">
                <span className="font-medium">{emp.name}</span> - {emp.department}
              </div>
            ))}
            {employees.length > 3 && (
              <div className="text-sm text-gray-500">...and {employees.length - 3} more</div>
            )}
          </div>
        </div>

        {/* Attendance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Records ({attendance.length})</h3>
          <div className="space-y-2">
            {attendance.slice(0, 3).map((att: any) => (
              <div key={att.id} className="text-sm">
                <span className="font-medium">{att.employee_name}</span> - {att.date} ({att.status})
              </div>
            ))}
            {attendance.length > 3 && (
              <div className="text-sm text-gray-500">...and {attendance.length - 3} more</div>
            )}
          </div>
        </div>

        {/* Leave Requests */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Requests ({leaveRequests.length})</h3>
          <div className="space-y-2">
            {leaveRequests.slice(0, 3).map((leave: any) => (
              <div key={leave.id} className="text-sm">
                <span className="font-medium">{leave.employee_name}</span> - {leave.leave_type} ({leave.status})
              </div>
            ))}
            {leaveRequests.length > 3 && (
              <div className="text-sm text-gray-500">...and {leaveRequests.length - 3} more</div>
            )}
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks ({tasks.length})</h3>
          <div className="space-y-2">
            {tasks.slice(0, 3).map((task: any) => (
              <div key={task.id} className="text-sm">
                <span className="font-medium">{task.title}</span> - {task.status}
              </div>
            ))}
            {tasks.length > 3 && (
              <div className="text-sm text-gray-500">...and {tasks.length - 3} more</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <strong className="font-bold">Success!</strong> Connected to Django backend successfully.
        <br />
        <span className="text-sm">Backend URL: http://localhost:8000/api/</span>
      </div>
    </div>
  );
};

export default ApiTest;
