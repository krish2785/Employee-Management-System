export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  hireDate: string;
  status: 'Active' | 'Inactive';
  phone: string;
  salary?: number;
  manager?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  department: string;
  checkIn: string;
  checkOut: string;
  hours: number;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day';
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: 'Annual Leave' | 'Sick Leave' | 'Personal Leave' | 'Emergency Leave';
  startDate: string;
  endDate: string;
  days: number;
  appliedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason?: string;
  approvedBy?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  assignedDate: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  department: string;
  estimatedHours?: number;
}

export const mockEmployees: Employee[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@company.com',
    department: 'Engineering',
    designation: 'Senior Developer',
    hireDate: '15:01:2023',
    status: 'Active',
    phone: '+91 9876543210',
    salary: 75000,
    manager: 'Tech Lead'
  },
  {
    id: '2',
    employeeId: 'EMP002',
    name: 'Priya Patel',
    email: 'priya.patel@company.com',
    department: 'HR',
    designation: 'HR Manager',
    hireDate: '10:08:2022',
    status: 'Active',
    phone: '+91 9876543211',
    salary: 65000
  },
  {
    id: '3',
    employeeId: 'EMP003',
    name: 'Amit Verma',
    email: 'amit.verma@company.com',
    department: 'Marketing',
    designation: 'Marketing Specialist',
    hireDate: '20:03:2023',
    status: 'Active',
    phone: '+91 9876543212',
    salary: 55000,
    manager: 'Marketing Head'
  },
  {
    id: '4',
    employeeId: 'EMP004',
    name: 'Neha Gupta',
    email: 'neha.gupta@company.com',
    department: 'Finance',
    designation: 'Financial Analyst',
    hireDate: '05:11:2022',
    status: 'Active',
    phone: '+91 9876543213',
    salary: 60000,
    manager: 'Finance Manager'
  },
  {
    id: '5',
    employeeId: 'EMP005',
    name: 'Ananya Desai',
    email: 'ananya.desai@company.com',
    department: 'Marketing',
    designation: 'Marketing Specialist',
    hireDate: '15:09:2023',
    status: 'Active',
    phone: '+91 9876500005',
    salary: 65000
  },
  {
    id: '6',
    employeeId: 'EMP006',
    name: 'Vikram Malhotra',
    email: 'vikram.malhotra@company.com',
    department: 'Engineering',
    designation: 'Software Engineer',
    hireDate: '20:10:2023',
    status: 'Active',
    phone: '+91 9876500006',
    salary: 85000
  },
  {
    id: '7',
    employeeId: 'EMP007',
    name: 'Pooja Reddy',
    email: 'pooja.reddy@company.com',
    department: 'HR',
    designation: 'HR Coordinator',
    hireDate: '10:11:2023',
    status: 'Active',
    phone: '+91 9876500007',
    salary: 55000
  },
  {
    id: '8',
    employeeId: 'EMP008',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@company.com',
    department: 'Sales',
    designation: 'Sales Representative',
    hireDate: '05:12:2023',
    status: 'Active',
    phone: '+91 9876500008',
    salary: 60000
  },
  // New employees emp021-emp030
  {
    id: '21',
    employeeId: 'EMP021',
    name: 'Ravi Kumar',
    email: 'ravi.kumar@company.com',
    department: 'Engineering',
    designation: 'Software Engineer',
    hireDate: '01:07:2024',
    status: 'Active',
    phone: '+91 9876500021',
    salary: 70000,
    manager: 'Michael Chen'
  },
  {
    id: '22',
    employeeId: 'EMP022',
    name: 'Sneha Agarwal',
    email: 'sneha.agarwal@company.com',
    department: 'HR',
    designation: 'HR Executive',
    hireDate: '05:07:2024',
    status: 'Active',
    phone: '+91 9876500022',
    salary: 50000,
    manager: 'Sarah Johnson'
  },
  {
    id: '23',
    employeeId: 'EMP023',
    name: 'Karan Singh',
    email: 'karan.singh@company.com',
    department: 'Marketing',
    designation: 'Digital Marketing Specialist',
    hireDate: '10:07:2024',
    status: 'Active',
    phone: '+91 9876500023',
    salary: 55000
  },
  {
    id: '24',
    employeeId: 'EMP024',
    name: 'Meera Joshi',
    email: 'meera.joshi@company.com',
    department: 'Finance',
    designation: 'Junior Accountant',
    hireDate: '15:07:2024',
    status: 'Active',
    phone: '+91 9876500024',
    salary: 45000
  },
  {
    id: '25',
    employeeId: 'EMP025',
    name: 'Rohit Sharma',
    email: 'rohit.sharma@company.com',
    department: 'Sales',
    designation: 'Sales Executive',
    hireDate: '20:07:2024',
    status: 'Active',
    phone: '+91 9876500025',
    salary: 52000
  },
  {
    id: '26',
    employeeId: 'EMP026',
    name: 'Anjali Nair',
    email: 'anjali.nair@company.com',
    department: 'Engineering',
    designation: 'QA Engineer',
    hireDate: '25:07:2024',
    status: 'Active',
    phone: '+91 9876500026',
    salary: 65000
  },
  {
    id: '27',
    employeeId: 'EMP027',
    name: 'Deepak Gupta',
    email: 'deepak.gupta@company.com',
    department: 'Engineering',
    designation: 'DevOps Engineer',
    hireDate: '01:08:2024',
    status: 'Active',
    phone: '+91 9876500027',
    salary: 75000,
    manager: 'Michael Chen'
  },
  {
    id: '28',
    employeeId: 'EMP028',
    name: 'Kavya Reddy',
    email: 'kavya.reddy@company.com',
    department: 'Marketing',
    designation: 'Content Writer',
    hireDate: '05:08:2024',
    status: 'Active',
    phone: '+91 9876500028',
    salary: 48000
  },
  {
    id: '29',
    employeeId: 'EMP029',
    name: 'Suresh Patel',
    email: 'suresh.patel@company.com',
    department: 'Engineering',
    designation: 'Backend Developer',
    hireDate: '10:08:2024',
    status: 'Active',
    phone: '+91 9876500029',
    salary: 72000,
    manager: 'Michael Chen'
  },
  {
    id: '30',
    employeeId: 'EMP030',
    name: 'Priyanka Sharma',
    email: 'priyanka.sharma@company.com',
    department: 'Finance',
    designation: 'Financial Analyst',
    hireDate: '15:08:2024',
    status: 'Active',
    phone: '+91 9876500030',
    salary: 58000
  }
];

export const mockAttendance: AttendanceRecord[] = [
  {
    id: '1',
    date: '06:08:2025',
    employeeId: 'EMP001',
    employeeName: 'Rahul Sharma',
    department: 'Engineering',
    checkIn: '09:00:00',
    checkOut: '17:30:00',
    hours: 8.5,
    status: 'Present'
  },
  {
    id: '2',
    date: '06:08:2025',
    employeeId: 'EMP002',
    employeeName: 'Priya Patel',
    department: 'HR',
    checkIn: '09:00:00',
    checkOut: '17:30:00',
    hours: 8.5,
    status: 'Present'
  },
  {
    id: '3',
    date: '06:08:2025',
    employeeId: 'EMP003',
    employeeName: 'Amit Verma',
    department: 'Marketing',
    checkIn: '09:00:00',
    checkOut: '17:30:00',
    hours: 8.5,
    status: 'Present'
  },
  {
    id: '4',
    date: '06:08:2025',
    employeeId: 'EMP004',
    employeeName: 'Neha Gupta',
    department: 'Finance',
    checkIn: '09:00:00',
    checkOut: '17:30:00',
    hours: 8.5,
    status: 'Present'
  },
  {
    id: '5',
    date: '06:08:2025',
    employeeId: 'EMP005',
    employeeName: 'Ananya Desai',
    department: 'Marketing',
    checkIn: '09:00:00',
    checkOut: '17:30:00',
    hours: 8.5,
    status: 'Present'
  },
  {
    id: '6',
    date: '06:08:2025',
    employeeId: 'EMP006',
    employeeName: 'Vikram Malhotra',
    department: 'Engineering',
    checkIn: '09:00:00',
    checkOut: '17:30:00',
    hours: 8.5,
    status: 'Present'
  },
  {
    id: '7',
    date: '06:08:2025',
    employeeId: 'EMP007',
    employeeName: 'Pooja Reddy',
    department: 'HR',
    checkIn: '09:00:00',
    checkOut: '17:30:00',
    hours: 8.5,
    status: 'Present'
  },
  {
    id: '8',
    date: '06:08:2025',
    employeeId: 'EMP008',
    employeeName: 'Arjun Mehta',
    department: 'Sales',
    checkIn: '09:00:00',
    checkOut: '17:30:00',
    hours: 8.5,
    status: 'Present'
  },
  // Attendance for new employees (July-August 15, 2024)
  { id: '21', date: '01:07:2024', employeeId: 'EMP021', employeeName: 'Ravi Kumar', department: 'Engineering', checkIn: '09:15:00', checkOut: '18:00:00', hours: 8.75, status: 'Present' },
  { id: '22', date: '08:07:2024', employeeId: 'EMP021', employeeName: 'Ravi Kumar', department: 'Engineering', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '23', date: '15:07:2024', employeeId: 'EMP021', employeeName: 'Ravi Kumar', department: 'Engineering', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '24', date: '01:08:2024', employeeId: 'EMP021', employeeName: 'Ravi Kumar', department: 'Engineering', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '25', date: '08:08:2024', employeeId: 'EMP021', employeeName: 'Ravi Kumar', department: 'Engineering', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '26', date: '15:08:2024', employeeId: 'EMP021', employeeName: 'Ravi Kumar', department: 'Engineering', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '27', date: '05:07:2024', employeeId: 'EMP022', employeeName: 'Sneha Agarwal', department: 'HR', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '28', date: '12:07:2024', employeeId: 'EMP022', employeeName: 'Sneha Agarwal', department: 'HR', checkIn: '09:00:00', checkOut: '13:00:00', hours: 4, status: 'Half Day' },
  { id: '29', date: '22:07:2024', employeeId: 'EMP022', employeeName: 'Sneha Agarwal', department: 'HR', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '30', date: '05:08:2024', employeeId: 'EMP022', employeeName: 'Sneha Agarwal', department: 'HR', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '31', date: '12:08:2024', employeeId: 'EMP022', employeeName: 'Sneha Agarwal', department: 'HR', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '32', date: '10:07:2024', employeeId: 'EMP023', employeeName: 'Karan Singh', department: 'Marketing', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '33', date: '22:07:2024', employeeId: 'EMP023', employeeName: 'Karan Singh', department: 'Marketing', checkIn: '09:45:00', checkOut: '17:30:00', hours: 7.75, status: 'Late' },
  { id: '34', date: '01:08:2024', employeeId: 'EMP023', employeeName: 'Karan Singh', department: 'Marketing', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '35', date: '08:08:2024', employeeId: 'EMP023', employeeName: 'Karan Singh', department: 'Marketing', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '36', date: '15:08:2024', employeeId: 'EMP023', employeeName: 'Karan Singh', department: 'Marketing', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '37', date: '15:07:2024', employeeId: 'EMP024', employeeName: 'Meera Joshi', department: 'Finance', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '38', date: '22:07:2024', employeeId: 'EMP024', employeeName: 'Meera Joshi', department: 'Finance', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '39', date: '05:08:2024', employeeId: 'EMP024', employeeName: 'Meera Joshi', department: 'Finance', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '40', date: '12:08:2024', employeeId: 'EMP024', employeeName: 'Meera Joshi', department: 'Finance', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '41', date: '20:07:2024', employeeId: 'EMP025', employeeName: 'Rohit Sharma', department: 'Sales', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '42', date: '01:08:2024', employeeId: 'EMP025', employeeName: 'Rohit Sharma', department: 'Sales', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '43', date: '08:08:2024', employeeId: 'EMP025', employeeName: 'Rohit Sharma', department: 'Sales', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '44', date: '15:08:2024', employeeId: 'EMP025', employeeName: 'Rohit Sharma', department: 'Sales', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '45', date: '25:07:2024', employeeId: 'EMP026', employeeName: 'Anjali Nair', department: 'Engineering', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '46', date: '05:08:2024', employeeId: 'EMP026', employeeName: 'Anjali Nair', department: 'Engineering', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '47', date: '12:08:2024', employeeId: 'EMP026', employeeName: 'Anjali Nair', department: 'Engineering', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '48', date: '01:08:2024', employeeId: 'EMP027', employeeName: 'Deepak Gupta', department: 'Engineering', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '49', date: '08:08:2024', employeeId: 'EMP027', employeeName: 'Deepak Gupta', department: 'Engineering', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '50', date: '15:08:2024', employeeId: 'EMP027', employeeName: 'Deepak Gupta', department: 'Engineering', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '51', date: '05:08:2024', employeeId: 'EMP028', employeeName: 'Kavya Reddy', department: 'Marketing', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '52', date: '12:08:2024', employeeId: 'EMP028', employeeName: 'Kavya Reddy', department: 'Marketing', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '53', date: '15:08:2024', employeeId: 'EMP028', employeeName: 'Kavya Reddy', department: 'Marketing', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '54', date: '10:08:2024', employeeId: 'EMP029', employeeName: 'Suresh Patel', department: 'Engineering', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '55', date: '15:08:2024', employeeId: 'EMP029', employeeName: 'Suresh Patel', department: 'Engineering', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' },
  { id: '56', date: '15:08:2024', employeeId: 'EMP030', employeeName: 'Priyanka Sharma', department: 'Finance', checkIn: '09:00:00', checkOut: '17:30:00', hours: 8.5, status: 'Present' }
];

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    employeeName: 'Rahul Sharma',
    department: 'Engineering',
    leaveType: 'Annual Leave',
    startDate: '01:02:2024',
    endDate: '03:02:2024',
    days: 3,
    appliedDate: '13:08:2025',
    status: 'Approved',
    reason: 'Family vacation',
    approvedBy: 'EMP002'
  },
  {
    id: '2',
    employeeId: 'EMP003',
    employeeName: 'Amit Verma',
    department: 'Marketing',
    leaveType: 'Sick Leave',
    startDate: '20:01:2024',
    endDate: '22:01:2024',
    days: 3,
    appliedDate: '13:08:2025',
    status: 'Pending',
    reason: 'Fever and cold'
  },
  {
    id: '3',
    employeeId: 'EMP004',
    employeeName: 'Neha Gupta',
    department: 'Finance',
    leaveType: 'Personal Leave',
    startDate: '15:02:2024',
    endDate: '15:02:2024',
    days: 1,
    appliedDate: '13:08:2025',
    status: 'Approved',
    reason: 'Personal work',
    approvedBy: 'EMP002'
  },
  {
    id: '4',
    employeeId: 'EMP021',
    employeeName: 'Ravi Kumar',
    department: 'Engineering',
    leaveType: 'Annual Leave',
    startDate: '25:08:2024',
    endDate: '27:08:2024',
    days: 3,
    appliedDate: '15:08:2024',
    status: 'Pending',
    reason: 'Family function'
  },
  {
    id: '5',
    employeeId: 'EMP022',
    employeeName: 'Sneha Agarwal',
    department: 'HR',
    leaveType: 'Sick Leave',
    startDate: '20:08:2024',
    endDate: '21:08:2024',
    days: 2,
    appliedDate: '18:08:2024',
    status: 'Approved',
    reason: 'Medical checkup',
    approvedBy: 'hr001'
  },
  {
    id: '6',
    employeeId: 'EMP023',
    employeeName: 'Karan Singh',
    department: 'Marketing',
    leaveType: 'Personal Leave',
    startDate: '30:08:2024',
    endDate: '30:08:2024',
    days: 1,
    appliedDate: '25:08:2024',
    status: 'Pending',
    reason: 'Personal work'
  },
  {
    id: '7',
    employeeId: 'EMP025',
    employeeName: 'Rohit Sharma',
    department: 'Sales',
    leaveType: 'Annual Leave',
    startDate: '28:08:2024',
    endDate: '30:08:2024',
    days: 3,
    appliedDate: '20:08:2024',
    status: 'Approved',
    reason: 'Vacation',
    approvedBy: 'hr001'
  },
  {
    id: '8',
    employeeId: 'EMP027',
    employeeName: 'Deepak Gupta',
    department: 'Engineering',
    leaveType: 'Emergency Leave',
    startDate: '22:08:2024',
    endDate: '22:08:2024',
    days: 1,
    appliedDate: '21:08:2024',
    status: 'Approved',
    reason: 'Family emergency',
    approvedBy: 'tl001'
  }
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Prepare Monthly Attendance Report',
    description: 'Generate and analyze monthly attendance report for all departments',
    assignedTo: 'EMP001',
    assignedBy: 'EMP002',
    assignedDate: '01:08:2025',
    dueDate: '15:08:2025',
    priority: 'High',
    status: 'In Progress',
    progress: 75,
    department: 'Engineering',
    estimatedHours: 8
  },
  {
    id: '2',
    title: 'Update Employee Handbook',
    description: 'Review and update the employee handbook with new policies',
    assignedTo: 'EMP002',
    assignedBy: 'Admin',
    assignedDate: '05:08:2025',
    dueDate: '20:08:2025',
    priority: 'Medium',
    status: 'Not Started',
    progress: 0,
    department: 'HR',
    estimatedHours: 12
  },
  // Tasks for new employees
  {
    id: '3',
    title: 'Setup Development Environment',
    description: 'Configure development tools and access for new engineer',
    assignedTo: 'EMP021',
    assignedBy: 'tl001',
    assignedDate: '01:07:2024',
    dueDate: '05:07:2024',
    priority: 'High',
    status: 'Completed',
    progress: 100,
    department: 'Engineering',
    estimatedHours: 6
  },
  {
    id: '4',
    title: 'Complete Onboarding Documentation',
    description: 'Fill out all required HR forms and complete orientation',
    assignedTo: 'EMP022',
    assignedBy: 'hr001',
    assignedDate: '05:07:2024',
    dueDate: '10:07:2024',
    priority: 'High',
    status: 'Completed',
    progress: 100,
    department: 'HR',
    estimatedHours: 4
  },
  {
    id: '5',
    title: 'Create Social Media Campaign',
    description: 'Develop and execute social media campaign for Q3 product launch',
    assignedTo: 'EMP023',
    assignedBy: 'EMP003',
    assignedDate: '15:07:2024',
    dueDate: '30:08:2024',
    priority: 'High',
    status: 'In Progress',
    progress: 60,
    department: 'Marketing',
    estimatedHours: 20
  },
  {
    id: '6',
    title: 'Financial Data Analysis',
    description: 'Analyze Q2 financial data and prepare summary report',
    assignedTo: 'EMP024',
    assignedBy: 'EMP004',
    assignedDate: '20:07:2024',
    dueDate: '25:08:2024',
    priority: 'Medium',
    status: 'In Progress',
    progress: 40,
    department: 'Finance',
    estimatedHours: 15
  },
  {
    id: '7',
    title: 'Client Outreach Program',
    description: 'Contact potential clients and schedule product demos',
    assignedTo: 'EMP025',
    assignedBy: 'EMP008',
    assignedDate: '25:07:2024',
    dueDate: '20:08:2024',
    priority: 'High',
    status: 'In Progress',
    progress: 70,
    department: 'Sales',
    estimatedHours: 12
  },
  {
    id: '8',
    title: 'QA Testing for Mobile App',
    description: 'Comprehensive testing of mobile application features',
    assignedTo: 'EMP026',
    assignedBy: 'tl001',
    assignedDate: '01:08:2024',
    dueDate: '25:08:2024',
    priority: 'High',
    status: 'In Progress',
    progress: 50,
    department: 'Engineering',
    estimatedHours: 25
  },
  {
    id: '9',
    title: 'Infrastructure Optimization',
    description: 'Optimize server infrastructure and reduce deployment time',
    assignedTo: 'EMP027',
    assignedBy: 'tl001',
    assignedDate: '05:08:2024',
    dueDate: '30:08:2024',
    priority: 'Medium',
    status: 'In Progress',
    progress: 30,
    department: 'Engineering',
    estimatedHours: 18
  },
  {
    id: '10',
    title: 'Content Creation for Website',
    description: 'Write blog posts and update website content',
    assignedTo: 'EMP028',
    assignedBy: 'EMP003',
    assignedDate: '08:08:2024',
    dueDate: '25:08:2024',
    priority: 'Medium',
    status: 'Not Started',
    progress: 0,
    department: 'Marketing',
    estimatedHours: 10
  },
  {
    id: '11',
    title: 'Database Performance Optimization',
    description: 'Optimize database queries and improve system performance',
    assignedTo: 'EMP029',
    assignedBy: 'tl001',
    assignedDate: '12:08:2024',
    dueDate: '30:08:2024',
    priority: 'High',
    status: 'In Progress',
    progress: 25,
    department: 'Engineering',
    estimatedHours: 16
  },
  {
    id: '12',
    title: 'Monthly Financial Reconciliation',
    description: 'Reconcile accounts and prepare monthly financial statements',
    assignedTo: 'EMP030',
    assignedBy: 'EMP004',
    assignedDate: '16:08:2024',
    dueDate: '31:08:2024',
    priority: 'High',
    status: 'Not Started',
    progress: 0,
    department: 'Finance',
    estimatedHours: 12
  }
];
