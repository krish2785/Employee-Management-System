import { useState, useEffect } from 'react';
import { Users, Clock, Calendar, TrendingUp, RefreshCw, Bell, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { employeeAPI, attendanceAPI, leaveRequestAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [presentToday, setPresentToday] = useState<number>(0);
  const [myMonthlyHours, setMyMonthlyHours] = useState<number>(0);
  const [myMonthlyLeaves, setMyMonthlyLeaves] = useState<number>(0);
  const [pendingLeave, setPendingLeave] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Employee Added',
      message: 'Rajesh Kumar has been added to Engineering department',
      time: '2 minutes ago',
      type: 'success',
      read: false
    },
    {
      id: 2,
      title: 'Leave Request Pending',
      message: 'Priya Sharma has requested 3 days of leave',
      time: '15 minutes ago',
      type: 'warning',
      read: false
    },
    {
      id: 3,
      title: 'Attendance Alert',
      message: '5 employees are late today',
      time: '1 hour ago',
      type: 'info',
      read: true
    },
    {
      id: 4,
      title: 'Task Completed',
      message: 'Project Alpha has been completed successfully',
      time: '2 hours ago',
      type: 'success',
      read: true
    }
  ]);

  const addDebugInfo = (info: string) => {
    console.log(info);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  const fetchEmployees = async () => {
    try {
      addDebugInfo('Fetching employees...');
      const data = await employeeAPI.getAll();
      setEmployees(Array.isArray(data) ? data : []);
      addDebugInfo(`Successfully fetched ${Array.isArray(data) ? data.length : 0} employees`);
    } catch (err) {
      console.error('Error:', err);
      addDebugInfo(`Error: ${err}`);
      setError('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      addDebugInfo(`Fetching attendance for ${today} and pending leaves...`);
      const [attendance, pending] = await Promise.all([
        attendanceAPI.getByDate(today).catch(() => []),
        leaveRequestAPI.getPending().catch(() => []),
      ]);
      const presentCount = Array.isArray(attendance)
        ? attendance.filter((r: any) => r.status === 'Present').length
        : 0;
      setPresentToday(presentCount);
      setPendingLeave(Array.isArray(pending) ? pending.length : 0);
      addDebugInfo(`Present today: ${presentCount}, Pending leave: ${Array.isArray(pending) ? pending.length : 0}`);
    } catch (e) {
      addDebugInfo('Failed to fetch dashboard metrics');
    }
  };

  // Fetch metrics for the logged-in employee for the current month
  const fetchMyMonthlyMetrics = async () => {
    if (user?.role !== 'employee') return;
    try {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const inMonth = (d: string | Date | undefined) => {
        if (!d) return false;
        const dt = new Date(d);
        return dt >= start && dt <= end;
      };

      // Get employee record to access related endpoints if needed
      const empList = await employeeAPI.getByEmployeeId(user.employeeId).catch(() => []);
      const emp = Array.isArray(empList) ? empList[0] : empList;

      const [att, leaves] = await Promise.all([
        attendanceAPI.getByEmployee(user.employeeId).catch(() => []),
        emp?.id ? employeeAPI.getLeaveRequests(emp.id).catch(() => []) : Promise.resolve([]),
      ]);

      const monthHours = Array.isArray(att)
        ? att
            .filter((r: any) => inMonth(r.date))
            .reduce((sum: number, r: any) => sum + (Number(r.hours) || 0), 0)
        : 0;

      const monthLeaves = Array.isArray(leaves)
        ? leaves.filter((l: any) => inMonth(l.start_date || l.date || l.created_at)).length
        : 0;

      setMyMonthlyHours(monthHours);
      setMyMonthlyLeaves(monthLeaves);
      addDebugInfo(`My monthly hours: ${monthHours.toFixed(1)}, My monthly leaves: ${monthLeaves}`);
    } catch (e) {
      addDebugInfo('Failed to fetch my monthly metrics');
    }
  };

  useEffect(() => {
    addDebugInfo('Dashboard mounted');
    fetchEmployees();
    fetchMetrics();
    fetchMyMonthlyMetrics();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'warning':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case 'error':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
    }
  };

  return (
    <div className="p-6">
      {/* Header with Notification Icon */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Notifications</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Mark all read
                    </button>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-600'
                            }`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Debug Info */}
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h3 className="font-bold">Debug Info:</h3>
        <div className="text-sm max-h-32 overflow-y-auto">
          {debugInfo.map((info, index) => (
            <div key={index}>{info}</div>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-blue-100 p-4 rounded mb-4">
          Loading...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-100 p-4 rounded mb-4">
          Error: {error}
        </div>
      )}

      {/* Role-based Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total Employees - visible to admin and hr_manager */}
        {(user?.role === 'admin' || user?.role === 'hr_manager') && (
          <div className="bg-white p-4 rounded shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Present Today - visible to admin, hr_manager, team_lead */}
        {(user?.role === 'admin' || user?.role === 'hr_manager' || user?.role === 'team_lead') && (
          <div className="bg-white p-4 rounded shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">
                  {user?.role === 'team_lead' ? 'Team Present' : 'Present Today'}
                </p>
                <p className="text-2xl font-bold">{presentToday}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Pending Leave - visible to admin, hr_manager, team_lead */}
        {(user?.role === 'admin' || user?.role === 'hr_manager' || user?.role === 'team_lead') && (
          <div className="bg-white p-4 rounded shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">
                  {user?.role === 'team_lead' ? 'Team Leave Requests' : 'Pending Leave'}
                </p>
                <p className="text-2xl font-bold">{pendingLeave}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* My Stats - visible to employees */}
        {user?.role === 'employee' && (
          <>
            <div className="bg-white p-4 rounded shadow">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">My Attendance</p>
                  <p className="text-2xl font-bold">22/22</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Leaves Applied (This Month)</p>
                  <p className="text-2xl font-bold">{myMonthlyLeaves}</p>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Total Hours - visible to all */}
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">
                {user?.role === 'employee' ? 'My Hours' : 'Total Hours'}
              </p>
              <p className="text-2xl font-bold">{user?.role === 'employee' ? Number(myMonthlyHours).toFixed(1) : '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee List - hidden for employee role */}
      {(user?.role !== 'employee') && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-bold mb-4">Employees ({employees.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.slice(0, 6).map((emp) => (
              <div key={emp.id} className="border p-3 rounded">
                <p className="font-medium">{emp.name}</p>
                <p className="text-sm text-gray-600">{emp.department}</p>
                <p className="text-sm text-gray-600">{emp.employee_id}</p>
              </div>
            ))}
          </div>
          {employees.length > 6 && (
            <p className="text-sm text-gray-600 mt-2">
              Showing 6 of {employees.length} employees
            </p>
          )}
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-4">
        <button
          onClick={fetchEmployees}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default Dashboard;