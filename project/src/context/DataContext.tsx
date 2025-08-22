import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
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
}

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
  attachments?: any[];
}

interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joining_date: string;
  salary: number;
  status: string;
}

// State interface
interface DataState {
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  tasks: Task[];
  employee: Employee | null;
}

// Action types
type DataAction =
  | { type: 'SET_ATTENDANCE_RECORDS'; payload: AttendanceRecord[] }
  | { type: 'ADD_ATTENDANCE_RECORD'; payload: AttendanceRecord }
  | { type: 'SET_LEAVE_REQUESTS'; payload: LeaveRequest[] }
  | { type: 'ADD_LEAVE_REQUEST'; payload: LeaveRequest }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'SET_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; payload: Partial<Employee> };

// Initial state
const initialState: DataState = {
  attendanceRecords: [],
  leaveRequests: [],
  tasks: [],
  employee: null,
};

// Reducer
function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_ATTENDANCE_RECORDS':
      return { ...state, attendanceRecords: action.payload };
    case 'ADD_ATTENDANCE_RECORD':
      return { 
        ...state, 
        attendanceRecords: [action.payload, ...state.attendanceRecords] 
      };
    case 'SET_LEAVE_REQUESTS':
      return { ...state, leaveRequests: action.payload };
    case 'ADD_LEAVE_REQUEST':
      return { 
        ...state, 
        leaveRequests: [action.payload, ...state.leaveRequests] 
      };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        )
      };
    case 'SET_EMPLOYEE':
      return { ...state, employee: action.payload };
    case 'UPDATE_EMPLOYEE':
      return { 
        ...state, 
        employee: state.employee ? { ...state.employee, ...action.payload } : null 
      };
    default:
      return state;
  }
}

// Context
interface DataContextType {
  state: DataState;
  dispatch: React.Dispatch<DataAction>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider component
interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  return (
    <DataContext.Provider value={{ state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
}

// Hook to use the data context
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
