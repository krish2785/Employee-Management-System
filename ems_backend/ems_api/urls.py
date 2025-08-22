from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmployeeViewSet, 
    AttendanceRecordViewSet, 
    LeaveRequestViewSet, 
    TaskViewSet,
    TaskAttachmentViewSet,
    LoginView,
    LogoutView,
    CurrentUserView
)
from .chatbot_views import ChatbotView, ChatbotHealthView

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'attendance', AttendanceRecordViewSet)
router.register(r'leave-requests', LeaveRequestViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'task-attachments', TaskAttachmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/user/', CurrentUserView.as_view(), name='auth_user'),
    path('chatbot/', ChatbotView.as_view(), name='chatbot'),
    path('chatbot/health/', ChatbotHealthView.as_view(), name='chatbot_health'),
]
