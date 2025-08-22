import React, { useState, useEffect } from 'react';
import { Download, Calendar, Users, Clock, BarChart3, FileText } from 'lucide-react';
import { employeeAPI, attendanceAPI, leaveRequestAPI, taskAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Employee {
  id: number;
  employee_id: string;
  name: string;
  department: string;
  designation: string;
  status: string;
  joining_date: string;
  salary?: number;
}

interface AttendanceRecord {
  id: number;
  date: string;
  employee: number;
  employee_name: string;
  department: string;
  check_in: string;
  check_out: string;
  hours: number;
  status: string;
}

interface LeaveRequest {
  id: number;
  employee: number;
  employee_name: string;
  department: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  status: string;
  applied_date: string;
}

interface Task {
  id: number;
  title: string;
  assigned_to: number;
  assigned_to_name: string;
  department: string;
  priority: string;
  status: string;
  progress: number;
  due_date: string;
}

const Reports = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Fetch data on component mount
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching data from APIs...');
      
      const [empData, attData, leaveData, taskData] = await Promise.all([
        employeeAPI.getAll().catch(err => {
          console.error('Employee API error:', err);
          return [];
        }),
        attendanceAPI.getAll().catch(err => {
          console.error('Attendance API error:', err);
          return [];
        }),
        leaveRequestAPI.getAll().catch(err => {
          console.error('Leave Request API error:', err);
          return [];
        }),
        taskAPI.getAll().catch(err => {
          console.error('Task API error:', err);
          return [];
        })
      ]);
      
      console.log('API responses:', { empData, attData, leaveData, taskData });
      
      // Handle different response structures
      setEmployees(Array.isArray(empData) ? empData : empData?.data || empData?.results || []);

    // Normalize attendance records: support legacy keys and format times to HH:MM
    const rawAttendance = Array.isArray(attData) ? attData : attData?.data || attData?.results || [];
    const normalizeTime = (t: any) => {
      if (!t) return '';
      // Accept formats like '08:30:00', '8:30', Date string, or object
      try {
        // If already HH:MM:SS or HH:MM, return HH:MM
        if (typeof t === 'string') {
          const parts = t.split(':');
          if (parts.length >= 2) {
            const hh = parts[0].padStart(2, '0');
            const mm = parts[1].padStart(2, '0');
            return `${hh}:${mm}`;
          }
        }
        const d = new Date(`1970-01-01T${t}`);
        if (!isNaN(d.getTime())) {
          const hh = String(d.getHours()).padStart(2, '0');
          const mm = String(d.getMinutes()).padStart(2, '0');
          return `${hh}:${mm}`;
        }
      } catch {}
      return '';
    };
    const addMinutes = (time: string, minutes: number) => {
      const [h, m] = time.split(':').map(Number);
      const total = h * 60 + m + minutes;
      const wrapped = ((total % (24 * 60)) + (24 * 60)) % (24 * 60);
      const hh = String(Math.floor(wrapped / 60)).padStart(2, '0');
      const mm = String(wrapped % 60).padStart(2, '0');
      return `${hh}:${mm}`;
    };
    const normalizedAttendance = (rawAttendance || []).map((r: any) => {
      const hoursNum = Number(r.hours) || 0;
      let ci = normalizeTime(
        r.check_in ?? r.check_in_time ?? r.checkIn ?? r.check_in_at ??
        r.in_time ?? r.time_in ?? r.clock_in ?? r.start_time
      );
      let co = normalizeTime(
        r.check_out ?? r.check_out_time ?? r.checkOut ?? r.check_out_at ??
        r.out_time ?? r.time_out ?? r.clock_out ?? r.end_time
      );
      if (hoursNum > 0) {
        const minutes = Math.round(hoursNum * 60);
        if (ci && !co) co = addMinutes(ci, minutes);
        else if (!ci && co) ci = addMinutes(co, -minutes);
        else if (!ci && !co) {
          ci = '09:00';
          co = addMinutes(ci, minutes);
        }
      }
      return {
        ...r,
        check_in: ci,
        check_out: co,
        hours: hoursNum,
      };
    });
    setAttendanceRecords(normalizedAttendance);

      setLeaveRequests(Array.isArray(leaveData) ? leaveData : leaveData?.data || leaveData?.results || []);
      setTasks(Array.isArray(taskData) ? taskData : taskData?.data || taskData?.results || []);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to connect to backend server. Please ensure Django backend is running on http://localhost:8000. Error: ${errorMessage}`);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const getEmployeeStats = () => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.status === 'Active').length;
    const inactiveEmployees = totalEmployees - activeEmployees;
    
    const departmentStats = employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgSalary = employees
      .filter(emp => emp.salary)
      .reduce((sum, emp) => sum + (emp.salary || 0), 0) / 
      employees.filter(emp => emp.salary).length;

    return {
      total: totalEmployees,
      active: activeEmployees,
      inactive: inactiveEmployees,
      departments: departmentStats,
      avgSalary: avgSalary || 0
    };
  };

  const getAttendanceStats = () => {
    // Filter records by selected date range
    const records = attendanceRecords.filter(att => att.date >= dateRange.start && att.date <= dateRange.end);
    const totalRecords = records.length;
    const presentCount = records.filter(att => att.status === 'Present').length;
    const absentCount = records.filter(att => att.status === 'Absent').length;
    const lateCount = records.filter(att => att.status === 'Late').length;
    const halfDayCount = records.filter(att => att.status === 'Half Day').length;

    // Hours may come as string from backend (DecimalField). Coerce to number safely.
    const totalHours = records.reduce((sum, att) => sum + (Number(att.hours) || 0), 0);
    const avgHoursPerDay = totalRecords > 0 ? totalHours / totalRecords : 0;

    return {
      total: totalRecords,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      halfDay: halfDayCount,
      totalHours,
      avgHoursPerDay
    };
  };

  const getLeaveStats = () => {
    const totalRequests = leaveRequests.length;
    const approvedRequests = leaveRequests.filter(leave => leave.status === 'Approved').length;
    const pendingRequests = leaveRequests.filter(leave => leave.status === 'Pending').length;
    const rejectedRequests = leaveRequests.filter(leave => leave.status === 'Rejected').length;

    const leaveTypeStats = leaveRequests.reduce((acc, leave) => {
      acc[leave.leave_type] = (acc[leave.leave_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalDays = leaveRequests.reduce((sum, leave) => sum + leave.days, 0);

    return {
      total: totalRequests,
      approved: approvedRequests,
      pending: pendingRequests,
      rejected: rejectedRequests,
      types: leaveTypeStats,
      totalDays
    };
  };

  const getTaskStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
    const notStartedTasks = tasks.filter(task => task.status === 'Not Started').length;
    const onHoldTasks = tasks.filter(task => task.status === 'On Hold').length;

    const priorityStats = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgProgress = tasks.reduce((sum, task) => sum + task.progress, 0) / totalTasks;

    return {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      notStarted: notStartedTasks,
      onHold: onHoldTasks,
      priorities: priorityStats,
      avgProgress: avgProgress || 0
    };
  };

  const exportReport = (type: string) => {
    // Generate CSV data based on report type
    let csvContent = '';
    let filename = '';
    
    switch (type) {
      case 'overview':
        csvContent = generateOverviewCSV();
        filename = 'overview_report.csv';
        break;
      case 'employees':
        csvContent = generateEmployeesCSV();
        filename = 'employees_report.csv';
        break;
      case 'attendance':
        csvContent = generateAttendanceCSV();
        filename = 'attendance_report.csv';
        break;
      case 'leave':
        csvContent = generateLeaveCSV();
        filename = 'leave_report.csv';
        break;
      case 'tasks':
        csvContent = generateTasksCSV();
        filename = 'tasks_report.csv';
        break;
      default:
        alert('Invalid report type');
        return;
    }
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateOverviewCSV = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Employees', employeeStats.total],
      ['Active Employees', employeeStats.active],
      ['Inactive Employees', employeeStats.inactive],
      ['Attendance Rate (%)', attendanceStats.total > 0 ? Math.round((attendanceStats.present / attendanceStats.total) * 100) : 0],
      ['Total Leave Requests', leaveStats.total],
      ['Approved Leave Requests', leaveStats.approved],
      ['Task Completion Rate (%)', taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0]
    ];
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateEmployeesCSV = () => {
            const headers = ['ID', 'Name', 'Department', 'Designation', 'Status', 'Joining Date', 'Salary'];
    const rows = employees.map(emp => [
      emp.employee_id,
      emp.name,
      emp.department,
      emp.designation,
      emp.status,
      emp.joining_date,
      emp.salary || 'N/A'
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateAttendanceCSV = () => {
    const headers = ['Employee', 'Date', 'Check In', 'Check Out', 'Hours', 'Status'];
    const rows = attendanceRecords.map(att => [
      att.employee_name,
      att.date,
      att.check_in,
      att.check_out || 'N/A',
      att.hours,
      att.status
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateLeaveCSV = () => {
    const headers = ['Employee', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Applied Date'];
    const rows = leaveRequests.map(leave => [
      leave.employee_name,
      leave.leave_type,
      leave.start_date,
      leave.end_date,
      leave.days,
      leave.status,
      leave.applied_date
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateTasksCSV = () => {
    const headers = ['Title', 'Assigned To', 'Department', 'Priority', 'Status', 'Progress (%)', 'Due Date'];
    const rows = tasks.map(task => [
      task.title,
      task.assigned_to_name,
      task.department,
      task.priority,
      task.status,
      task.progress,
      task.due_date
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  if (!user) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const employeeStats = getEmployeeStats();
  const attendanceStats = getAttendanceStats();
  const leaveStats = getLeaveStats();
  const taskStats = getTaskStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your organization</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex space-x-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-500 self-center">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => exportReport(selectedReport)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
          >
            <Download size={20} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Report Type Selector */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedReport('overview')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              selectedReport === 'overview' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 size={20} />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setSelectedReport('employees')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              selectedReport === 'employees' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users size={20} />
            <span>Employees</span>
          </button>
          <button
            onClick={() => setSelectedReport('attendance')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              selectedReport === 'attendance' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Clock size={20} />
            <span>Attendance</span>
          </button>
          <button
            onClick={() => setSelectedReport('leave')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              selectedReport === 'leave' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar size={20} />
            <span>Leave</span>
          </button>
          <button
            onClick={() => setSelectedReport('tasks')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              selectedReport === 'tasks' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText size={20} />
            <span>Tasks</span>
          </button>
        </div>
      </div>

      {/* Overview Report */}
      {selectedReport === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Employees</p>
                  <p className="text-3xl font-bold text-gray-900">{employeeStats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600">
                  {employeeStats.active} Active
                </span>
                <span className="text-sm text-gray-400 mx-2">•</span>
                <span className="text-sm text-red-600">
                  {employeeStats.inactive} Inactive
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {attendanceStats.total > 0 
                      ? Math.round((attendanceStats.present / attendanceStats.total) * 100)
                      : 0}%
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-600">
                  {attendanceStats.total} Total Records
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Leave Requests</p>
                  <p className="text-3xl font-bold text-gray-900">{leaveStats.total}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600">
                  {leaveStats.approved} Approved
                </span>
                <span className="text-sm text-gray-400 mx-2">•</span>
                <span className="text-sm text-yellow-600">
                  {leaveStats.pending} Pending
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Task Completion</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {taskStats.total > 0 
                      ? Math.round((taskStats.completed / taskStats.total) * 100)
                      : 0}%
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-600">
                  {taskStats.total} Total Tasks
                </span>
              </div>
            </div>
          </div>

          {/* Department Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
              <div className="space-y-3">
                {Object.entries(employeeStats.departments).map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{dept}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(count / employeeStats.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(taskStats.completed / taskStats.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{taskStats.completed}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(taskStats.inProgress / taskStats.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{taskStats.inProgress}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Not Started</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gray-600 h-2 rounded-full" 
                        style={{ width: `${(taskStats.notStarted / taskStats.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{taskStats.notStarted}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Report */}
      {selectedReport === 'employees' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{employeeStats.total}</p>
                <p className="text-sm text-gray-600">Total Employees</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{employeeStats.active}</p>
                <p className="text-sm text-gray-600">Active Employees</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-600">
                  ${employeeStats.avgSalary.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Average Salary</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(employeeStats.departments).map(([dept, count]) => (
                <div key={dept} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{dept}</span>
                  <span className="text-sm text-gray-600">{count} employees</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Attendance Report */}
      {selectedReport === 'attendance' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{attendanceStats.present}</p>
                <p className="text-sm text-gray-600">Present</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{attendanceStats.absent}</p>
                <p className="text-sm text-gray-600">Absent</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{attendanceStats.late}</p>
                <p className="text-sm text-gray-600">Late</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{attendanceStats.halfDay}</p>
                <p className="text-sm text-gray-600">Half Day</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Working Hours Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{Number(attendanceStats.totalHours).toFixed(1)}</p>
                <p className="text-sm text-gray-600">Total Hours</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{Number(attendanceStats.avgHoursPerDay).toFixed(1)}</p>
                <p className="text-sm text-gray-600">Average Hours/Day</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
              <span className="text-sm text-gray-600">{attendanceStats.total} records in range</span>
            </div>
            {attendanceStats.total === 0 ? (
              <div className="p-6 text-center text-gray-600 bg-gray-50 rounded-lg">
                No attendance records found for the selected date range.
              </div>
            ) : (
              <div className="overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceRecords
                      .filter(att => att.date >= dateRange.start && att.date <= dateRange.end)
                      .slice(0, 200)
                      .map(att => (
                        <tr key={att.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{att.employee_name}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{att.date}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{att.check_in || '—'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{att.check_out || '—'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{att.hours}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <span className={`${
                              att.status === 'Present' ? 'text-green-600' :
                              att.status === 'Absent' ? 'text-red-600' :
                              att.status === 'Late' ? 'text-yellow-600' : 'text-orange-600'
                            }`}>
                              {att.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leave Report */}
      {selectedReport === 'leave' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Request Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{leaveStats.total}</p>
                <p className="text-sm text-gray-600">Total Requests</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{leaveStats.approved}</p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{leaveStats.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{leaveStats.rejected}</p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Type Distribution</h3>
            <div className="space-y-3">
              {Object.entries(leaveStats.types).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{type}</span>
                  <span className="text-sm text-gray-600">{count} requests</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Leave Days</h3>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{leaveStats.totalDays}</p>
              <p className="text-sm text-gray-600">Total Days Requested</p>
            </div>
          </div>
        </div>
      )}

      {/* Task Report */}
      {selectedReport === 'tasks' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{taskStats.completed}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{taskStats.inProgress}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-600">{taskStats.notStarted}</p>
                <p className="text-sm text-gray-600">Not Started</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{taskStats.onHold}</p>
                <p className="text-sm text-gray-600">On Hold</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
            <div className="space-y-3">
              {Object.entries(taskStats.priorities).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{priority} Priority</span>
                  <span className="text-sm text-gray-600">{count} tasks</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Overview</h3>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{taskStats.avgProgress.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Average Progress</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;