import React, { useState, useEffect } from 'react';
// import { formatDDMMYYYY } from '../utils/date';
import { User, Mail, Phone, Building, Briefcase, Calendar, IndianRupee, Edit, Save, X, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { employeeAPI } from '../services/api';

interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joining_date: string;
  date_of_birth?: string;
  age?: number;
  status: 'Active' | 'Inactive';
  salary: number;
  profile_photo?: string | null;
}

const EmployeeProfile = () => {
  const { user } = useAuth();
  const { dispatch } = useData();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Employee>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user && user.role === 'employee') {
      fetchEmployeeData();
    }
  }, [user]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch employee data from API using employee_id to avoid mismatches
      try {
        const list = await employeeAPI.getByEmployeeId(user?.employeeId || '');
        const employeeData = Array.isArray(list) && list.length > 0 ? list[0] : null;
        if (!employeeData) throw new Error('Employee not found');
        
                 const employeeInfo: Employee = {
           id: employeeData.id,
           employee_id: employeeData.employee_id,
           name: employeeData.name,
           email: employeeData.email,
           phone: employeeData.phone,
           department: employeeData.department,
           designation: employeeData.designation,
           joining_date: employeeData.joining_date,
           date_of_birth: employeeData.date_of_birth,
           age: employeeData.age,
           status: employeeData.status,
           salary: employeeData.salary || 0,
           profile_photo: employeeData.profile_photo || null,
         };

        setEmployee(employeeInfo);
        setEditData(employeeInfo);
        dispatch({ type: 'SET_EMPLOYEE', payload: employeeInfo });
      } catch (apiError) {
        console.log('API failed, using mock data:', apiError);

        // Fallback to mock data for employee profile
        const mockEmployee: Employee = {
          id: user?.id || '1',
          employee_id: user?.employeeId || 'EMP001',
          name: user?.name || 'John Doe',
          email: user?.email || 'john.doe@company.com',
          phone: '+91-9876543201',
          department: user?.department || 'Engineering',
          designation: user?.designation || 'Software Engineer',
          joining_date: '2023-01-15',
          status: 'Active',
          salary: 750000,
          profile_photo: null,
        };

        setEmployee(mockEmployee);
        setEditData(mockEmployee);
        dispatch({ type: 'SET_EMPLOYEE', payload: mockEmployee });
      }
      
      setError('');
    } catch (err) {
      setError('Failed to fetch employee data');
      console.error('Error fetching employee data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(employee || {});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(employee || {});
  };

  const handleSave = async () => {
    try {
      // Try to update employee data via API
      let updatedEmployeeData;
      try {
        // Update by internal numeric id
        const response = await employeeAPI.update(employee?.id || '0', editData);
        updatedEmployeeData = response;
      } catch (apiError) {
        console.log('API failed, updating mock employee:', apiError);
        // Update mock employee if API fails
        updatedEmployeeData = {
          ...employee,
          ...editData
        };
      }
      
             const updatedEmployee: Employee = {
        id: updatedEmployeeData.id,
        employee_id: updatedEmployeeData.employee_id,
        name: updatedEmployeeData.name,
        email: updatedEmployeeData.email,
        phone: updatedEmployeeData.phone,
        department: updatedEmployeeData.department,
        designation: updatedEmployeeData.designation,
        joining_date: updatedEmployeeData.joining_date,
        date_of_birth: updatedEmployeeData.date_of_birth,
        age: updatedEmployeeData.age,
        status: updatedEmployeeData.status,
        salary: updatedEmployeeData.salary || 0,
        profile_photo: updatedEmployeeData.profile_photo || employee?.profile_photo || null,
      };
      
      setEmployee(updatedEmployee);
      dispatch({ type: 'UPDATE_EMPLOYEE', payload: updatedEmployee });
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError('Failed to update employee data');
      console.error('Error updating employee data:', err);
    }
  };

  const handlePhotoUpload = async () => {
    if (!employee || !photoFile) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', photoFile);
      const updated = await employeeAPI.uploadPhoto(employee.id, formData);
      const updatedUrl = (updated && updated.profile_photo) ? (updated.profile_photo as string) : null;
      const newEmp: Employee = { ...(employee as Employee), profile_photo: updatedUrl };
      setEmployee(newEmp);
      setEditData(newEmp);
      setPhotoFile(null);
      setError('');
    } catch (e) {
      console.error('Photo upload failed', e);
      setError('Failed to upload photo');
    } finally {
      setUploading(false);
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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Employee data not found.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">View and manage your personal information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
          >
            <Edit size={20} />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-600"
            >
              <X size={20} />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
            >
              <Save size={20} />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center">
            {employee.profile_photo ? (
              <img
                src={employee.profile_photo.startsWith('http') ? employee.profile_photo : `http://localhost:8000${employee.profile_photo}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-2xl">
                {employee.name.split(' ').map(n => n[0]).join('')}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
            <p className="text-gray-600">{employee.designation}</p>
            <p className="text-gray-500">{employee.department}</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
          <div className="flex items-center space-x-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              className="block text-sm"
            />
            <button
              onClick={handlePhotoUpload}
              disabled={!photoFile || uploading}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-60"
            >
              <Upload size={18} />
              <span>{uploading ? 'Uploading...' : 'Upload'}</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Max size 5MB. JPG/PNG.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar size={20} className="text-gray-400" />
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  value={isEditing ? (editData.date_of_birth || '') : (employee.date_of_birth || '')}
                  onChange={(e) => setEditData({...editData, date_of_birth: e.target.value})}
                  disabled={!isEditing}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Age must be between 21 and 60</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <User size={20} className="text-gray-400" />
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  value={employee.age ?? (editData.age ?? 0)}
                  disabled={true}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <User size={20} className="text-gray-400" />
              <div>
                <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                <input
                  type="text"
                  value={employee.employee_id}
                  disabled={true}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Employee ID cannot be modified</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Mail size={20} className="text-gray-400" />
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={isEditing ? editData.email || '' : employee.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  disabled={!isEditing}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone size={20} className="text-gray-400" />
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={isEditing ? editData.phone || '' : employee.phone}
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  disabled={!isEditing}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Building size={20} className="text-gray-400" />
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input
                  type="text"
                  value={isEditing ? editData.department || '' : employee.department}
                  onChange={(e) => setEditData({...editData, department: e.target.value})}
                  disabled={!isEditing}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Briefcase size={20} className="text-gray-400" />
              <div>
                <label className="block text-sm font-medium text-gray-700">Designation</label>
                <input
                  type="text"
                  value={isEditing ? editData.designation || '' : employee.designation}
                  onChange={(e) => setEditData({...editData, designation: e.target.value})}
                  disabled={!isEditing}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar size={20} className="text-gray-400" />
              <div>
                <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                <input
                  type="date"
                  value={isEditing ? editData.joining_date || '' : employee.joining_date}
                  onChange={(e) => setEditData({...editData, joining_date: e.target.value})}
                  disabled={true}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Joining date cannot be edited by employees.</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <IndianRupee size={20} className="text-gray-400" />
              <div>
                <label className="block text-sm font-medium text-gray-700">Salary</label>
                <input
                  type="number"
                  value={isEditing ? editData.salary || 0 : employee.salary || 0}
                  onChange={(e) => setEditData({...editData, salary: parseFloat(e.target.value) || 0})}
                  disabled={true}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Salary can only be modified by administrators</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Status: {employee.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
