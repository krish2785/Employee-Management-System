# Gemini Chatbot Setup Guide

This guide will help you set up the Gemini-powered chatbot for your EMS system.

## 🚀 Prerequisites

1. **Google Account**: You need a Google account to access Gemini AI
2. **Gemini API Key**: Get your API key from Google AI Studio

## 📋 Step-by-Step Setup

### 1. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment Variables

Create a `.env` file in your `ems_backend` directory:

```bash
# Gemini AI API Configuration
GEMINI_API_KEY=your_actual_api_key_here

# MySQL Database Configuration (optional - already in mysql_config.py)
MYSQL_USER=root
MYSQL_PASSWORD=krishna27
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_NAME=ems_db

# Django Configuration
SECRET_KEY=django-insecure-ov9)w+8$hcuelrv5rq5r3)g_#2l_detoj7id5%l8er-=c*2$bc
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### 3. Install Dependencies

```bash
cd ems_backend
pip install -r requirements.txt
```

### 4. Test the Chatbot

1. **Health Check**: Visit `http://localhost:8000/api/chatbot/health/`
2. **Chat Interface**: Use the chatbot in your React app

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Your Gemini API key | Yes | None |
| `MYSQL_USER` | MySQL username | No | root |
| `MYSQL_PASSWORD` | MySQL password | No | (from mysql_config.py) |
| `MYSQL_HOST` | MySQL host | No | localhost |
| `MYSQL_PORT` | MySQL port | No | 3306 |
| `MYSQL_NAME` | MySQL database name | No | ems_db |

### Chatbot Features

- **Intent Recognition**: Automatically detects user query types
- **Context Awareness**: Provides relevant EMS information
- **Suggested Questions**: Offers helpful prompts to users
- **Conversation History**: Maintains chat context
- **Error Handling**: Graceful fallbacks for API issues

## 🧪 Testing the Chatbot

### 1. Health Check
```bash
curl http://localhost:8000/api/chatbot/health/
```

### 2. Send a Message
```bash
curl -X POST http://localhost:8000/api/chatbot/ \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I add a new employee?"}'
```

### 3. Get Chatbot Info
```bash
curl http://localhost:8000/api/chatbot/
```

## 💡 Sample Questions

The chatbot can help with:

- **Employee Management**:
  - "How do I add a new employee?"
  - "How can I update employee information?"
  - "What employee data is tracked?"

- **Attendance**:
  - "How do I track daily attendance?"
  - "What attendance statuses are available?"
  - "How do I view attendance reports?"

- **Leave Management**:
  - "What's the process for approving leave?"
  - "What leave types are available?"
  - "How do I request leave?"

- **Tasks**:
  - "How do I assign tasks to employees?"
  - "How can I track task progress?"
  - "What task priorities are available?"

## 🚨 Troubleshooting

### Common Issues

1. **"GEMINI_API_KEY not configured"**
   - Check your `.env` file
   - Ensure the API key is correct
   - Restart Django server after changes

2. **"Chatbot initialization failed"**
   - Verify your API key is valid
   - Check internet connection
   - Ensure Gemini service is available

3. **"Access denied" errors**
   - Check API key permissions
   - Verify account status
   - Check usage quotas

### Debug Mode

Enable debug logging by setting:
```python
# In settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'ems_api.chatbot': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

## 🔒 Security Considerations

1. **API Key Protection**:
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys regularly

2. **Rate Limiting**:
   - Monitor API usage
   - Implement rate limiting if needed
   - Set up alerts for quota limits

3. **Input Validation**:
   - Sanitize user inputs
   - Implement message length limits
   - Monitor for abuse

## 📚 Additional Resources

- [Gemini AI Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Django Environment Variables](https://docs.djangoproject.com/en/stable/topics/settings/)
- [React Chatbot Integration](https://react.dev/learn)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your API key and configuration
3. Check Django server logs
4. Test the health endpoint
5. Review Gemini API documentation

---

**Happy Chatting! 🤖✨**
