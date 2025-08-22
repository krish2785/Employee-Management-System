const API_BASE_URL = 'http://localhost:8000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 401) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch {}
      // Optional: redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Token ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  const response = await fetch(url, defaultOptions);
  return handleResponse(response);
};

// Employee API
export const employeeAPI = {
  getAll: () => apiRequest('/employees/'),
  getById: (id: string) => apiRequest(`/employees/${id}/`),
  getByEmployeeId: (employeeId: string) => apiRequest(`/employees/?employee_id=${employeeId}`),
  create: (data: any) => apiRequest('/employees/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/employees/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/employees/${id}/`, {
    method: 'DELETE',
  }),
  getAttendance: (id: string) => apiRequest(`/employees/${id}/attendance/`),
  getLeaveRequests: (id: string) => apiRequest(`/employees/${id}/leave_requests/`),
  getTasks: (id: string) => apiRequest(`/employees/${id}/tasks/`),
  uploadPhoto: (id: string, formData: FormData) => apiRequest(`/employees/${id}/upload_photo/`, {
    method: 'POST',
    body: formData,
    headers: {},
  }),
};

// Attendance API
export const attendanceAPI = {
  getAll: () => apiRequest('/attendance/'),
  getById: (id: string) => apiRequest(`/attendance/${id}/`),
  create: (data: any) => apiRequest('/attendance/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/attendance/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/attendance/${id}/`, {
    method: 'DELETE',
  }),
  getByDate: (date: string) => apiRequest(`/attendance/by_date/?date=${date}`),
  getByEmployee: (employeeId: string) => apiRequest(`/attendance/by_employee/?employee_id=${employeeId}`),
};

// Leave Request API
export const leaveRequestAPI = {
  getAll: () => apiRequest('/leave-requests/'),
  getById: (id: string) => apiRequest(`/leave-requests/${id}/`),
  create: (data: any) => apiRequest('/leave-requests/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/leave-requests/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/leave-requests/${id}/`, {
    method: 'DELETE',
  }),
  getPending: () => apiRequest('/leave-requests/pending/'),
  approve: (id: string) => apiRequest(`/leave-requests/${id}/approve/`, {
    method: 'POST',
  }),
  reject: (id: string) => apiRequest(`/leave-requests/${id}/reject/`, {
    method: 'POST',
  }),
};

// Task API
export const taskAPI = {
  getAll: () => apiRequest('/tasks/'),
  getById: (id: string) => apiRequest(`/tasks/${id}/`),
  create: (data: any) => apiRequest('/tasks/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/tasks/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  patch: (id: string, data: any) => apiRequest(`/tasks/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/tasks/${id}/`, {
    method: 'DELETE',
  }),
  getByStatus: (status: string) => apiRequest(`/tasks/by_status/?status=${status}`),
  getByPriority: (priority: string) => apiRequest(`/tasks/by_priority/?priority=${priority}`),
  updateProgress: (id: string, progress: number, notes?: string) => apiRequest(`/tasks/${id}/update_progress/`, {
    method: 'POST',
    body: JSON.stringify({ progress, notes }),
  }),
  uploadFile: (id: string, formData: FormData) => apiRequest(`/tasks/${id}/upload_file/`, {
    method: 'POST',
    body: formData,
    headers: {}, // Let browser set Content-Type for FormData
  }),
  getAttachments: (id: string) => apiRequest(`/tasks/${id}/attachments/`),
  getProgressHistory: (id: string) => apiRequest(`/tasks/${id}/progress_history/`),
  getEmployeeTasksWithFiles: (employeeId?: string) => 
    apiRequest(`/tasks/employee_tasks_with_files/${employeeId ? `?employee_id=${employeeId}` : ''}`),
};

// Authentication API
export const authAPI = {
  login: (username: string, password: string) => apiRequest('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }),
  logout: () => apiRequest('/auth/logout/', {
    method: 'POST',
  }),
  getCurrentUser: () => apiRequest('/auth/user/'),
};

export default {
  employee: employeeAPI,
  attendance: attendanceAPI,
  leaveRequest: leaveRequestAPI,
  task: taskAPI,
  auth: authAPI,
};
