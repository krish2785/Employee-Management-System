import React, { useState, useEffect } from 'react';
import { Search, Download, Eye, Clock, CheckCircle, AlertCircle, TrendingUp, FileText, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { taskAPI, employeeAPI } from '../services/api';
import { formatDDMMYYYY } from '../utils/date';

interface Task {
  id: number;
  title: string;
  description: string;
  assigned_to: number;
  assigned_to_name: string;
  assigned_by: number;
  assigned_by_name: string;
  assigned_date: string;
  due_date: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  department: string;
  estimated_hours?: number;
  last_updated: string;
  attachments?: TaskAttachment[];
  progress_updates?: TaskProgressUpdate[];
}

interface TaskAttachment {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  uploaded_by_name: string;
  uploaded_at: string;
  description?: string;
}

interface TaskProgressUpdate {
  id: number;
  previous_progress: number;
  new_progress: number;
  previous_status: string;
  new_status: string;
  update_notes?: string;
  updated_at: string;
  updated_by_name: string;
}

interface Employee {
  id: number;
  employee_id: string;
  name: string;
  department: string;
  designation: string;
}

const AdminTaskOverview = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showTaskDetails, setShowTaskDetails] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    fetchData();
  }, [selectedEmployee]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch employees for filter dropdown
      const employeesRes = await employeeAPI.getAll();
      const employeesList = employeesRes.data || employeesRes || [];
      setEmployees(employeesList);

      // Fetch tasks with files and progress updates
      try {
        const tasksRes = await taskAPI.getEmployeeTasksWithFiles(selectedEmployee);
        const tasksList = tasksRes.data || tasksRes || [];
        setTasks(tasksList);
      } catch (apiError) {
        console.log('API failed, using fallback:', apiError);
        // Fallback to regular task API
        const tasksRes = await taskAPI.getAll();
        const tasksList = tasksRes.data || tasksRes || [];
        setTasks(tasksList);
      }
      
      setError('');
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'In Progress':
        return <TrendingUp size={16} className="text-blue-600" />;
      case 'On Hold':
        return <AlertCircle size={16} className="text-orange-600" />;
      case 'Not Started':
        return <Clock size={16} className="text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'On Hold':
        return 'bg-orange-100 text-orange-800';
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isTaskOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    return today > due;
  };

  const toggleTaskDetails = (taskId: number) => {
    setShowTaskDetails(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assigned_to_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Access denied. This page is only for administrators.
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Overview & File Submissions</h1>
          <p className="text-gray-600">Monitor employee progress and view submitted files</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search tasks or employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Employees</option>
            {employees.map(employee => (
              <option key={employee.id} value={employee.employee_id}>
                {employee.name} ({employee.employee_id})
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>

          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Tasks Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Files
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <React.Fragment key={task.id}>
                  <tr className={`hover:bg-gray-50 ${isTaskOverdue(task.due_date) && task.status !== 'Completed' ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        <div className="text-sm text-gray-500">{task.description}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className="text-xs text-gray-500">Due: {formatDDMMYYYY(task.due_date)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User size={16} className="text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{task.assigned_to_name}</div>
                          <div className="text-sm text-gray-500">{task.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(task.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {task.attachments && task.attachments.length > 0 ? (
                          <div className="flex items-center space-x-1">
                            <FileText size={16} className="text-blue-600" />
                            <span className="text-sm text-blue-600 font-medium">{task.attachments.length} files</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No files</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {task.last_updated ? formatDDMMYYYY(task.last_updated) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleTaskDetails(task.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Details */}
                  {showTaskDetails[task.id] && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-4">
                          {/* Progress Updates */}
                          {task.progress_updates && task.progress_updates.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Progress History</h4>
                              <div className="space-y-2">
                                {task.progress_updates.map((update) => (
                                  <div key={update.id} className="bg-white p-3 rounded border">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="text-sm">
                                          <span className="font-medium">{update.updated_by_name}</span> updated progress from{' '}
                                          <span className="font-medium">{update.previous_progress}%</span> to{' '}
                                          <span className="font-medium">{update.new_progress}%</span>
                                        </div>
                                        {update.update_notes && (
                                          <div className="text-sm text-gray-600 mt-1">{update.update_notes}</div>
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {formatDDMMYYYY(update.updated_at)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* File Attachments */}
                          {task.attachments && task.attachments.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Submitted Files</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {task.attachments.map((attachment) => (
                                  <div key={attachment.id} className="bg-white p-3 rounded border">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <FileText size={16} className="text-blue-600" />
                                        <div>
                                          <div className="text-sm font-medium text-gray-900">{attachment.file_name}</div>
                                          <div className="text-xs text-gray-500">
                                            {(attachment.file_size / 1024 / 1024).toFixed(2)} MB • {attachment.file_type}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            Uploaded by {attachment.uploaded_by_name} on {formatDDMMYYYY(attachment.uploaded_at)}
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        className="text-blue-600 hover:text-blue-800"
                                        title="Download file"
                                      >
                                        <Download size={16} />
                                      </button>
                                    </div>
                                    {attachment.description && (
                                      <div className="text-sm text-gray-600 mt-2">{attachment.description}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500">No tasks found matching your criteria.</div>
        </div>
      )}
    </div>
  );
};

export default AdminTaskOverview;
