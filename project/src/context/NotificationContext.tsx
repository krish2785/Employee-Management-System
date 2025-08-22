import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Bell, Mail, MessageSquare, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

// Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  category: 'attendance' | 'leave' | 'task' | 'report' | 'alert' | 'system';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recipients: string[];
  deliveryMethods: ('email' | 'sms' | 'push')[];
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  categories: {
    attendance: boolean;
    leave: boolean;
    task: boolean;
    report: boolean;
    alert: boolean;
    system: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

// State interface
interface NotificationState {
  notifications: Notification[];
  settings: NotificationSettings;
  unreadCount: number;
  showNotifications: boolean;
}

// Action types
type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<NotificationSettings> }
  | { type: 'TOGGLE_NOTIFICATIONS_PANEL' }
  | { type: 'SEND_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp' | 'read'> };

// Initial state
const initialState: NotificationState = {
  notifications: [],
  settings: {
    email: true,
    sms: false,
    push: true,
    categories: {
      attendance: true,
      leave: true,
      task: true,
      report: true,
      alert: true,
      system: true,
    },
    frequency: 'immediate',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  },
  unreadCount: 0,
  showNotifications: false,
};

// Reducer
function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({ ...notification, read: true })),
        unreadCount: 0,
      };
    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload),
        unreadCount: state.notifications.find(n => n.id === action.payload)?.read ? state.unreadCount : Math.max(0, state.unreadCount - 1),
      };
    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    case 'TOGGLE_NOTIFICATIONS_PANEL':
      return {
        ...state,
        showNotifications: !state.showNotifications,
      };
    case 'SEND_NOTIFICATION':
      const newNotification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date(),
        read: false,
      };
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    default:
      return state;
  }
}

// Context
interface NotificationContextType {
  state: NotificationState;
  dispatch: React.Dispatch<NotificationAction>;
  sendNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  toggleNotificationsPanel: () => void;
  getNotificationsByCategory: (category: Notification['category']) => Notification[];
  getUnreadNotifications: () => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider component
interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Helper functions
  const sendNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    dispatch({ type: 'SEND_NOTIFICATION', payload: notification });
  };

  const markAsRead = (id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  };

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };

  const deleteNotification = (id: string) => {
    dispatch({ type: 'DELETE_NOTIFICATION', payload: id });
  };

  const clearAllNotifications = () => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  };

  const updateSettings = (settings: Partial<NotificationSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const toggleNotificationsPanel = () => {
    dispatch({ type: 'TOGGLE_NOTIFICATIONS_PANEL' });
  };

  const getNotificationsByCategory = (category: Notification['category']) => {
    return state.notifications.filter(notification => notification.category === category);
  };

  const getUnreadNotifications = () => {
    return state.notifications.filter(notification => !notification.read);
  };

  // Auto-generate some sample notifications
  useEffect(() => {
    const sampleNotifications: Omit<Notification, 'id' | 'timestamp' | 'read'>[] = [
      {
        type: 'info',
        title: 'System Update',
        message: 'New features have been added to the employee management system.',
        category: 'system',
        priority: 'medium',
        recipients: ['admin'],
        deliveryMethods: ['email', 'push'],
      },
      {
        type: 'warning',
        title: 'Leave Request Pending',
        message: 'Rajesh Kumar has requested 3 days of annual leave.',
        category: 'leave',
        priority: 'high',
        recipients: ['admin', 'hr'],
        deliveryMethods: ['email', 'push'],
        action: {
          label: 'Review Request',
          url: '/leave',
        },
      },
      {
        type: 'success',
        title: 'Attendance Report Generated',
        message: 'Monthly attendance report for July 2025 has been generated successfully.',
        category: 'report',
        priority: 'low',
        recipients: ['admin'],
        deliveryMethods: ['email'],
        action: {
          label: 'View Report',
          url: '/reports',
        },
      },
      {
        type: 'error',
        title: 'Task Overdue',
        message: 'Task "Update documentation" assigned to Priya Sharma is overdue.',
        category: 'task',
        priority: 'urgent',
        recipients: ['admin', 'manager'],
        deliveryMethods: ['email', 'sms', 'push'],
        action: {
          label: 'View Task',
          url: '/tasks',
        },
      },
    ];

    // Add sample notifications after a delay
    const timer = setTimeout(() => {
      sampleNotifications.forEach((notification, index) => {
        setTimeout(() => {
          sendNotification(notification);
        }, index * 1000); // Stagger notifications
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const contextValue: NotificationContextType = {
    state,
    dispatch,
    sendNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updateSettings,
    toggleNotificationsPanel,
    getNotificationsByCategory,
    getUnreadNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook to use the notification context
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Notification helper functions
export const createNotification = (
  type: Notification['type'],
  title: string,
  message: string,
  category: Notification['category'],
  priority: Notification['priority'] = 'medium',
  recipients: string[] = ['admin'],
  deliveryMethods: Notification['deliveryMethods'] = ['email', 'push'],
  action?: Notification['action']
): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  type,
  title,
  message,
  category,
  priority,
  recipients,
  deliveryMethods,
  action,
});

// Predefined notification templates
export const notificationTemplates = {
  attendance: {
    marked: (employeeName: string) => createNotification(
      'success',
      'Attendance Marked',
      `${employeeName} has marked their attendance for today.`,
      'attendance',
      'low'
    ),
    late: (employeeName: string) => createNotification(
      'warning',
      'Late Arrival',
      `${employeeName} arrived late today.`,
      'attendance',
      'medium'
    ),
    absent: (employeeName: string) => createNotification(
      'error',
      'Employee Absent',
      `${employeeName} is absent today.`,
      'attendance',
      'high'
    ),
  },
  leave: {
    requested: (employeeName: string, days: number) => createNotification(
      'info',
      'Leave Request',
      `${employeeName} has requested ${days} days of leave.`,
      'leave',
      'high',
      ['admin', 'hr'],
      ['email', 'push'],
      { label: 'Review Request', url: '/leave' }
    ),
    approved: (employeeName: string) => createNotification(
      'success',
      'Leave Approved',
      `Leave request for ${employeeName} has been approved.`,
      'leave',
      'medium'
    ),
    rejected: (employeeName: string) => createNotification(
      'error',
      'Leave Rejected',
      `Leave request for ${employeeName} has been rejected.`,
      'leave',
      'medium'
    ),
  },
  task: {
    assigned: (employeeName: string, taskTitle: string) => createNotification(
      'info',
      'Task Assigned',
      `Task "${taskTitle}" has been assigned to ${employeeName}.`,
      'task',
      'medium',
      [employeeName],
      ['email', 'push'],
      { label: 'View Task', url: '/tasks' }
    ),
    completed: (employeeName: string, taskTitle: string) => createNotification(
      'success',
      'Task Completed',
      `${employeeName} has completed the task "${taskTitle}".`,
      'task',
      'low'
    ),
    overdue: (employeeName: string, taskTitle: string) => createNotification(
      'error',
      'Task Overdue',
      `Task "${taskTitle}" assigned to ${employeeName} is overdue.`,
      'task',
      'urgent',
      ['admin', 'manager'],
      ['email', 'sms', 'push'],
      { label: 'View Task', url: '/tasks' }
    ),
  },
  report: {
    generated: (reportType: string) => createNotification(
      'success',
      'Report Generated',
      `${reportType} report has been generated successfully.`,
      'report',
      'low',
      ['admin'],
      ['email'],
      { label: 'View Report', url: '/reports' }
    ),
    failed: (reportType: string) => createNotification(
      'error',
      'Report Generation Failed',
      `Failed to generate ${reportType} report. Please try again.`,
      'report',
      'high'
    ),
  },
  alert: {
    contractExpiry: (employeeName: string, daysLeft: number) => createNotification(
      'warning',
      'Contract Expiry Alert',
      `Contract for ${employeeName} expires in ${daysLeft} days.`,
      'alert',
      'high',
      ['admin', 'hr'],
      ['email', 'push'],
      { label: 'View Employee', url: '/employees' }
    ),
    probationEnd: (employeeName: string) => createNotification(
      'info',
      'Probation Period Ending',
      `Probation period for ${employeeName} is ending soon.`,
      'alert',
      'medium',
      ['admin', 'hr'],
      ['email', 'push']
    ),
  },
};
