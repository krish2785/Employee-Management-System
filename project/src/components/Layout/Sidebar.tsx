import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar, 
  BarChart3, 
  ClipboardList,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { canAccessRoute } from '../../utils/permissions';

const Sidebar = () => {
  const { user } = useAuth();

  // Define all possible menu items with their required permissions
  const allMenuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'hr_manager', 'team_lead', 'employee'] },
    { name: 'Employees', path: '/employees', icon: Users, roles: ['admin', 'hr_manager'] },
    { name: 'Attendance', path: '/attendance', icon: Clock, roles: ['admin', 'hr_manager', 'team_lead'] },
    { name: 'Leave Management', path: '/leave', icon: Calendar, roles: ['admin', 'hr_manager', 'team_lead'] },
    { name: 'Tasks', path: '/tasks', icon: ClipboardList, roles: ['admin', 'hr_manager', 'team_lead'] },
    { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['admin', 'hr_manager', 'team_lead'] },
    { name: 'My Profile', path: '/profile', icon: Users, roles: ['employee', 'hr_manager', 'team_lead'] },
    { name: 'My Attendance', path: '/my-attendance', icon: Clock, roles: ['employee', 'hr_manager', 'team_lead'] },
    { name: 'My Leave', path: '/my-leave', icon: Calendar, roles: ['employee', 'hr_manager', 'team_lead'] },
    { name: 'My Tasks', path: '/my-tasks', icon: ClipboardList, roles: ['employee', 'hr_manager', 'team_lead'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['admin', 'hr_manager', 'team_lead', 'employee'] }
  ];

  // Filter menu items based on user role and route access
  const menuItems = allMenuItems.filter(item => {
    if (!user?.role) return false;
    return item.roles.includes(user.role) && canAccessRoute(item.path, user.role);
  });



  return (
    <div className="bg-blue-600 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <div className="bg-white text-blue-600 p-2 rounded-lg font-bold text-xl">
            EMS
          </div>
          <div>
            <h1 className="text-lg font-semibold">Employee Management</h1>
            <p className="text-blue-200 text-sm">System</p>
          </div>
        </div>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                }`
              }
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;