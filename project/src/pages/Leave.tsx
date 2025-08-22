import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, X, Calendar, User, Clock, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { leaveRequestAPI, employeeAPI } from '../services/api';
import { formatDDMMYYYY } from '../utils/date';

interface LeaveRequest {
  id: number;
  employee: number;
  employee_name: string;
  department: string;
  leave_type: 'Annual Leave' | 'Sick Leave' | 'Personal Leave' | 'Emergency Leave';
  start_date: string;
  end_date: string;
  days: number;
  applied_date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason?: string;
  approved_by?: number;
  approved_by_name?: string;
}

interface Employee {
  id: number;
  employee_id: string;
  name: string;
  department: string;
}

const Leave = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [dateError, setDateError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    employee: '',
    leave_type: 'Annual Leave' as 'Annual Leave' | 'Sick Leave' | 'Personal Leave' | 'Emergency Leave',
    start_date: '',
    end_date: '',
    days: '',
    reason: ''
  });

  // Calculate days between start and end dates
  const calculateDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate difference in days (inclusive of both start and end dates)
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return diffDays;
  };

  // Validate start and end dates
  const validateDates = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return 'Start date cannot be after end date';
    }
    
    // Check if dates are in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start < today) {
      return 'Start date cannot be in the past';
    }
    
    return '';
  };

  // Update days when start or end dates change
  const updateDays = (startDate: string, endDate: string) => {
    const error = validateDates(startDate, endDate);
    setDateError(error);
    
    if (!error && startDate && endDate) {
      const calculatedDays = calculateDays(startDate, endDate);
      setFormData(prev => ({ ...prev, days: calculatedDays.toString() }));
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leaveData, empData] = await Promise.all([
        leaveRequestAPI.getAll(),
        employeeAPI.getAll()
      ]);
      setLeaveRequests(leaveData);
      setEmployees(empData);
      setError('');
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLeaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dates before submission
    const dateValidationError = validateDates(formData.start_date, formData.end_date);
    if (dateValidationError) {
      setDateError(dateValidationError);
      return;
    }
    
    try {
      const leaveData = {
        ...formData,
        employee: parseInt(formData.employee),
        days: parseInt(formData.days)
      };
      
      await leaveRequestAPI.create(leaveData);
      setShowAddModal(false);
      resetForm();
      fetchData();
      setError('');
      setDateError('');
    } catch (err) {
      setError('Failed to add leave request');
      console.error('Error adding leave request:', err);
    }
  };

  const handleEditLeaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    
    // Validate dates before submission
    const dateValidationError = validateDates(formData.start_date, formData.end_date);
    if (dateValidationError) {
      setDateError(dateValidationError);
      return;
    }
    
    try {
      const leaveData = {
        ...formData,
        employee: parseInt(formData.employee),
        days: parseInt(formData.days)
      };
      
      await leaveRequestAPI.update(selectedRequest.id.toString(), leaveData);
      setShowEditModal(false);
      resetForm();
      fetchData();
      setError('');
      setDateError('');
    } catch (err) {
      setError('Failed to update leave request');
      console.error('Error updating leave request:', err);
    }
  };

  const handleDeleteLeaveRequest = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      try {
        await leaveRequestAPI.delete(id.toString());
        fetchData();
        setError('');
      } catch (err) {
        setError('Failed to delete leave request');
        console.error('Error deleting leave request:', err);
      }
    }
  };

  const handleApproveLeave = async (id: number) => {
    try {
      await leaveRequestAPI.approve(id.toString());
      fetchData();
      setError('');
    } catch (err) {
      setError('Failed to approve leave request');
      console.error('Error approving leave request:', err);
    }
  };

  const handleRejectLeave = async (id: number) => {
    try {
      await leaveRequestAPI.reject(id.toString());
      fetchData();
      setError('');
    } catch (err) {
      setError('Failed to reject leave request');
      console.error('Error rejecting leave request:', err);
    }
  };

  const openEditModal = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setFormData({
      employee: request.employee.toString(),
      leave_type: request.leave_type,
      start_date: request.start_date,
      end_date: request.end_date,
      days: request.days.toString(),
      reason: request.reason || ''
    });
    setShowEditModal(true);
  };

  const openViewModal = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      employee: '',
      leave_type: 'Annual Leave',
      start_date: '',
      end_date: '',
      days: '',
      reason: ''
    });
    setSelectedRequest(null);
    setDateError('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'Rejected':
        return <XCircle size={16} className="text-red-600" />;
      case 'Pending':
        return <AlertCircle size={16} className="text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'Annual Leave':
        return 'bg-blue-100 text-blue-800';
      case 'Sick Leave':
        return 'bg-red-100 text-red-800';
      case 'Personal Leave':
        return 'bg-purple-100 text-purple-800';
      case 'Emergency Leave':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = !searchTerm || 
      request.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.leave_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || request.status === filterStatus;
    const matchesType = !filterType || request.leave_type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const statuses = ['Pending', 'Approved', 'Rejected'];
  const leaveTypes = ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Emergency Leave'];

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
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600">Manage employee leave requests and approvals</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>Apply Leave</span>
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
              placeholder="Search by employee name, department, or leave type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
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
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            {leaveTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied Date
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
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {request.employee_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{request.employee_name}</div>
                        <div className="text-sm text-gray-500">{request.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLeaveTypeColor(request.leave_type)}`}>
                      {request.leave_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDDMMYYYY(request.start_date)} - {formatDDMMYYYY(request.end_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{request.days} days</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {formatDDMMYYYY(request.applied_date)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(request.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => openViewModal(request)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye size={16} />
                    </button>
                    {request.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleApproveLeave(request.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleRejectLeave(request.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XCircle size={16} />
                      </button>
                      </>
                    )}
                    <button
                      onClick={() => openEditModal(request)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteLeaveRequest(request.id)}
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

      {/* Add Leave Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Apply Leave Request</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddLeaveRequest} className="space-y-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700">Leave Type</label>
                <select
                  required
                  value={formData.leave_type}
                  onChange={(e) => setFormData({...formData, leave_type: e.target.value as any})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {leaveTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => {
                      setFormData({...formData, start_date: e.target.value});
                      updateDays(e.target.value, formData.end_date);
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => {
                      setFormData({...formData, end_date: e.target.value});
                      updateDays(formData.start_date, e.target.value);
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              {dateError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                  {dateError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Number of Days</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.days}
                  onChange={(e) => setFormData({...formData, days: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please provide a reason for your leave request..."
                />
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
                  disabled={!!dateError}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Apply Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Leave Request Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Leave Request</h3>
              <button onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditLeaveRequest} className="space-y-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700">Leave Type</label>
                <select
                  required
                  value={formData.leave_type}
                  onChange={(e) => setFormData({...formData, leave_type: e.target.value as any})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {leaveTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => {
                      setFormData({...formData, start_date: e.target.value});
                      updateDays(e.target.value, formData.end_date);
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => {
                      setFormData({...formData, end_date: e.target.value});
                      updateDays(formData.start_date, e.target.value);
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              {dateError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                  {dateError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Number of Days</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.days}
                  onChange={(e) => setFormData({...formData, days: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please provide a reason for your leave request..."
                />
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
                  disabled={!!dateError}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Update Leave Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Leave Request Modal */}
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Leave Request Details</h3>
              <button onClick={() => setShowViewModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-lg">
                    {selectedRequest.employee_name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold">{selectedRequest.employee_name}</h4>
                  <p className="text-gray-600">{selectedRequest.department}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <FileText size={16} className="text-gray-400" />
                  <span className="text-sm">
                    Leave Type: {selectedRequest.leave_type}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm">
                    Start Date: {formatDDMMYYYY(selectedRequest.start_date)}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm">
                    End Date: {formatDDMMYYYY(selectedRequest.end_date)}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm">
                    Duration: {selectedRequest.days} days
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm">
                    Applied: {formatDDMMYYYY(selectedRequest.applied_date)}
                  </span>
                </div>
                {selectedRequest.reason && (
                  <div className="flex items-start space-x-3">
                    <FileText size={16} className="text-gray-400 mt-0.5" />
                    <span className="text-sm">
                      Reason: {selectedRequest.reason}
                    </span>
                  </div>
                )}
                {selectedRequest.approved_by_name && (
                  <div className="flex items-center space-x-3">
                    <User size={16} className="text-gray-400" />
                    <span className="text-sm">
                      Approved by: {selectedRequest.approved_by_name}
                    </span>
                  </div>
                )}
                <div className="pt-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedRequest.status)}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status}
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

export default Leave;