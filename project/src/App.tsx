import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Leave from './pages/Leave';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';
import EmployeeProfile from './pages/EmployeeProfile';
import EmployeeAttendance from './pages/EmployeeAttendance';
import EmployeeLeave from './pages/EmployeeLeave';
import EmployeeTasks from './pages/EmployeeTasks';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <NotificationProvider>
            <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route
                  path="employees"
                  element={
                    <ProtectedRoute adminOnly>
                      <Employees />
                    </ProtectedRoute>
                  }
                />
                <Route path="attendance" element={<Attendance />} />
                <Route path="leave" element={<Leave />} />
                <Route path="tasks" element={<Tasks />} />
                <Route
                  path="reports"
                  element={
                    <ProtectedRoute adminOnly>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                <Route path="settings" element={<Settings />} />
                
                {/* Employee Routes */}
                <Route path="profile" element={<EmployeeProfile />} />
                <Route path="my-attendance" element={<EmployeeAttendance />} />
                <Route path="my-leave" element={<EmployeeLeave />} />
                <Route path="my-tasks" element={<EmployeeTasks />} />
              </Route>
            </Routes>
          </div>
            </Router>
          </NotificationProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;