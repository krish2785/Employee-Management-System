// Roles and Permissions System for EMS

export type Role = 'admin' | 'hr_manager' | 'team_lead' | 'employee';

export interface Permission {
  module: string;
  actions: string[];
}

export interface RolePermissions {
  role: Role;
  permissions: Permission[];
}

// Define all available permissions
export const PERMISSIONS = {
  EMPLOYEE_MANAGEMENT: {
    VIEW: 'employee:view',
    ADD: 'employee:add',
    EDIT: 'employee:edit',
    DELETE: 'employee:delete',
    EDIT_OWN: 'employee:edit_own'
  },
  ATTENDANCE: {
    VIEW: 'attendance:view',
    EDIT: 'attendance:edit',
    DELETE: 'attendance:delete',
    EXPORT: 'attendance:export',
    VIEW_TEAM: 'attendance:view_team',
    MARK_OWN: 'attendance:mark_own'
  },
  LEAVE_MANAGEMENT: {
    FULL_CONTROL: 'leave:full_control',
    APPROVE_REJECT: 'leave:approve_reject',
    APPROVE_TEAM: 'leave:approve_team',
    APPLY: 'leave:apply'
  },
  CHATBOT: {
    CONFIGURE: 'chatbot:configure',
    USE: 'chatbot:use'
  },
  REPORTS: {
    ALL: 'reports:all',
    HR_ORG: 'reports:hr_org',
    TEAM: 'reports:team',
    OWN: 'reports:own'
  },
  THEME: {
    SYSTEM: 'theme:system',
    HR_PANEL: 'theme:hr_panel',
    SELF: 'theme:self'
  },
  SYSTEM: {
    DATABASE: 'system:database',
    INTEGRATIONS: 'system:integrations',
    ROLES: 'system:roles',
    LEAVE_POLICY: 'system:leave_policy',
    WORKING_HOURS: 'system:working_hours'
  }
} as const;

// Role-based permissions configuration
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: [
    // Employee Management
    PERMISSIONS.EMPLOYEE_MANAGEMENT.VIEW,
    PERMISSIONS.EMPLOYEE_MANAGEMENT.ADD,
    PERMISSIONS.EMPLOYEE_MANAGEMENT.EDIT,
    PERMISSIONS.EMPLOYEE_MANAGEMENT.DELETE,
    
    // Attendance
    PERMISSIONS.ATTENDANCE.VIEW,
    PERMISSIONS.ATTENDANCE.EDIT,
    PERMISSIONS.ATTENDANCE.DELETE,
    PERMISSIONS.ATTENDANCE.EXPORT,
    
    // Leave Management
    PERMISSIONS.LEAVE_MANAGEMENT.FULL_CONTROL,
    
    // Chatbot
    PERMISSIONS.CHATBOT.CONFIGURE,
    PERMISSIONS.CHATBOT.USE,
    
    // Reports
    PERMISSIONS.REPORTS.ALL,
    
    // Theme
    PERMISSIONS.THEME.SYSTEM,
    
    // System
    PERMISSIONS.SYSTEM.DATABASE,
    PERMISSIONS.SYSTEM.INTEGRATIONS,
    PERMISSIONS.SYSTEM.ROLES,
    PERMISSIONS.SYSTEM.LEAVE_POLICY,
    PERMISSIONS.SYSTEM.WORKING_HOURS
  ],
  
  hr_manager: [
    // Employee Management
    PERMISSIONS.EMPLOYEE_MANAGEMENT.VIEW,
    PERMISSIONS.EMPLOYEE_MANAGEMENT.ADD,
    PERMISSIONS.EMPLOYEE_MANAGEMENT.EDIT,
    
    // Attendance
    PERMISSIONS.ATTENDANCE.VIEW,
    PERMISSIONS.ATTENDANCE.EXPORT,
    
    // Leave Management
    PERMISSIONS.LEAVE_MANAGEMENT.APPROVE_REJECT,
    
    // Chatbot
    PERMISSIONS.CHATBOT.USE,
    
    // Reports
    PERMISSIONS.REPORTS.HR_ORG,
    
    // Theme
    PERMISSIONS.THEME.HR_PANEL,
    
    // System (Limited)
    PERMISSIONS.SYSTEM.LEAVE_POLICY,
    PERMISSIONS.SYSTEM.WORKING_HOURS
  ],
  
  team_lead: [
    // Attendance
    PERMISSIONS.ATTENDANCE.VIEW_TEAM,
    
    // Leave Management
    PERMISSIONS.LEAVE_MANAGEMENT.APPROVE_TEAM,
    
    // Chatbot
    PERMISSIONS.CHATBOT.USE,
    
    // Reports
    PERMISSIONS.REPORTS.TEAM,
    
    // Theme
    PERMISSIONS.THEME.SELF
  ],
  
  employee: [
    // Employee Management
    PERMISSIONS.EMPLOYEE_MANAGEMENT.EDIT_OWN,
    
    // Attendance
    PERMISSIONS.ATTENDANCE.MARK_OWN,
    
    // Leave Management
    PERMISSIONS.LEAVE_MANAGEMENT.APPLY,
    
    // Chatbot
    PERMISSIONS.CHATBOT.USE,
    
    // Reports
    PERMISSIONS.REPORTS.OWN,
    
    // Theme
    PERMISSIONS.THEME.SELF
  ]
};

// Permission checker utility
export class PermissionChecker {
  private userRole: Role;
  private userPermissions: string[];

  constructor(role: Role) {
    this.userRole = role;
    this.userPermissions = ROLE_PERMISSIONS[role] || [];
  }

  hasPermission(permission: string): boolean {
    return this.userPermissions.includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  canAccessModule(module: string): boolean {
    const modulePermissions = this.userPermissions.filter(p => p.startsWith(module));
    return modulePermissions.length > 0;
  }

  getRole(): Role {
    return this.userRole;
  }

  getPermissions(): string[] {
    return [...this.userPermissions];
  }
}

// Hook for using permissions in components
export const usePermissions = (userRole: Role) => {
  return new PermissionChecker(userRole);
};

// Permission validation utility
export const validatePermission = (userRole: Role, requiredPermission: string): boolean => {
  const permissions = new PermissionChecker(userRole);
  return permissions.hasPermission(requiredPermission);
};

// Route protection utility
export const canAccessRoute = (route: string, userRole: Role): boolean => {
  const permissions = new PermissionChecker(userRole);
  
  const routePermissionMap: Record<string, string[]> = {
    '/dashboard': [PERMISSIONS.EMPLOYEE_MANAGEMENT.VIEW, PERMISSIONS.ATTENDANCE.VIEW, PERMISSIONS.REPORTS.ALL, PERMISSIONS.REPORTS.HR_ORG, PERMISSIONS.REPORTS.TEAM, PERMISSIONS.REPORTS.OWN],
    '/employees': [PERMISSIONS.EMPLOYEE_MANAGEMENT.VIEW, PERMISSIONS.EMPLOYEE_MANAGEMENT.ADD, PERMISSIONS.EMPLOYEE_MANAGEMENT.EDIT],
    '/attendance': [PERMISSIONS.ATTENDANCE.VIEW, PERMISSIONS.ATTENDANCE.VIEW_TEAM, PERMISSIONS.ATTENDANCE.MARK_OWN],
    '/leave': [PERMISSIONS.LEAVE_MANAGEMENT.FULL_CONTROL, PERMISSIONS.LEAVE_MANAGEMENT.APPROVE_REJECT, PERMISSIONS.LEAVE_MANAGEMENT.APPROVE_TEAM, PERMISSIONS.LEAVE_MANAGEMENT.APPLY],
    '/tasks': [PERMISSIONS.EMPLOYEE_MANAGEMENT.VIEW, PERMISSIONS.REPORTS.TEAM],
    '/reports': [PERMISSIONS.REPORTS.ALL, PERMISSIONS.REPORTS.HR_ORG, PERMISSIONS.REPORTS.TEAM, PERMISSIONS.REPORTS.OWN],
    '/settings': [PERMISSIONS.THEME.SYSTEM, PERMISSIONS.THEME.HR_PANEL, PERMISSIONS.THEME.SELF],
    '/profile': [PERMISSIONS.EMPLOYEE_MANAGEMENT.EDIT_OWN]
  };
  
  const requiredPermissions = routePermissionMap[route];
  if (!requiredPermissions) return true; // Allow access to routes not in the map
  
  return permissions.hasAnyPermission(requiredPermissions);
};

// Feature visibility utility
export const getVisibleFeatures = (userRole: Role) => {
  const permissions = new PermissionChecker(userRole);
  
  return {
    // Sidebar navigation
    showEmployees: permissions.hasAnyPermission([
      PERMISSIONS.EMPLOYEE_MANAGEMENT.VIEW,
      PERMISSIONS.EMPLOYEE_MANAGEMENT.ADD,
      PERMISSIONS.EMPLOYEE_MANAGEMENT.EDIT
    ]),
    showAttendance: permissions.hasAnyPermission([
      PERMISSIONS.ATTENDANCE.VIEW,
      PERMISSIONS.ATTENDANCE.VIEW_TEAM,
      PERMISSIONS.ATTENDANCE.MARK_OWN
    ]),
    showLeave: permissions.hasAnyPermission([
      PERMISSIONS.LEAVE_MANAGEMENT.FULL_CONTROL,
      PERMISSIONS.LEAVE_MANAGEMENT.APPROVE_REJECT,
      PERMISSIONS.LEAVE_MANAGEMENT.APPROVE_TEAM,
      PERMISSIONS.LEAVE_MANAGEMENT.APPLY
    ]),
    showTasks: permissions.hasAnyPermission([
      PERMISSIONS.EMPLOYEE_MANAGEMENT.VIEW,
      PERMISSIONS.REPORTS.TEAM
    ]),
    showReports: permissions.hasAnyPermission([
      PERMISSIONS.REPORTS.ALL,
      PERMISSIONS.REPORTS.HR_ORG,
      PERMISSIONS.REPORTS.TEAM,
      PERMISSIONS.REPORTS.OWN
    ]),
    showSettings: permissions.hasAnyPermission([
      PERMISSIONS.THEME.SYSTEM,
      PERMISSIONS.THEME.HR_PANEL,
      PERMISSIONS.THEME.SELF
    ]),
    
    // Feature-specific permissions
    canAddEmployee: permissions.hasPermission(PERMISSIONS.EMPLOYEE_MANAGEMENT.ADD),
    canEditEmployee: permissions.hasPermission(PERMISSIONS.EMPLOYEE_MANAGEMENT.EDIT),
    canDeleteEmployee: permissions.hasPermission(PERMISSIONS.EMPLOYEE_MANAGEMENT.DELETE),
    canEditOwnProfile: permissions.hasPermission(PERMISSIONS.EMPLOYEE_MANAGEMENT.EDIT_OWN),
    
    canViewAllAttendance: permissions.hasPermission(PERMISSIONS.ATTENDANCE.VIEW),
    canEditAttendance: permissions.hasPermission(PERMISSIONS.ATTENDANCE.EDIT),
    canExportAttendance: permissions.hasPermission(PERMISSIONS.ATTENDANCE.EXPORT),
    canViewTeamAttendance: permissions.hasPermission(PERMISSIONS.ATTENDANCE.VIEW_TEAM),
    canMarkOwnAttendance: permissions.hasPermission(PERMISSIONS.ATTENDANCE.MARK_OWN),
    
    canManageAllLeave: permissions.hasPermission(PERMISSIONS.LEAVE_MANAGEMENT.FULL_CONTROL),
    canApproveRejectLeave: permissions.hasPermission(PERMISSIONS.LEAVE_MANAGEMENT.APPROVE_REJECT),
    canApproveTeamLeave: permissions.hasPermission(PERMISSIONS.LEAVE_MANAGEMENT.APPROVE_TEAM),
    canApplyLeave: permissions.hasPermission(PERMISSIONS.LEAVE_MANAGEMENT.APPLY),
    
    canConfigureChatbot: permissions.hasPermission(PERMISSIONS.CHATBOT.CONFIGURE),
    canUseChatbot: permissions.hasPermission(PERMISSIONS.CHATBOT.USE),
    
    canViewAllReports: permissions.hasPermission(PERMISSIONS.REPORTS.ALL),
    canViewHRReports: permissions.hasPermission(PERMISSIONS.REPORTS.HR_ORG),
    canViewTeamReports: permissions.hasPermission(PERMISSIONS.REPORTS.TEAM),
    canViewOwnReports: permissions.hasPermission(PERMISSIONS.REPORTS.OWN),
    
    canChangeSystemTheme: permissions.hasPermission(PERMISSIONS.THEME.SYSTEM),
    canChangeHRTheme: permissions.hasPermission(PERMISSIONS.THEME.HR_PANEL),
    canChangeSelfTheme: permissions.hasPermission(PERMISSIONS.THEME.SELF),
    
    canAccessDatabase: permissions.hasPermission(PERMISSIONS.SYSTEM.DATABASE),
    canManageIntegrations: permissions.hasPermission(PERMISSIONS.SYSTEM.INTEGRATIONS),
    canManageRoles: permissions.hasPermission(PERMISSIONS.SYSTEM.ROLES),
    canManageLeavePolicy: permissions.hasPermission(PERMISSIONS.SYSTEM.LEAVE_POLICY),
    canManageWorkingHours: permissions.hasPermission(PERMISSIONS.SYSTEM.WORKING_HOURS)
  };
};
