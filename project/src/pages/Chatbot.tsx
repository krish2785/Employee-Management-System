import React, { useEffect } from 'react';
import { MessageCircle, Bot } from 'lucide-react';

const Chatbot = () => {
  useEffect(() => {
    // Initialize Chatbase
    if (!window.chatbase || window.chatbase("getState") !== "initialized") {
      window.chatbase = (...args: any[]) => {
        if (!window.chatbase.q) {
          window.chatbase.q = [];
        }
        window.chatbase.q.push(args);
      };
      
      window.chatbase = new Proxy(window.chatbase, {
        get(target: any, prop: string) {
          if (prop === "q") {
            return target.q;
          }
          return (...args: any[]) => target(prop, ...args);
        }
      });
    }

    const onLoad = function() {
      const script = document.createElement("script");
      script.src = "https://www.chatbase.co/embed.min.js";
      script.id = "9V3iws6f5sUSDPl-dQkvl";
      script.setAttribute("data-domain", "www.chatbase.co");
      document.body.appendChild(script);
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad);
    }

    // Clear chat history and auto-open the chatbot when this page loads
    setTimeout(() => {
      if (window.chatbase) {
        // Try multiple methods to clear chat history
        try {
          window.chatbase("reset");
        } catch (e) {}
        try {
          window.chatbase("clear");
        } catch (e) {}
        try {
          window.chatbase("restart");
        } catch (e) {}
        // Force reload the chatbot widget
        const existingWidget = document.querySelector('[data-chatbase-id]');
        if (existingWidget) {
          existingWidget.remove();
        }
        window.chatbase("open");
      }
    }, 1500);

    // Cleanup function
    return () => {
      const existingScript = document.getElementById("9V3iws6f5sUSDPl-dQkvl");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const openChatbot = () => {
    if (window.chatbase) {
      // Force complete widget reset
      try {
        // Remove existing widget elements
        const widgets = document.querySelectorAll('[id*="chatbase"], [class*="chatbase"], iframe[src*="chatbase"]');
        widgets.forEach(widget => widget.remove());
        
        // Clear localStorage and sessionStorage for chatbase
        Object.keys(localStorage).forEach(key => {
          if (key.includes('chatbase') || key.includes('chat')) {
            localStorage.removeItem(key);
          }
        });
        Object.keys(sessionStorage).forEach(key => {
          if (key.includes('chatbase') || key.includes('chat')) {
            sessionStorage.removeItem(key);
          }
        });
        
        // Reinitialize and open
        setTimeout(() => {
          window.chatbase("open");
        }, 500);
      } catch (e) {
        window.chatbase("open");
      }
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">EMS Assistant</h1>
        <p className="text-gray-600">Powered by Chatbase - Get instant answers to your HR and EMS questions</p>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center">
        <div className="text-center py-12">
          <Bot className="w-24 h-24 mx-auto mb-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to EMS Assistant</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            Your intelligent assistant for Employee Management System queries. 
            Ask about attendance, leave management, payroll, tasks, and more!
          </p>
          <button
            onClick={openChatbot}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Start Conversation</span>
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What can I help you with?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Attendance', desc: 'Check attendance records and policies' },
            { title: 'Leave Management', desc: 'Apply for leave and check balances' },
            { title: 'Payroll', desc: 'Salary information and payslips' },
            { title: 'Tasks', desc: 'Task assignments and deadlines' }
          ].map((feature) => (
            <div key={feature.title} className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">{feature.title}</h4>
              <p className="text-sm text-blue-700">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    chatbase: any;
  }
}

export default Chatbot;