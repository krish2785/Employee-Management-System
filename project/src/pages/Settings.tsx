import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Building, 
  User, 
  Clock, 
  DollarSign, 
  Zap, 
  Palette, 
  Bell, 
  Upload,
  Mail,
  Phone,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface SettingsState {
  // General Settings
  companyName: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  language: string;
  supportEmail: string;
  supportPhone: string;
  companyAddress: string;

  // User Account Settings
  enable2FA: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  signature: string;

  // Attendance & Leave Settings
  workingHours: {
    start: string;
    end: string;
  };
  weekends: string[];
  overtimeEnabled: boolean;
  leaveTypes: string[];
  autoApproval: boolean;

  // Payroll Settings (legacy summary)
  salaryStructure: {
    basic: number;
    hra: number;
    allowances: number;
    deductions: number;
  };
  taxRules: string;
  paymentCycle: string;
  bankIntegration: boolean;

  // Finance Section (detailed)
  salaryComponents: Array<{ id: string; name: string; type: 'Fixed %' | 'Fixed Value' | 'Reimbursement'; defaultValue: string; taxable: boolean }>;
  reimbursements: Array<{ id: string; type: string; monthlyLimit: string; requiresApproval: boolean }>;
  loans: { enabled: boolean; maxAmount: string; maxInstallments: string };
  deductionsSetup: { pfRate: string; esiRate: string; tdsEnabled: boolean; customNotes: string };
  financePermissions: { canViewFinance: string[]; canEditFinance: string[] };
  currencyAndTax: { baseCurrency: string; countryTaxLabel: string; countryTaxRate: string };

  // Payroll Section (detailed)
  payrollSchedule: { cycle: 'Monthly' | 'Bi-weekly' | 'Weekly'; cutOffDay: string; payDay: string };
  payslipTemplate: { showBasic: boolean; showHra: boolean; showOvertime: boolean; notes: string };
  overtimeRules: Array<{ id: string; name: string; ratePerHour: string; appliesTo: string }>;
  leaveEncashment: { minLeaves: string; encashRate: 'Basic Salary' | 'Full Pay' };
  compliance: { pfRate: string; esiRate: string; autoTds: boolean };
  payslipDelivery: { autoEmail: boolean; allowDownload: boolean };

  // Roles & Permissions
  roles: {
    admin: string[];
    hr: string[];
    manager: string[];
    employee: string[];
  };

  // Integrations
  emailService: string;
  smsGateway: string;
  chatbotEnabled: boolean;
  thirdPartyAPIs: string[];

  // Theme & Appearance
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  layout: 'compact' | 'spacious';
  dashboardWidgets: string[];

  // Notifications
  notificationSettings: {
    attendance: boolean;
    leave: boolean;
    tasks: boolean;
    reports: boolean;
    alerts: boolean;
  };

  // System & Security
  backupEnabled: boolean;
  auditLogs: boolean;
  passwordPolicy: {
    minLength: number;
    requireSpecial: boolean;
    requireNumbers: boolean;
    requireUppercase: boolean;
  };
  sessionTimeout: number;
  accountLockout: number;

  // Advanced Settings
  apiKeys: string[];
  webhooks: string[];
  customFields: string[];
  workflowAutomation: boolean;
}

const ThemeSelector = ({ settings, setSettings }: { settings: any, setSettings: (s: any) => void }) => {
    const { theme, setTheme, setFontFamily } = useTheme();
    
    const applyThemeChange = (next: 'light' | 'dark' | 'auto') => {
        setSettings({ ...settings, theme: next });
        setTheme(next);
    };

    useEffect(() => {
        setFontFamily(
            settings.fontFamily === 'Inter' ? 'Inter, ui-sans-serif, system-ui' :
            settings.fontFamily === 'Roboto' ? 'Roboto, ui-sans-serif, system-ui' :
            settings.fontFamily === 'Open Sans' ? '"Open Sans", ui-sans-serif, system-ui' :
            settings.fontFamily === 'Lato' ? 'Lato, ui-sans-serif, system-ui' : settings.fontFamily
        );
    }, [settings.fontFamily, setFontFamily]);

    return (
        <div className="grid grid-cols-3 gap-4">
            {[
                { value: 'light', label: 'Light', icon: '☀️' },
                { value: 'dark', label: 'Dark', icon: '🌙' },
                { value: 'auto', label: 'Auto', icon: '🔄' }
            ].map((t) => (
                <button
                    key={t.value}
                    onClick={() => applyThemeChange(t.value as any)}
                    className={`p-4 border rounded-lg text-center ${
                        (settings.theme || theme) === t.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                    <div className="text-2xl mb-2">{t.icon}</div>
                    <div className="text-sm font-medium">{t.label}</div>
                </button>
            ))}
        </div>
    );
};

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<SettingsState>({
    // General Settings
    companyName: 'N.M.D.C. Kirandul',
    timezone: 'UTC+05:30',
    dateFormat: 'DD/MM/YYYY',
    currency: '₹',
    language: 'English',
    supportEmail: 'nmdckirandul@gmail.com',
    supportPhone: '07857 - 255222',
    companyAddress: 'Baildila, Dantewada , Chhattisgarh ',

    // User Account Settings
    enable2FA: false,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    signature: '',

    // Attendance & Leave Settings
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    weekends: ['Saturday', 'Sunday'],
    overtimeEnabled: true,
    leaveTypes: ['Casual Leave', 'Sick Leave', 'Annual Leave', 'Personal Leave', 'Emergency Leave'],
    autoApproval: false,

    // Payroll (legacy summary)
    salaryStructure: {
      basic: 60,
      hra: 20,
      allowances: 15,
      deductions: 5
    },
    taxRules: 'Standard Tax Rules',
    paymentCycle: 'Monthly',
    bankIntegration: false,

    // Finance - detailed defaults
    salaryComponents: [
      { id: 'sc1', name: 'Basic Salary', type: 'Fixed %', defaultValue: '40%', taxable: true },
      { id: 'sc2', name: 'HRA', type: 'Fixed %', defaultValue: '20%', taxable: true },
      { id: 'sc3', name: 'Special Allowance', type: 'Fixed Value', defaultValue: '₹5000', taxable: true },
      { id: 'sc4', name: 'Travel Allowance', type: 'Reimbursement', defaultValue: '₹2000', taxable: false }
    ],
    reimbursements: [
      { id: 'rp1', type: 'Travel', monthlyLimit: '₹5000', requiresApproval: true },
      { id: 'rp2', type: 'Meals', monthlyLimit: '₹2000', requiresApproval: false }
    ],
    loans: { enabled: false, maxAmount: '₹100000', maxInstallments: '12' },
    deductionsSetup: { pfRate: '12%', esiRate: '4%', tdsEnabled: true, customNotes: '' },
    financePermissions: { canViewFinance: ['Admin', 'HR'], canEditFinance: ['Admin'] },
    currencyAndTax: { baseCurrency: '₹', countryTaxLabel: 'GST', countryTaxRate: '18%' },

    // Payroll - detailed defaults
    payrollSchedule: { cycle: 'Monthly', cutOffDay: '25', payDay: '1' },
    payslipTemplate: { showBasic: true, showHra: true, showOvertime: true, notes: '' },
    overtimeRules: [ { id: 'ot1', name: 'Standard OT', ratePerHour: '₹200', appliesTo: 'All Employees' } ],
    leaveEncashment: { minLeaves: '10', encashRate: 'Basic Salary' },
    compliance: { pfRate: '12%', esiRate: '4%', autoTds: true },
    payslipDelivery: { autoEmail: false, allowDownload: true },

    // Roles & Permissions
    roles: {
      admin: ['Full Access'],
      hr: ['Employee Management', 'Leave Management', 'Reports'],
      manager: ['Team Management', 'Task Assignment', 'Basic Reports'],
      employee: ['Self Profile', 'Attendance', 'Leave Requests', 'Tasks']
    },

    // Integrations
    emailService: 'SMTP',
    smsGateway: 'Twilio',
    chatbotEnabled: true,
    thirdPartyAPIs: ['Slack', 'Teams', 'Zoom'],

    // Theme & Appearance
    theme: 'light',
    primaryColor: '#3B82F6',
    secondaryColor: '#6B7280',
    accentColor: '#10B981',
    fontFamily: 'Inter',
    layout: 'spacious',
    dashboardWidgets: ['Attendance', 'Leaves', 'Tasks', 'Reports'],

    // Notifications
    notificationSettings: {
      attendance: true,
      leave: true,
      tasks: true,
      reports: true,
      alerts: true
    },

    // System & Security
    backupEnabled: true,
    auditLogs: true,
    passwordPolicy: {
      minLength: 8,
      requireSpecial: true,
      requireNumbers: true,
      requireUppercase: true
    },
    sessionTimeout: 30,
    accountLockout: 5,

    // Advanced Settings
    apiKeys: [],
    webhooks: [],
    customFields: [],
    workflowAutomation: true
  });

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const handleSave = () => {
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  // Filter tabs based on user role
  const allTabs = [
    { id: 'general', name: 'General Settings', icon: Building },
    { id: 'account', name: 'User Account', icon: User },
    { id: 'attendance', name: 'Attendance & Leave', icon: Clock },
    { id: 'finance', name: 'Finance Settings', icon: DollarSign },
    { id: 'payroll', name: 'Payroll Settings', icon: DollarSign },
    { id: 'integrations', name: 'Integrations', icon: Zap },
    { id: 'theme', name: 'Theme & Appearance', icon: Palette },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  const tabs = allTabs.filter(tab => {
    if (user?.role === 'employee') {
      // Employees cannot access finance, payroll, or attendance settings
      return !['finance', 'payroll', 'attendance'].includes(tab.id);
    }
    return true;
  });

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
          <input
            type="text"
            value={settings.companyName}
            onChange={(e) => setSettings({...settings, companyName: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={user?.role === 'employee'}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <Upload size={24} className="text-gray-400" />
            </div>
            <button 
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={user?.role === 'employee'}
            >
              Upload Logo
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
          <select
            value={settings.timezone}
            onChange={(e) => setSettings({...settings, timezone: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={user?.role === 'employee'}
          >
            <option value="UTC+05:30">UTC+05:30 (IST)</option>
            <option value="UTC+00:00">UTC+00:00 (GMT)</option>
            <option value="UTC-05:00">UTC-05:00 (EST)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
          <select
            value={settings.dateFormat}
            onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={user?.role === 'employee'}
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <select
            value={settings.currency}
            onChange={(e) => setSettings({...settings, currency: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={user?.role === 'employee'}
          >
            <option value="₹">₹ (INR)</option>
            <option value="$">$ (USD)</option>
            <option value="€">€ (EUR)</option>
          </select>
        </div>
      </div>

      {/* Hide contact information for employees */}
      {user?.role !== 'employee' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
              <input
                type="tel"
                value={settings.supportPhone}
                onChange={(e) => setSettings({...settings, supportPhone: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Address</label>
            <textarea
              value={settings.companyAddress}
              onChange={(e) => setSettings({...settings, companyAddress: e.target.value})}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Security</h3>
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
          </div>
          <button
            onClick={() => setSettings({...settings, enable2FA: !settings.enable2FA})}
            className={`px-4 py-2 rounded-md ${
              settings.enable2FA 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {settings.enable2FA ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
        <div className="space-y-3">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', icon: Mail },
            { key: 'smsNotifications', label: 'SMS Notifications', icon: Phone },
            { key: 'pushNotifications', label: 'Push Notifications', icon: Bell }
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon size={20} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-900">{label}</span>
              </div>
              <button
                onClick={() => setSettings({...settings, [key]: !settings[key as keyof SettingsState]})}
                className={`px-3 py-1 rounded-md text-sm ${
                  settings[key as keyof SettingsState] 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {settings[key as keyof SettingsState] ? 'On' : 'Off'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email Signature</label>
        <textarea
          value={settings.signature}
          onChange={(e) => setSettings({...settings, signature: e.target.value})}
          rows={4}
          placeholder="Enter your email signature..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  const renderAttendanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours Start</label>
          <input
            type="time"
            value={settings.workingHours.start}
            onChange={(e) => setSettings({
              ...settings, 
              workingHours: {...settings.workingHours, start: e.target.value}
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours End</label>
          <input
            type="time"
            value={settings.workingHours.end}
            onChange={(e) => setSettings({
              ...settings, 
              workingHours: {...settings.workingHours, end: e.target.value}
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Weekends</label>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
            <button
              key={day}
              onClick={() => {
                const newWeekends = settings.weekends.includes(day)
                  ? settings.weekends.filter(d => d !== day)
                  : [...settings.weekends, day];
                setSettings({...settings, weekends: newWeekends});
              }}
              className={`p-2 text-sm rounded-md ${
                settings.weekends.includes(day)
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Leave Management</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Overtime Tracking</h4>
              <p className="text-sm text-gray-600">Enable overtime calculation and tracking</p>
            </div>
            <button
              onClick={() => setSettings({...settings, overtimeEnabled: !settings.overtimeEnabled})}
              className={`px-4 py-2 rounded-md ${
                settings.overtimeEnabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {settings.overtimeEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          {user?.role === 'admin' && (
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Auto Approval</h4>
                <p className="text-sm text-gray-600">Automatically approve leave requests</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, autoApproval: !settings.autoApproval })}
                className={`px-4 py-2 rounded-md ${settings.autoApproval ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
              >
                {settings.autoApproval ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderFinanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Base Currency</label>
          <select
            value={settings.currencyAndTax.baseCurrency}
            onChange={(e) => setSettings({
              ...settings,
              currencyAndTax: { ...settings.currencyAndTax, baseCurrency: e.target.value }
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="₹">₹ (INR)</option>
            <option value="$">$ (USD)</option>
            <option value="€">€ (EUR)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country Tax Label</label>
          <input
            type="text"
            value={settings.currencyAndTax.countryTaxLabel}
            onChange={(e) => setSettings({
              ...settings,
              currencyAndTax: { ...settings.currencyAndTax, countryTaxLabel: e.target.value }
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country Tax Rate</label>
          <input
            type="text"
            value={settings.currencyAndTax.countryTaxRate}
            onChange={(e) => setSettings({
              ...settings,
              currencyAndTax: { ...settings.currencyAndTax, countryTaxRate: e.target.value }
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Salary Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settings.salaryComponents.map(component => (
            <div key={component.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{component.name}</h4>
                <p className="text-sm text-gray-600">Type: {component.type}, Default: {component.defaultValue}</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={component.taxable}
                  onChange={() => setSettings({
                    ...settings,
                    salaryComponents: settings.salaryComponents.map(sc => 
                      sc.id === component.id ? { ...sc, taxable: !sc.taxable } : sc
                    )
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Taxable</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Reimbursements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settings.reimbursements.map(reimbursement => (
            <div key={reimbursement.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{reimbursement.type}</h4>
                <p className="text-sm text-gray-600">Monthly Limit: {reimbursement.monthlyLimit}, Requires Approval: {reimbursement.requiresApproval ? 'Yes' : 'No'}</p>
              </div>
              <button
                onClick={() => setSettings({
                  ...settings,
                  reimbursements: settings.reimbursements.map(r => 
                    r.id === reimbursement.id ? { ...r, requiresApproval: !r.requiresApproval } : r
                  )
                })}
                className="px-3 py-1 rounded-md text-sm bg-blue-100 text-blue-800"
              >
                {reimbursement.requiresApproval ? 'Requires Approval' : 'No Approval'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Loans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900">Loan Management</h4>
            <p className="text-sm text-gray-600">Enable loan tracking and management</p>
            <button
              onClick={() => setSettings({...settings, loans: { ...settings.loans, enabled: !settings.loans.enabled }})}
              className={`mt-2 px-3 py-1 rounded-md text-sm ${settings.loans.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
            >
              {settings.loans.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          {settings.loans.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Loan Amount</label>
                <input
                  type="text"
                  value={settings.loans.maxAmount}
                  onChange={(e) => setSettings({...settings, loans: { ...settings.loans, maxAmount: e.target.value }})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Installments</label>
                <input
                  type="text"
                  value={settings.loans.maxInstallments}
                  onChange={(e) => setSettings({...settings, loans: { ...settings.loans, maxInstallments: e.target.value }})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Deductions Setup</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PF Rate</label>
            <input
              type="text"
              value={settings.deductionsSetup.pfRate}
              onChange={(e) => setSettings({...settings, deductionsSetup: { ...settings.deductionsSetup, pfRate: e.target.value }})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ESI Rate</label>
            <input
              type="text"
              value={settings.deductionsSetup.esiRate}
              onChange={(e) => setSettings({...settings, deductionsSetup: { ...settings.deductionsSetup, esiRate: e.target.value }})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">TDS Enabled</label>
            <input
              type="checkbox"
              checked={settings.deductionsSetup.tdsEnabled}
              onChange={() => setSettings({...settings, deductionsSetup: { ...settings.deductionsSetup, tdsEnabled: !settings.deductionsSetup.tdsEnabled }})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Notes</label>
            <textarea
              value={settings.deductionsSetup.customNotes}
              onChange={(e) => setSettings({...settings, deductionsSetup: { ...settings.deductionsSetup, customNotes: e.target.value }})}
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Finance Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900">Can View Finance</h4>
            <p className="text-sm text-gray-600">Roles allowed to view financial reports and data.</p>
            <div className="mt-2 space-y-2">
              {['Admin', 'HR', 'Manager', 'Employee'].map(role => (
                <div key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.financePermissions.canViewFinance.includes(role)}
                    onChange={() => {
                      const newCanViewFinance = settings.financePermissions.canViewFinance.includes(role)
                        ? settings.financePermissions.canViewFinance.filter(r => r !== role)
                        : [...settings.financePermissions.canViewFinance, role];
                      setSettings({...settings, financePermissions: { ...settings.financePermissions, canViewFinance: newCanViewFinance }});
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">{role}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Can Edit Finance</h4>
            <p className="text-sm text-gray-600">Roles allowed to edit financial settings and data.</p>
            <div className="mt-2 space-y-2">
              {['Admin', 'HR'].map(role => (
                <div key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.financePermissions.canEditFinance.includes(role)}
                    onChange={() => {
                      const newCanEditFinance = settings.financePermissions.canEditFinance.includes(role)
                        ? settings.financePermissions.canEditFinance.filter(r => r !== role)
                        : [...settings.financePermissions.canEditFinance, role];
                      setSettings({...settings, financePermissions: { ...settings.financePermissions, canEditFinance: newCanEditFinance }});
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">{role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPayrollSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payroll Cycle</label>
          <select
            value={settings.payrollSchedule.cycle}
            onChange={(e) => setSettings({
              ...settings,
              payrollSchedule: { ...settings.payrollSchedule, cycle: e.target.value as 'Monthly' | 'Bi-weekly' | 'Weekly' }
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Monthly">Monthly</option>
            <option value="Bi-weekly">Bi-weekly</option>
            <option value="Weekly">Weekly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payroll Cut-off Day</label>
          <input
            type="text"
            value={settings.payrollSchedule.cutOffDay}
            onChange={(e) => setSettings({
              ...settings,
              payrollSchedule: { ...settings.payrollSchedule, cutOffDay: e.target.value }
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payroll Pay Day</label>
          <input
            type="text"
            value={settings.payrollSchedule.payDay}
            onChange={(e) => setSettings({
              ...settings,
              payrollSchedule: { ...settings.payrollSchedule, payDay: e.target.value }
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Payslip Template</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900">Show Basic Salary</h4>
            <p className="text-sm text-gray-600">Include basic salary in payslips.</p>
            <input
              type="checkbox"
              checked={settings.payslipTemplate.showBasic}
              onChange={() => setSettings({...settings, payslipTemplate: { ...settings.payslipTemplate, showBasic: !settings.payslipTemplate.showBasic }})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Show HRA</h4>
            <p className="text-sm text-gray-600">Include HRA in payslips.</p>
            <input
              type="checkbox"
              checked={settings.payslipTemplate.showHra}
              onChange={() => setSettings({...settings, payslipTemplate: { ...settings.payslipTemplate, showHra: !settings.payslipTemplate.showHra }})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Show Overtime</h4>
            <p className="text-sm text-gray-600">Include overtime in payslips.</p>
            <input
              type="checkbox"
              checked={settings.payslipTemplate.showOvertime}
              onChange={() => setSettings({...settings, payslipTemplate: { ...settings.payslipTemplate, showOvertime: !settings.payslipTemplate.showOvertime }})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={settings.payslipTemplate.notes}
              onChange={(e) => setSettings({...settings, payslipTemplate: { ...settings.payslipTemplate, notes: e.target.value }})}
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Overtime Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settings.overtimeRules.map(rule => (
            <div key={rule.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{rule.name}</h4>
                <p className="text-sm text-gray-600">Rate: {rule.ratePerHour}, Applies To: {rule.appliesTo}</p>
              </div>
              <button
                onClick={() => setSettings({
                  ...settings,
                  overtimeRules: settings.overtimeRules.map(r => 
                    r.id === rule.id ? { ...r, ratePerHour: '₹200' } : r // Example default value for ratePerHour
                  )
                })}
                className="px-3 py-1 rounded-md text-sm bg-blue-100 text-blue-800"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Leave Encashment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900">Minimum Leaves for Encashment</h4>
            <p className="text-sm text-gray-600">Employees must have at least this many leaves to encash.</p>
            <input
              type="text"
              value={settings.leaveEncashment.minLeaves}
              onChange={(e) => setSettings({...settings, leaveEncashment: { ...settings.leaveEncashment, minLeaves: e.target.value }})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Encashment Rate</h4>
            <p className="text-sm text-gray-600">How leaves are converted to cash.</p>
            <select
              value={settings.leaveEncashment.encashRate}
              onChange={(e) => setSettings({...settings, leaveEncashment: { ...settings.leaveEncashment, encashRate: e.target.value as 'Basic Salary' | 'Full Pay' }})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Basic Salary">Basic Salary</option>
              <option value="Full Pay">Full Pay</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Compliance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900">PF Rate</h4>
            <p className="text-sm text-gray-600">Rate for Provident Fund.</p>
            <input
              type="text"
              value={settings.compliance.pfRate}
              onChange={(e) => setSettings({...settings, compliance: { ...settings.compliance, pfRate: e.target.value }})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">ESI Rate</h4>
            <p className="text-sm text-gray-600">Rate for Employee State Insurance.</p>
            <input
              type="text"
              value={settings.compliance.esiRate}
              onChange={(e) => setSettings({...settings, compliance: { ...settings.compliance, esiRate: e.target.value }})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Auto TDS</h4>
            <p className="text-sm text-gray-600">Enable automatic Tax Deduction at Source (TDS).</p>
            <input
              type="checkbox"
              checked={settings.compliance.autoTds}
              onChange={() => setSettings({...settings, compliance: { ...settings.compliance, autoTds: !settings.compliance.autoTds }})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Payslip Delivery</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900">Auto Email Payslips</h4>
            <p className="text-sm text-gray-600">Send payslips automatically to employees via email.</p>
            <input
              type="checkbox"
              checked={settings.payslipDelivery.autoEmail}
              onChange={() => setSettings({...settings, payslipDelivery: { ...settings.payslipDelivery, autoEmail: !settings.payslipDelivery.autoEmail }})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Allow Payslip Download</h4>
            <p className="text-sm text-gray-600">Allow employees to download their payslips.</p>
            <input
              type="checkbox"
              checked={settings.payslipDelivery.allowDownload}
              onChange={() => setSettings({...settings, payslipDelivery: { ...settings.payslipDelivery, allowDownload: !settings.payslipDelivery.allowDownload }})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderThemeSettings = () => {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Theme</label>
          <ThemeSelector settings={settings} setSettings={setSettings} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Primary Color</label>
            <div className="flex items-center space-x-2">
              <input type="color" value={settings.primaryColor} onChange={(e) => setSettings({...settings, primaryColor: e.target.value})} className="w-12 h-10 border rounded-md" />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                className="flex-1 border rounded-md px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Secondary Color</label>
            <div className="flex items-center space-x-2">
              <input type="color" value={settings.secondaryColor} onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})} className="w-12 h-10 border rounded-md" />
              <input
                type="text"
                value={settings.secondaryColor}
                onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})}
                className="flex-1 border rounded-md px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Accent Color</label>
            <div className="flex items-center space-x-2">
              <input type="color" value={settings.accentColor} onChange={(e) => setSettings({...settings, accentColor: e.target.value})} className="w-12 h-10 border rounded-md" />
              <input
                type="text"
                value={settings.accentColor}
                onChange={(e) => setSettings({...settings, accentColor: e.target.value})}
                className="flex-1 border rounded-md px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Font Family</label>
            <select
              value={settings.fontFamily}
              onChange={(e) => setSettings({...settings, fontFamily: e.target.value})}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderNotificationsSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Notification Types</h3>
        <div className="space-y-3">
          {Object.entries(settings.notificationSettings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell size={20} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {key.charAt(0).toUpperCase() + key.slice(1)} Notifications
                </span>
              </div>
              <button
                onClick={() => setSettings({
                  ...settings, 
                  notificationSettings: {
                    ...settings.notificationSettings,
                    [key]: !value
                  }
                })}
                className={`px-3 py-1 rounded-md text-sm ${
                  value ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {value ? 'On' : 'Off'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Alert Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Service Alerts</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>1 day before</option>
              <option>3 days before</option>
              <option>1 week before</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contract Expiry Alerts</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>1 month before</option>
              <option>2 months before</option>
              <option>3 months before</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Service</h3>
          <p className="text-sm text-gray-600 mb-4">Configure your email service for sending notifications and payslips.</p>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">SMTP</h4>
              <p className="text-sm text-gray-600">Send emails using your SMTP server.</p>
            </div>
            <a href="https://www.google.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50">
              Configure SMTP
            </a>
          </div>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">SendGrid</h4>
              <p className="text-sm text-gray-600">Use SendGrid for transactional emails.</p>
            </div>
            <a href="https://www.sendgrid.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50">
              Configure SendGrid
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">SMS Gateway</h3>
          <p className="text-sm text-gray-600 mb-4">Configure your SMS gateway for sending SMS notifications.</p>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Twilio</h4>
              <p className="text-sm text-gray-600">Send SMS using Twilio's API.</p>
            </div>
            <a href="https://www.twilio.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50">
              Configure Twilio
            </a>
          </div>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Nexmo</h4>
              <p className="text-sm text-gray-600">Send SMS using Nexmo's API.</p>
            </div>
            <a href="https://www.nexmo.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50">
              Configure Nexmo
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Chatbot</h3>
          <p className="text-sm text-gray-600 mb-4">Integrate a chatbot for employee communication.</p>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Slack</h4>
              <p className="text-sm text-gray-600">Integrate with Slack for real-time communication.</p>
            </div>
            <a href="https://api.slack.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50">
              Configure Slack
            </a>
          </div>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Microsoft Teams</h4>
              <p className="text-sm text-gray-600">Integrate with Microsoft Teams for chat.</p>
            </div>
            <a href="https://docs.microsoft.com/en-us/microsoftteams/platform/overview" target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50">
              Configure Teams
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Third-Party APIs</h3>
          <p className="text-sm text-gray-600 mb-4">Connect with other third-party services.</p>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Google Calendar</h4>
              <p className="text-sm text-gray-600">Sync employee calendars with Google Calendar.</p>
            </div>
            <a href="https://developers.google.com/calendar/api/guides/concepts" target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50">
              Configure Google Calendar
            </a>
          </div>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Zoom</h4>
              <p className="text-sm text-gray-600">Integrate Zoom for video meetings.</p>
            </div>
            <a href="https://developers.zoom.us/docs/api/rest/prerequisites/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50">
              Configure Zoom
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  
  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'account':
        return renderAccountSettings();
      case 'attendance':
        return renderAttendanceSettings();
      case 'finance':
        return renderFinanceSettings();
      case 'payroll':
        return renderPayrollSettings();
      case 'theme':
        return renderThemeSettings();
      case 'notifications':
        return renderNotificationsSettings();
      case 'integrations':
        return renderIntegrations();
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
          <CheckCircle size={20} />
          <span>Save Changes</span>
        </button>
      </div>

      {showSaveSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center space-x-2">
          <CheckCircle size={20} />
          <span>Settings saved successfully!</span>
        </div>
      )}

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

export default Settings;


