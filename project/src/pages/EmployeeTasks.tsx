import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle, AlertCircle, TrendingUp, Edit, X, Upload, FileText, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
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
  attachments?: TaskAttachment[];
  progress_updates?: TaskProgressUpdate[];
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

interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

const EmployeeTasks = () => {
  const { user } = useAuth();
  const { state, dispatch } = useData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editData, setEditData] = useState<Partial<Task>>({});
  const [employeePk, setEmployeePk] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [progressNotes, setProgressNotes] = useState<string>('');

  useEffect(() => {
    if (user && user.role === 'employee') {
      console.log('Setting up employee PK for tasks page, user:', user);
      // Set fallback PK immediately to ensure data fetching starts
      setEmployeePk(parseInt(user.id));
      
      // Try to resolve backend PK for this employee
      (async () => {
        try {
          const res = await employeeAPI.getAll();
          const employees = res.data || res || [];
          const match = employees.find((e: any) => e.employee_id === user.employeeId);
          if (match) {
            console.log('Found matching employee for tasks, updating PK to:', match.id);
            setEmployeePk(match.id);
          } else {
            console.log('No matching employee found for tasks, using fallback PK:', parseInt(user.id));
            setError('Employee record not found on server, using fallback data');
          }
        } catch (e) {
          console.log('Employee API failed for tasks, using fallback PK:', parseInt(user.id));
          setError('Failed to load employee profile from server, using fallback data');
        }
      })();
    }
  }, [user]);

  useEffect(() => {
    if (employeePk) fetchTaskData();
  }, [employeePk]);

  const fetchTaskData = async () => {
    console.log('Fetching task data for employee PK:', employeePk);
    try {
      setLoading(true);
      setError('');
      
      // Try to fetch from actual API first
      try {
        if (user?.employeeId) {
          console.log('Fetching tasks for employee ID:', user.employeeId);
          
          // First try the employee-specific endpoint
          try {
            const employeeResponse = await taskAPI.getEmployeeTasksWithFiles(user.employeeId);
            const taskData = Array.isArray(employeeResponse) ? employeeResponse : employeeResponse.data || [];
            
            if (taskData.length > 0) {
              const mappedData = taskData.map((task: any) => ({
                id: task.id,
                title: task.title,
                description: task.description,
                assigned_to: employeePk || parseInt(user?.id || '1'),
                assigned_to_name: user?.name || '',
                assigned_by: task.assigned_by,
                assigned_by_name: task.assigned_by_name || 'Admin',
                assigned_date: task.assigned_date,
                due_date: task.due_date,
                priority: task.priority,
                status: task.status,
                progress: task.progress,
                department: user?.department || '',
                estimated_hours: task.estimated_hours,
                attachments: task.attachments || []
              }));
              
              dispatch({ type: 'SET_TASKS', payload: mappedData });
              console.log('Real task data loaded successfully via employee endpoint');
              return;
            }
          } catch (employeeEndpointError) {
            console.log('Employee-specific endpoint failed, trying general endpoint:', employeeEndpointError);
          }
          
          // Fallback to general endpoint with filtering
          const response = await taskAPI.getAll();
          const allTasks = Array.isArray(response) ? response : response.data || [];
          const employeeTasks = allTasks
            .filter((task: any) => task.assigned_to === employeePk || task.employee_id === user.employeeId)
            .map((task: any) => ({
              id: task.id,
              title: task.title,
              description: task.description,
              assigned_to: employeePk || parseInt(user?.id || '1'),
              assigned_to_name: user?.name || '',
              assigned_by: task.assigned_by,
              assigned_by_name: task.assigned_by_name || 'Admin',
              assigned_date: task.assigned_date,
              due_date: task.due_date,
              priority: task.priority,
              status: task.status,
              progress: task.progress,
              department: user?.department || '',
              estimated_hours: task.estimated_hours,
              attachments: task.attachments || []
            }));
          
          if (employeeTasks.length > 0) {
            dispatch({ type: 'SET_TASKS', payload: employeeTasks });
            console.log('Real task data loaded successfully via general endpoint');
            return;
          }
        }
      } catch (apiError) {
        console.log('Failed to load tasks via API, using fallback data:', apiError);
      }
      
      // Fallback to mock data if API fails
      console.log('Using fallback mock task data');
      const mockTaskData: Task[] = [
        {
          id: 1,
          title: 'Review budget proposal',
          description: 'Coordinate with client and review the budget proposal for Q3',
          assigned_to: employeePk || parseInt(user?.id || '1'),
          assigned_to_name: user?.name || '',
          assigned_by: 1,
          assigned_by_name: 'Admin',
          assigned_date: '2025-08-15',
          due_date: '2025-08-30',
          priority: 'High',
          status: 'In Progress',
          progress: 65,
          department: user?.department || '',
          estimated_hours: 24.0,
          attachments: []
        },
        {
          id: 2,
          title: 'Update documentation',
          description: 'Update the project documentation with latest changes',
          assigned_to: employeePk || parseInt(user?.id || '1'),
          assigned_to_name: user?.name || '',
          assigned_by: 1,
          assigned_by_name: 'Admin',
          assigned_date: '2025-08-10',
          due_date: '2025-08-25',
          priority: 'Medium',
          status: 'Not Started',
          progress: 0,
          department: user?.department || '',
          estimated_hours: 16.0,
          attachments: []
        },
        {
          id: 3,
          title: 'Team meeting preparation',
          description: 'Prepare presentation for weekly team meeting',
          assigned_to: employeePk || parseInt(user?.id || '1'),
          assigned_to_name: user?.name || '',
          assigned_by: 1,
          assigned_by_name: 'Team Lead',
          assigned_date: '2025-08-20',
          due_date: '2025-08-22',
          priority: 'Low',
          status: 'Completed',
          progress: 100,
          department: user?.department || '',
          estimated_hours: 4.0,
          attachments: []
        }
      ];
      
      dispatch({ type: 'SET_TASKS', payload: mockTaskData });
      setError('Using offline data. Backend server may not be responding.');
      
    } catch (err) {
      setError('Failed to fetch task data');
      console.error('Error fetching task data:', err);
      // Minimal fallback data
      const fallbackTaskData = [
        {
          id: 1,
          title: 'Review budget proposal',
          description: 'Coordinate with client and review the budget proposal for Q3',
          assigned_to: employeePk || parseInt(user?.id || '1'),
          assigned_to_name: user?.name || '',
          assigned_by: 1,
          assigned_by_name: 'Admin',
          assigned_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'High' as const,
          status: 'In Progress' as const,
          progress: 65,
          department: user?.department || '',
          estimated_hours: 24.0,
          attachments: []
        }
      ];
      dispatch({ type: 'SET_TASKS', payload: fallbackTaskData });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!selectedTask || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', `File uploaded for task: ${selectedTask.title}`);

        // Simulate upload progress
        for (let i = 0; i <= 100; i += 20) {
          setUploadProgress(i);
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        try {
          await taskAPI.uploadFile(selectedTask.id.toString(), formData);
        } catch (apiError) {
          console.log('API upload failed, using mock data:', apiError);
          // Create mock attachment for fallback
          const newAttachment: TaskAttachment = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            url: URL.createObjectURL(file),
            size: file.size,
            uploadedAt: new Date().toISOString()
          };

          const updatedTask = {
            ...selectedTask,
            attachments: [...(selectedTask.attachments || []), newAttachment]
          };
          dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
        }
      }

      setSelectedFiles([]);
      setError('');
      // Refresh task data to get updated attachments
      await fetchTaskData();
    } catch (err) {
      setError('Failed to upload files');
      console.error('Error uploading files:', err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    
    try {
      // Upload files first if any are selected
      if (selectedFiles.length > 0) {
        await handleFileUpload(selectedFiles);
      }

      const taskData = {
        ...editData,
        progress: parseInt(editData.progress?.toString() || '0'),
        estimated_hours: editData.estimated_hours ? parseFloat(editData.estimated_hours.toString()) : undefined
      };
      
      // Automatically update status based on progress
      if (taskData.progress === 100) {
        taskData.status = 'Completed';
      } else if (taskData.progress > 0) {
        taskData.status = 'In Progress';
      }
      
      // Try to update task via API
      let updatedTaskData;
      try {
        // Use the updateProgress endpoint for progress updates with notes
        if (editData.progress !== undefined && editData.progress !== selectedTask.progress) {
          await taskAPI.updateProgress(selectedTask.id.toString(), taskData.progress, progressNotes);
        }
        
        // Use PATCH for partial updates
        const apiResp = await taskAPI.patch(selectedTask.id.toString(), taskData);
        updatedTaskData = apiResp.data || apiResp;
        
        // Refresh task data from server
        await fetchTaskData();
        
      } catch (apiError) {
        console.log('API failed, updating local state:', apiError);
        // Update local state if API fails
        updatedTaskData = {
          ...selectedTask,
          ...taskData
        };
        
        // Update global state
        const updatedTask = { ...selectedTask, ...updatedTaskData };
        dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      }
      
      setShowEditModal(false);
      setSelectedTask(null);
      setEditData({});
      setSelectedFiles([]);
      setProgressNotes('');
      setError('');
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    }
  };

  const openEditModal = (task: Task) => {
    // Clear any previous errors
    setError('');
    
    setSelectedTask(task);
    setEditData({
      title: task.title,
      description: task.description,
      status: task.status,
      progress: task.progress,
      estimated_hours: task.estimated_hours
    });
    setShowEditModal(true);
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

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleQuickProgressUpdate = async (taskId: number, newProgress: number) => {
    try {
      // Find the task to update
      const taskToUpdate = state.tasks.find(t => t.id === taskId);
      if (!taskToUpdate) return;

      // Determine new status based on progress
      let newStatus = taskToUpdate.status;
      if (newProgress === 100) {
        newStatus = 'Completed';
      } else if (newProgress > 0 && taskToUpdate.status === 'Not Started') {
        newStatus = 'In Progress';
      }

      const updateData = {
        progress: newProgress,
        status: newStatus
      };

      try {
        // Try to update via API
        await taskAPI.updateProgress(taskId.toString(), newProgress);
        if (newStatus !== taskToUpdate.status) {
          await taskAPI.patch(taskId.toString(), { status: newStatus });
        }
        
        // Refresh data from server
        await fetchTaskData();
      } catch (apiError) {
        console.log('API failed, updating local state:', apiError);
        // Update local state if API fails
        const updatedTask = { ...taskToUpdate, ...updateData };
        dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      }
      
      setError('');
    } catch (err) {
      setError('Failed to update task progress');
      console.error('Error updating task progress:', err);
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600">View and update your assigned tasks</p>
        </div>
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
              placeholder="Search your tasks..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attachments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                             {state.tasks.map((task) => (
                <tr key={task.id} className={`hover:bg-gray-50 ${isTaskOverdue(task.due_date) ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      <div className="text-sm text-gray-500">{task.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDDMMYYYY(task.due_date)}
                    </div>
                    {isTaskOverdue(task.due_date) ? (
                      <div className="text-xs text-red-600">Overdue</div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        {getDaysRemaining(task.due_date)} days remaining
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(task.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{task.progress}%</span>
                      {/* Quick progress update buttons */}
                      {task.status !== 'Completed' && (
                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await handleQuickProgressUpdate(task.id, Math.min(task.progress + 25, 100));
                            }}
                            className="text-xs bg-blue-100 text-blue-600 px-1 py-0.5 rounded hover:bg-blue-200"
                            title="Add 25%"
                          >
                            +25%
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {task.attachments && task.attachments.length > 0 ? (
                        <div className="flex items-center space-x-1">
                          <FileText size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-600">{task.attachments.length}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditModal(task)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Task Modal */}
      {showEditModal && selectedTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Update Task</h3>
              <button onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  required
                  value={editData.title || ''}
                  onChange={(e) => setEditData({...editData, title: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={editData.description || ''}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  required
                  value={editData.status || ''}
                  onChange={(e) => setEditData({...editData, status: e.target.value as any})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={editData.progress || ''}
                  onChange={(e) => setEditData({...editData, progress: parseInt(e.target.value)})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estimated Hours</label>
                <input
                  type="number"
                  step="0.5"
                  value={editData.estimated_hours ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditData({
                      ...editData,
                      estimated_hours: val === '' ? undefined : parseFloat(val)
                    });
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Progress Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Progress Notes</label>
                <textarea
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes about your progress update..."
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Files
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="text-sm text-blue-600 hover:text-blue-500">
                          Click to upload files
                        </span>
                        <input
                          id="file-upload"
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={(e) => {
                            if (e.target.files) {
                              setSelectedFiles(Array.from(e.target.files));
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX, XLS, XLSX, JPG, PNG up to 10MB each
                    </p>
                  </div>
                </div>

                {/* Selected Files Display */}
                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Selected Files:</p>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Progress */}
                {isUploading && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Uploading...</span>
                      <span className="text-gray-600">{uploadProgress}%</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Existing Attachments */}
                {selectedTask?.attachments && selectedTask.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Current Attachments:</p>
                    {selectedTask.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText size={16} className="text-blue-600" />
                          <span className="text-sm text-gray-700">{attachment.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => window.open(attachment.url, '_blank')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTasks;
