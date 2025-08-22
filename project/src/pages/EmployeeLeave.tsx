import React, { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
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

const EmployeeLeave = () => {
  const { user } = useAuth();
  const { state, dispatch } = useData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [dateError, setDateError] = useState('');
  const [employeePk, setEmployeePk] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (user && user.role === 'employee') {
      console.log('Setting up employee PK for leave page, user:', user);
      // Set fallback PK immediately to ensure data fetching starts
      setEmployeePk(parseInt(user.id));
      
      // Try to resolve backend PK for this employee
      (async () => {
        try {
          const res = await employeeAPI.getAll();
          const employees = res.data || res || [];
          const match = employees.find((e: any) => e.employee_id === user.employeeId);
          if (match) {
            console.log('Found matching employee for leave, updating PK to:', match.id);
            setEmployeePk(match.id);
          } else {
            console.log('No matching employee found for leave, using fallback PK:', parseInt(user.id));
            setError('Employee record not found on server, using fallback data');
          }
        } catch (e) {
          console.log('Employee API failed for leave, using fallback PK:', parseInt(user.id));
          setError('Failed to load employee profile from server, using fallback data');
        }
      })();
    }
  }, [user]);

  useEffect(() => {
    if (employeePk) fetchLeaveData();
  }, [employeePk]);

  const fetchLeaveData = async () => {
    console.log('Fetching leave data for employee PK:', employeePk);
    try {
      setLoading(true);
      setError('');
      
      // Try to fetch from actual API first
      try {
        if (user?.employeeId) {
          console.log('Fetching leave requests for employee ID:', user.employeeId);
          
          // First try the employee-specific endpoint
          try {
            const employeeResponse = await employeeAPI.getLeaveRequests(user.employeeId);
            const leaveData = Array.isArray(employeeResponse) ? employeeResponse : employeeResponse.data || [];
            
            if (leaveData.length > 0) {
              const mappedData = leaveData.map((request: any) => ({
                id: request.id,
                employee: request.employee,
                employee_name: user?.name || '',
                department: user?.department || '',
                leave_type: request.leave_type,
                start_date: request.start_date,
                end_date: request.end_date,
                days: request.days,
                applied_date: request.applied_date,
                status: request.status,
                reason: request.reason
              }));
              
              dispatch({ type: 'SET_LEAVE_REQUESTS', payload: mappedData });
              console.log('Real leave data loaded successfully via employee endpoint');
              return;
            }
          } catch (employeeEndpointError) {
            console.log('Employee-specific endpoint failed, trying general endpoint:', employeeEndpointError);
          }
          
          // Fallback to general endpoint with filtering
          const response = await leaveRequestAPI.getAll();
          const allLeaveRequests = Array.isArray(response) ? response : response.data || [];
          const employeeLeaveRequests = allLeaveRequests
            .filter((request: any) => request.employee === employeePk || request.employee_id === user.employeeId)
            .map((request: any) => ({
              id: request.id,
              employee: request.employee,
              employee_name: user?.name || '',
              department: user?.department || '',
              leave_type: request.leave_type,
              start_date: request.start_date,
              end_date: request.end_date,
              days: request.days,
              applied_date: request.applied_date,
              status: request.status,
              reason: request.reason
            }));
          
          if (employeeLeaveRequests.length > 0) {
            dispatch({ type: 'SET_LEAVE_REQUESTS', payload: employeeLeaveRequests });
            console.log('Real leave data loaded successfully via general endpoint');
            return;
          }
        }
      } catch (apiError) {
        console.log('Failed to load leave via API, using fallback data:', apiError);
      }
      
      // Fallback to mock data if API fails
      console.log('Using fallback mock leave data');
      const mockLeaveData = [
        {
          id: 1,
          employee: employeePk || 0,
          employee_name: user?.name || '',
          department: user?.department || '',
          leave_type: 'Annual Leave' as const,
          start_date: '2025-08-25',
          end_date: '2025-08-27',
          days: 3,
          applied_date: '2025-08-15',
          status: 'Pending' as const,
          reason: 'Family vacation'
        },
        {
          id: 2,
          employee: employeePk || 0,
          employee_name: user?.name || '',
          department: user?.department || '',
          leave_type: 'Sick Leave' as const,
          start_date: '2025-08-10',
          end_date: '2025-08-10',
          days: 1,
          applied_date: '2025-08-10',
          status: 'Approved' as const,
          reason: 'Medical appointment'
        }
      ];
      dispatch({ type: 'SET_LEAVE_REQUESTS', payload: mockLeaveData });
      setError('Using offline data. Backend server may not be responding.');
      
    } catch (err) {
      setError('Failed to fetch leave data');
      console.error('Error fetching leave data:', err);
      // Minimal fallback data
      const fallbackLeaveData = [
        {
          id: 1,
          employee: employeePk || 0,
          employee_name: user?.name || '',
          department: user?.department || '',
          leave_type: 'Annual Leave' as const,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
          days: 1,
          applied_date: new Date().toISOString().split('T')[0],
          status: 'Pending' as const,
          reason: 'Emergency leave'
        }
      ];
      dispatch({ type: 'SET_LEAVE_REQUESTS', payload: fallbackLeaveData });
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
        employee: employeePk,
        days: parseInt(formData.days)
      };
      
      // Try to create leave request via API
      const response = await leaveRequestAPI.create(leaveData);
      const newRequestData = response.data || response;
      
      // Add to global state
      const newRequest: LeaveRequest = {
        id: newRequestData.id,
        employee: employeePk || 0,
        employee_name: user?.name || '',
        department: user?.department || '',
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        days: parseInt(formData.days),
        applied_date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        reason: formData.reason
      };
      
      dispatch({ type: 'ADD_LEAVE_REQUEST', payload: newRequest });
      setShowAddModal(false);
      resetForm();
      setError('');
      setDateError('');
    } catch (err) {
      setError('Failed to add leave request');
      console.error('Error adding leave request:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      leave_type: 'Annual Leave',
      start_date: '',
      end_date: '',
      days: '',
      reason: ''
    });
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

  const leaveTypes = ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Emergency Leave'];

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
  console.log('EmployeeLeave render - state.leaveRequests:', state.leaveRequests);
  console.log('EmployeeLeave render - loading:', loading, 'employeePk:', employeePk);

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
          <h1 className="text-2xl font-bold text-gray-900">My Leave Requests</h1>
          <p className="text-gray-600">Apply for leave and track your requests</p>
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

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search your leave requests..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                             {state.leaveRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
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
                    min={new Date().toISOString().split('T')[0]}
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
                    min={formData.start_date || new Date().toISOString().split('T')[0]}
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
    </div>
  );
};

export default EmployeeLeave;
