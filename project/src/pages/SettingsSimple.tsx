import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Building, 
  User, 
  Clock, 
  DollarSign,
  Shield, 
  Zap,
  Palette, 
  Bell, 
  Save,
  CheckCircle,
  Globe,
  Calendar,
  Lock,
  Smartphone,
  CreditCard,
  FileText,
  Users,
  Mail,
  Volume2
} from 'lucide-react';

const settingsData = {
  "General Settings": [
    "Company Profile",
    "Working Days & Hours",
    "Holidays & Events Calendar",
    "Time Zone & Localization"
  ],
  "User Account": [
    "User Profiles",
    "Password & Security",
    "Device Management",
    "Notification Preferences"
  ],
  "Attendance & Leave": [
    "Attendance Policies",
    "Leave Policies",
    "Shift Management",
    "Leave Approvals"
  ],
  "Finance Settings": [
    "Expense Reimbursements",
    "Department Budget Allocation",
    "Tax & Compliance Settings",
    "Payment Gateways"
  ],
  "Payroll Settings": [
    "Salary Structure",
    "Pay Cycle Setup",
    "Statutory Compliance",
    "Bonus & Incentive Policies"
  ],
  "Roles & Permissions": [
    "Role Definitions",
    "Permission Matrix",
    "Custom Roles",
    "Audit Logs"
  ],
  "Integrations": [
    { name: "Slack", url: "https://slack.com" },
    { name: "Microsoft Teams", url: "https://www.microsoft.com/en-in/microsoft-teams/group-chat-software" },
    { name: "Zoom", url: "https://zoom.us" },
    { name: "Google Workspace", url: "https://workspace.google.com" },
    { name: "Office 365", url: "https://www.microsoft.com/microsoft-365" },
    { name: "Trello", url: "https://trello.com" },
    { name: "Asana", url: "https://asana.com" },
    { name: "Jira", url: "https://www.atlassian.com/software/jira" },
    { name: "GitHub", url: "https://github.com" },
    { name: "Dropbox", url: "https://dropbox.com" }
  ],
  "Theme & Appearance": [
    "Light/Dark Mode",
    "Custom Branding",
    "Dashboard Layouts",
    "Accessibility Settings"
  ],
  "Notifications": [
    "Email Notifications",
    "Push Notifications",
    "SMS Alerts",
    "Custom Alerts"
  ]
};

const SettingsSimple = () => {
  const [activeTab, setActiveTab] = useState('General Settings');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    companyName: 'TechCorp Solutions',
    companyEmail: 'info@techcorp.com',
    workingHours: '9:00 AM - 6:00 PM',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    timeZone: 'Asia/Kolkata',
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  });

  const handleSave = () => {
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const tabs = [
    { id: 'general', name: 'General Settings', icon: Building },
    { id: 'account', name: 'User Account', icon: User },
    { id: 'attendance', name: 'Attendance & Leave', icon: Clock },
    { id: 'finance', name: 'Finance Settings', icon: DollarSign },
    { id: 'payroll', name: 'Payroll Settings', icon: DollarSign },
    { id: 'roles', name: 'Roles & Permissions', icon: Shield },
    { id: 'integrations', name: 'Integrations', icon: Zap },
    { id: 'theme', name: 'Theme & Appearance', icon: Palette },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  const renderRolesPermissions = () => {
    const roleDescriptions: Record<string, string[]> = {
      'Admin / Super Admin': [
        'Full access to all modules',
        'Manage users, roles, integrations, and system settings',
      ],
      'HR Manager': [
        'Manage employees, leaves, attendance',
        'Access payroll, performance reviews',
        'Limited access to system settings',
      ],
      'Team Manager / Supervisor': [
        'Approve leaves for their team',
        'View and track attendance of their team',
        'Assign tasks / schedules',
      ],
      'Employee': [
        'View their profile, attendance, salary slips',
        'Apply for leave',
        'Chat with HR chatbot',
      ],
    };
    
    const modules = ['Employees', 'Attendance', 'Leave Management', 'Tasks', 'Reports', 'Settings'];
    const permissions = ['View', 'Create', 'Edit', 'Delete', 'Approve'] as const;
    
    const defaultMatrix: Record<string, Record<string, Record<typeof permissions[number], boolean>>> = {
      'Admin / Super Admin': Object.fromEntries(modules.map(m => [m, { View: true, Create: true, Edit: true, Delete: true, Approve: true }])) as any,
      'HR Manager': {
        Employees: { View: true, Create: true, Edit: true, Delete: false, Approve: false },
        Attendance: { View: true, Create: false, Edit: false, Delete: false, Approve: false },
        'Leave Management': { View: true, Create: true, Edit: true, Delete: false, Approve: true },
        Tasks: { View: true, Create: true, Edit: true, Delete: false, Approve: false },
        Reports: { View: true, Create: false, Edit: false, Delete: false, Approve: false },
        Settings: { View: true, Create: false, Edit: false, Delete: false, Approve: false },
      } as any,
      'Team Manager / Supervisor': {
        Employees: { View: true, Create: false, Edit: false, Delete: false, Approve: false },
        Attendance: { View: true, Create: false, Edit: false, Delete: false, Approve: false },
        'Leave Management': { View: true, Create: false, Edit: false, Delete: false, Approve: true },
        Tasks: { View: true, Create: true, Edit: true, Delete: false, Approve: false },
        Reports: { View: true, Create: false, Edit: false, Delete: false, Approve: false },
        Settings: { View: false, Create: false, Edit: false, Delete: false, Approve: false },
      } as any,
      Employee: {
        Employees: { View: false, Create: false, Edit: false, Delete: false, Approve: false },
        Attendance: { View: true, Create: true, Edit: true, Delete: false, Approve: false },
        'Leave Management': { View: true, Create: true, Edit: false, Delete: false, Approve: false },
        Tasks: { View: true, Create: false, Edit: true, Delete: false, Approve: false },
        Reports: { View: false, Create: false, Edit: false, Delete: false, Approve: false },
        Settings: { View: true, Create: false, Edit: false, Delete: false, Approve: false },
      } as any,
    };
    
    const roleKeys = Object.keys(roleDescriptions);
    const [activeRole, setActiveRole] = useState(roleKeys[0]);
    
    return (
      <div className="space-y-6">
        <div className="flex space-x-4 border-b">
          {roleKeys.map((rk) => (
            <button 
              key={rk} 
              onClick={() => setActiveRole(rk)} 
              className={`px-4 py-2 ${activeRole === rk ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              {rk}
            </button>
          ))}
        </div>
        <ul className="list-disc pl-6 text-sm text-gray-700">
          {roleDescriptions[activeRole].map((d) => (<li key={d}>{d}</li>))}
        </ul>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                {permissions.map(p => (<th key={p} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{p}</th>))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {modules.map(m => (
                <tr key={m}>
                  <td className="px-4 py-2 text-sm text-gray-900">{m}</td>
                  {permissions.map(p => (
                    <td key={p} className="px-4 py-2 text-sm">
                      <input 
                        type="checkbox" 
                        checked={defaultMatrix[activeRole]?.[m]?.[p] || false} 
                        readOnly 
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
            <p className="text-gray-600">Configure basic company settings.</p>
          </div>
        );
      case 'account':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">User Account</h3>
            <p className="text-gray-600">Manage your account preferences.</p>
          </div>
        );
      case 'attendance':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Attendance & Leave</h3>
            <p className="text-gray-600">Configure attendance and leave policies.</p>
          </div>
        );
      case 'finance':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Finance Settings</h3>
            <p className="text-gray-600">Configure salary components, reimbursements, and financial policies.</p>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">Salary Components</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <span>Basic Salary (40%)</span>
                  <span className="text-green-600">Taxable</span>
                </div>
                <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <span>HRA (20%)</span>
                  <span className="text-green-600">Taxable</span>
                </div>
                <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <span>Special Allowance (₹5000)</span>
                  <span className="text-green-600">Taxable</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'payroll':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Payroll Settings</h3>
            <p className="text-gray-600">Configure payroll schedule, templates, and compliance settings.</p>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">Payroll Schedule</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pay Cycle</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option>Monthly</option>
                    <option>Bi-weekly</option>
                    <option>Weekly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cut-off Day</label>
                  <input type="number" value="25" className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pay Day</label>
                  <input type="number" value="1" className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
              </div>
            </div>
          </div>
        );
      case 'roles':
        return renderRolesPermissions();
      case 'integrations':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Integrations</h3>
            <p className="text-gray-600">Connect with third-party services and APIs.</p>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">Available Integrations</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <span>Slack Integration</span>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Connect</button>
                </div>
                <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <span>Microsoft Teams</span>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Connect</button>
                </div>
                <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <span>Google Calendar</span>
                  <button className="px-3 py-1 bg-green-600 text-white rounded text-sm">Connected</button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'theme':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Theme & Appearance</h3>
            <p className="text-gray-600">Customize the look and feel.</p>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            <p className="text-gray-600">Manage notification preferences.</p>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <SettingsIcon size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Coming Soon</h3>
            <p className="text-gray-600">This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your system preferences and configurations</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Save size={20} />
          <span>Save Changes</span>
        </button>
      </div>

      {showSaveSuccess ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center space-x-2">
          <CheckCircle size={20} />
          <span>Settings saved successfully!</span>
        </div>
      ) : null}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsSimple;
