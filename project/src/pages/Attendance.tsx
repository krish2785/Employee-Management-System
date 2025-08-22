import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, X, Clock, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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

interface Employee {
  id: number;
  employee_id: string;
  name: string;
  department: string;
}

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [timeError, setTimeError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    date: '',
    employee: '',
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

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [attData, empData] = await Promise.all([
        attendanceAPI.getAll(),
        employeeAPI.getAll()
      ]);
      setAttendanceRecords(attData);
      setEmployees(empData);
      setError('');
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate times before submission
    const timeValidationError = validateTimes(formData.check_in, formData.check_out);
    if (timeValidationError) {
      setTimeError(timeValidationError);
      return;
    }
    
    try {
      const attendanceData = {
        ...formData,
        employee: parseInt(formData.employee),
        hours: parseFloat(formData.hours)
      };
      
      await attendanceAPI.create(attendanceData);
      setShowAddModal(false);
      resetForm();
      fetchData();
      setError('');
      setTimeError('');
    } catch (err) {
      setError('Failed to add attendance record');
      console.error('Error adding attendance:', err);
    }
  };

  const handleEditAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    
    // Validate times before submission
    const timeValidationError = validateTimes(formData.check_in, formData.check_out);
    if (timeValidationError) {
      setTimeError(timeValidationError);
      return;
    }
    
    try {
      const attendanceData = {
        ...formData,
        employee: parseInt(formData.employee),
        hours: parseFloat(formData.hours)
      };
      
      await attendanceAPI.update(selectedRecord.id.toString(), attendanceData);
      setShowEditModal(false);
      resetForm();
      fetchData();
      setError('');
      setTimeError('');
    } catch (err) {
      setError('Failed to update attendance record');
      console.error('Error updating attendance:', err);
    }
  };

  const handleDeleteAttendance = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await attendanceAPI.delete(id.toString());
        fetchData();
        setError('');
      } catch (err) {
        setError('Failed to delete attendance record');
        console.error('Error deleting attendance:', err);
      }
    }
  };

  const openEditModal = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setFormData({
      date: record.date,
      employee: record.employee.toString(),
      check_in: record.check_in,
      check_out: record.check_out,
      hours: record.hours.toString(),
      status: record.status
    });
    setShowEditModal(true);
  };

  const openViewModal = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      date: '',
      employee: '',
      check_in: '',
      check_out: '',
      hours: '',
      status: 'Present'
    });
    setSelectedRecord(null);
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

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = !searchTerm || 
      record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !filterDate || record.date === filterDate;
    const matchesStatus = !filterStatus || record.status === filterStatus;
    
    return matchesSearch && matchesDate && matchesStatus;
  });

  const statuses = ['Present', 'Absent', 'Late', 'Half Day'];

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
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">Track employee attendance and working hours</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>Mark Attendance</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search employees, attendance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {record.employee_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{record.employee_name}</div>
                        <div className="text-sm text-gray-500">{record.department}</div>
                      </div>
                    </div>
                  </td>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => openViewModal(record)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => openEditModal(record)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteAttendance(record.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Attendance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Mark Attendance</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddAttendance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Employee</label>
                <select
                  required
                  value={formData.employee}
                  onChange={(e) => setFormData({...formData, employee: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} - {emp.employee_id}</option>
                  ))}
                </select>
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
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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

      {/* Edit Attendance Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Attendance</h3>
              <button onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditAttendance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Employee</label>
                <select
                  required
                  value={formData.employee}
                  onChange={(e) => setFormData({...formData, employee: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} - {emp.employee_id}</option>
                  ))}
                </select>
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
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!timeError}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Update Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Attendance Modal */}
      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Attendance Details</h3>
              <button onClick={() => setShowViewModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-lg">
                    {selectedRecord.employee_name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold">{selectedRecord.employee_name}</h4>
                  <p className="text-gray-600">{selectedRecord.department}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm">
                    Date: {formatDDMMYYYY(selectedRecord.date)}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm">
                    Check In: {selectedRecord.check_in}
                  </span>
                </div>
                {selectedRecord.check_out && (
                  <div className="flex items-center space-x-3">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-sm">
                      Check Out: {selectedRecord.check_out}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm">
                    Total Hours: {selectedRecord.hours} hrs
                  </span>
                </div>
                <div className="pt-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedRecord.status)}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRecord.status)}`}>
                      {selectedRecord.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;