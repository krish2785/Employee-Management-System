import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'hr_manager' | 'team_lead' | 'employee';
  employeeId: string;
  name: string;
  department: string;
  designation: string;
  profilePicture?: string;
  teamMembers?: string[]; // For team leads
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to map backend user data to frontend user format
const mapBackendUserToFrontend = (backendUser: any, username: string): User => {
  // This is a simplified mapping - you may need to adjust based on actual backend response
  // For now, we'll use the mock user structure but populate with real data when available
  const mockUsers = {
    admin: {
      id: '1',
      username: 'admin',
      email: 'admin@company.com',
      role: 'admin' as const,
      employeeId: 'admin',
      name: 'System Administrator',
      department: 'IT',
      designation: 'System Admin'
    },
    'hr001': {
      id: '32',
      username: 'hr001',
      email: 'hr.manager@company.com',
      role: 'hr_manager' as const,
      employeeId: 'hr001',
      name: 'Sarah Johnson',
      department: 'HR',
      designation: 'HR Manager'
    },
    'tl001': {
      id: '33',
      username: 'tl001',
      email: 'team.lead@company.com',
      role: 'team_lead' as const,
      employeeId: 'tl001',
      name: 'Michael Chen',
      department: 'Engineering',
      designation: 'Engineering Team Lead'
    }
  };

  // For employees, use emp001, emp002, etc. pattern
  if (username.startsWith('emp')) {
    return {
      id: backendUser?.id?.toString() || username,
      username: username,
      email: backendUser?.email || `${username}@company.com`,
      role: 'employee' as const,
      employeeId: username,
      name: backendUser?.first_name && backendUser?.last_name 
        ? `${backendUser.first_name} ${backendUser.last_name}`
        : username,
      department: backendUser?.department || 'General',
      designation: backendUser?.designation || 'Employee'
    };
  }

  // For predefined users, return mock data
  return mockUsers[username as keyof typeof mockUsers] || {
    id: backendUser?.id?.toString() || '1',
    username: username,
    email: backendUser?.email || `${username}@company.com`,
    role: 'employee' as const,
    employeeId: username,
    name: backendUser?.first_name && backendUser?.last_name 
      ? `${backendUser.first_name} ${backendUser.last_name}`
      : username,
    department: backendUser?.department || 'General',
    designation: backendUser?.designation || 'Employee'
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError('');
    
    try {
      // Use actual backend authentication
      const response = await authAPI.login(username, password);
      
      if (response && response.user && response.token) {
        // Optionally fetch employee details by username/employee_id
        let backendUserData = null;
        try {
          const employeesResponse = await fetch(`http://localhost:8000/api/employees/?employee_id=${username}`, {
            headers: { 'Authorization': `Token ${response.token}` }
          });
          if (employeesResponse.ok) {
            const employeesData = await employeesResponse.json();
            if (Array.isArray(employeesData) && employeesData.length > 0) {
              backendUserData = employeesData[0];
            }
          }
        } catch {}

        const userData = mapBackendUserToFrontend(backendUserData, username);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.token);
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    try { authAPI.logout(); } catch {}
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}