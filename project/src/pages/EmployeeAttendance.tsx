import React, { useState, useEffect } from 'react';
import { Plus, Search, Clock, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { attendanceAPI, employeeAPI } from '../services/api';
import { formatDDMMYYYY } from '../utils/date';

interface AttendanceRecord {
  id: number;
  date: string;
  employee: number;
  employee_name: string;
  department: string;
  check_in: string;
  check_out: string;
  hours: number;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day';
}

const EmployeeAttendance = () => {
  const { user } = useAuth();
  const { state, dispatch } = useData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMarkAttendanceModal, setShowMarkAttendanceModal] = useState(false);
  const [timeError, setTimeError] = useState('');
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [employeePk, setEmployeePk] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Today's date
    check_in: '',
    check_out: '',
    hours: '',
    status: 'Present' as 'Present' | 'Absent' | 'Late' | 'Half Day'
  });

  // Calculate hours between check-in and check-out times
  const calculateHours = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) return 0;
    
    const [inHour, inMinute] = checkIn.split(':').map(Number);
    const [outHour, outMinute] = checkOut.split(':').map(Number);
    
    const inMinutes = inHour * 60 + inMinute;
    const outMinutes = outHour * 60 + outMinute;
    
    // Handle overnight shifts (check-out time is less than check-in time)
    let diffMinutes = outMinutes - inMinutes;
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60; // Add 24 hours
    }
    
    return Math.round((diffMinutes / 60) * 100) / 100; // Round to 2 decimal places
  };

  // Validate check-in and check-out times
  const validateTimes = (checkIn: string, checkOut: string): string => {
    if (!checkIn || !checkOut) return '';
    
    const [inHour, inMinute] = checkIn.split(':').map(Number);
    const [outHour, outMinute] = checkOut.split(':').map(Number);
    
    const inMinutes = inHour * 60 + inMinute;
    const outMinutes = outHour * 60 + outMinute;
    
    // Allow overnight shifts but check for reasonable duration
    let diffMinutes = outMinutes - inMinutes;
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60;
    }
    
    if (diffMinutes < 0) {
      return 'Check-out time cannot be before check-in time';
    }
    
    if (diffMinutes > 24 * 60) {
      return 'Working hours cannot exceed 24 hours';
    }
    
    return '';
  };

  // Update hours when check-in or check-out times change
  const updateHours = (checkIn: string, checkOut: string) => {
    const error = validateTimes(checkIn, checkOut);
    setTimeError(error);
    
    if (!error && checkIn && checkOut) {
      const calculatedHours = calculateHours(checkIn, checkOut);
      setFormData(prev => ({ ...prev, hours: calculatedHours.toString() }));
    }
  };

  // Check if today's attendance is already marked
  const checkTodayAttendance = () => {
    const todayISO = new Date().toISOString().split('T')[0];
    const todayRecord = state.attendanceRecords.find(record => record.date === todayISO);
    setTodayAttendance(todayRecord || null);
  };

  useEffect(() => {
    console.log('User effect triggered, user:', user);
    if (user && user.role === 'employee') {
      console.log('Setting up employee PK for user:', user);
      // Set fallback PK immediately to ensure data fetching starts
      const fallbackPk = parseInt(user.id);
      console.log('Setting fallback PK:', fallbackPk);
      setEmployeePk(fallbackPk);
      
      // Try to resolve backend PK for this employee (by employee_id like emp002)
      (async () => {
        try {
          const res = await employeeAPI.getAll();
          const employees = res.data || res || [];
          const match = employees.find((e: any) => e.employee_id === user.employeeId);
          if (match) {
            console.log('Found matching employee, updating PK to:', match.id);
            setEmployeePk(match.id);
          } else {
            console.log('No matching employee found, using fallback PK:', fallbackPk);
            setError('Employee record not found on server, using fallback data');
          }
        } catch (e) {
          console.log('Employee API failed, using fallback PK:', fallbackPk);
          setError('Failed to load employee profile from server, using fallback data');
        }
      })();
    } else {
      console.log('User not available or not employee role');
    }
  }, [user]);

  useEffect(() => {
    console.log('employeePk changed:', employeePk);
    if (employeePk) {
      console.log('Calling fetchAttendanceData with employeePk:', employeePk);
      fetchAttendanceData();
    }
  }, [employeePk]);

  useEffect(() => {
    checkTodayAttendance();
  }, [state.attendanceRecords]);

  const fetchAttendanceData = async () => {
    console.log('Fetching attendance data for employee PK:', employeePk);
    try {
      setLoading(true);
      setError('');
      
      // Try to fetch from actual API first
      try {
        if (user?.employeeId) {
          console.log('Fetching attendance for employee ID:', user.employeeId);
          const response = await attendanceAPI.getByEmployee(user.employeeId);
          const attendanceData = Array.isArray(response) ? response : response.data || [];
          
          console.log('API response received:', attendanceData);
          
          if (attendanceData.length > 0) {
            // Map backend data to frontend format with normalization for legacy keys
            const normalizeTime = (t: any) => {
              if (!t) return '';
              try {
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
            const mappedData = attendanceData.map((record: any) => ({
              id: record.id,
              date: record.date,
              employee: record.employee,
              employee_name: record.employee_name || user?.name || 'Employee',
              department: record.department || user?.department || 'General',
              // First normalize direct fields
              check_in: normalizeTime(
                record.check_in ?? record.check_in_time ?? record.checkIn ?? record.check_in_at ??
                record.in_time ?? record.time_in ?? record.clock_in ?? record.start_time
              ),
              check_out: normalizeTime(
                record.check_out ?? record.check_out_time ?? record.checkOut ?? record.check_out_at ??
                record.out_time ?? record.time_out ?? record.clock_out ?? record.end_time
              ),
              hours: Number(record.hours) || 0,
              status: record.status
            })).map((r: any) => {
              // Then infer missing times from hours for display
              const hoursNum = Number(r.hours) || 0;
              if (hoursNum > 0) {
                const minutes = Math.round(hoursNum * 60);
                if (r.check_in && !r.check_out) r.check_out = addMinutes(r.check_in, minutes);
                else if (!r.check_in && r.check_out) r.check_in = addMinutes(r.check_out, -minutes);
                else if (!r.check_in && !r.check_out) {
                  r.check_in = '09:00';
                  r.check_out = addMinutes(r.check_in, minutes);
                }
              }
              return r;
            });
            
            dispatch({ type: 'SET_ATTENDANCE_RECORDS', payload: mappedData });
            console.log('Real attendance data loaded successfully');
            return;
          }
        }
      } catch (apiError) {
        console.warn('API fetch failed, using fallback data:', apiError);
      }
      
      // Fallback to mock data if API fails
      console.log('Using fallback mock data');
      const mockAttendanceData = [
        {
          id: 1,
          date: '2025-08-20',
          employee: employeePk || 0,
          employee_name: user?.name || 'Employee',
          department: user?.department || 'IT',
          check_in: '09:00',
          check_out: '17:30',
          hours: 8.5,
          status: 'Present' as const
        },
        {
          id: 2,
          date: '2025-08-19',
          employee: employeePk || 0,
          employee_name: user?.name || 'Employee',
          department: user?.department || 'IT',
          check_in: '09:15',
          check_out: '17:45',
          hours: 8.5,
          status: 'Late' as const
        }
      ];
      
      dispatch({ type: 'SET_ATTENDANCE_RECORDS', payload: mockAttendanceData });
      setError('Using offline data. Backend server may not be responding.');
      
    } catch (err) {
      setError('Failed to fetch attendance data');
      console.error('Error fetching attendance data:', err);
      // Minimal fallback data
      const fallbackAttendanceData = [
        {
          id: 1,
          date: new Date().toISOString().split('T')[0],
          employee: employeePk || 0,
          employee_name: user?.name || 'Employee',
          department: user?.department || 'IT',
          check_in: '09:00',
          check_out: '17:30',
          hours: 8.5,
          status: 'Present' as const
        }
      ];
      dispatch({ type: 'SET_ATTENDANCE_RECORDS', payload: fallbackAttendanceData });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate times before submission
    const timeValidationError = validateTimes(formData.check_in, formData.check_out);
    if (timeValidationError) {
      setTimeError(timeValidationError);
      return;
    }

    // Check if attendance is already marked for today
    if (todayAttendance) {
      setError('Attendance already marked for today');
      return;
    }
    
    try {
      const attendanceData = {
        ...formData,
        employee: employeePk,
        hours: parseFloat(formData.hours)
      };
      
      // Try to create attendance record via API
      const response = await attendanceAPI.create(attendanceData);
      const newRecord = response.data || response;
      
      // Add to global state
      const attendanceRecord: AttendanceRecord = {
        id: newRecord.id,
        date: formData.date,
        employee: employeePk || 0,
        employee_name: user?.name || '',
        department: user?.department || '',
        check_in: formData.check_in,
        check_out: formData.check_out,
        hours: parseFloat(formData.hours),
        status: formData.status
      };
      
      dispatch({ type: 'ADD_ATTENDANCE_RECORD', payload: attendanceRecord });
      setShowMarkAttendanceModal(false);
      resetForm();
      setError('');
      setTimeError('');
    } catch (err) {
      setError('Failed to mark attendance');
      console.error('Error marking attendance:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      check_in: '',
      check_out: '',
      hours: '',
      status: 'Present'
    });
    setTimeError('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'Absent':
        return <XCircle size={16} className="text-red-600" />;
      case 'Late':
        return <AlertCircle size={16} className="text-yellow-600" />;
      case 'Half Day':
        return <Clock size={16} className="text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800';
      case 'Half Day':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || user.role !== 'employee') {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Access denied. This page is only for employees.
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('EmployeeAttendance render - state.attendanceRecords:', state.attendanceRecords);
  console.log('EmployeeAttendance render - loading:', loading, 'employeePk:', employeePk);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-600">Track your attendance and working hours</p>
        </div>
        {!todayAttendance && (
          <button
            onClick={() => setShowMarkAttendanceModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            <span>Mark Today's Attendance</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {todayAttendance && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ Today's attendance already marked. Check-in: {todayAttendance.check_in}, Check-out: {todayAttendance.check_out || 'Not checked out yet'}
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search your attendance records..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {state.attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No attendance records found. {error || 'Loading data...'}
                  </td>
                </tr>
              ) : state.attendanceRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {formatDDMMYYYY(record.date)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{record.check_in}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{record.check_out || '-'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{record.hours} hrs</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(record.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {showMarkAttendanceModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Mark Today's Attendance</h3>
              <button onClick={() => setShowMarkAttendanceModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleMarkAttendance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Check In</label>
                  <input
                    type="time"
                    required
                    value={formData.check_in}
                    onChange={(e) => {
                      setFormData({...formData, check_in: e.target.value});
                      updateHours(e.target.value, formData.check_out);
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Check Out</label>
                  <input
                    type="time"
                    value={formData.check_out}
                    onChange={(e) => {
                      setFormData({...formData, check_out: e.target.value});
                      updateHours(formData.check_in, e.target.value);
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              {timeError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                  {timeError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Hours</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={formData.hours}
                  onChange={(e) => setFormData({...formData, hours: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  readOnly
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMarkAttendanceModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!timeError}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Mark Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendance;
