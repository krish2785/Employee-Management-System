from django.contrib import admin
from .models import Employee, AttendanceRecord, LeaveRequest, Task


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'name', 'email', 'department', 'designation', 'status', 'joining_date')
    list_filter = ('department', 'status', 'joining_date')
    search_fields = ('name', 'email', 'employee_id')
    ordering = ('employee_id',)


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ('date', 'employee', 'check_in', 'check_out', 'hours', 'status')
    list_filter = ('date', 'status', 'employee__department')
    search_fields = ('employee__name', 'employee__employee_id')
    ordering = ('-date', 'employee__name')


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ('employee', 'leave_type', 'start_date', 'end_date', 'days', 'status', 'applied_date')
    list_filter = ('status', 'leave_type', 'applied_date', 'employee__department')
    search_fields = ('employee__name', 'employee__employee_id')
    ordering = ('-applied_date', 'employee__name')


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'assigned_to', 'assigned_by', 'priority', 'status', 'progress', 'due_date')
    list_filter = ('status', 'priority', 'department', 'assigned_date')
    search_fields = ('title', 'assigned_to__name', 'assigned_by__name')
    ordering = ('-assigned_date', 'priority')
