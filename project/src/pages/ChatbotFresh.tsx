import { useEffect } from 'react';
import { MessageCircle, Bot, RefreshCw } from 'lucide-react';

const ChatbotFresh = () => {
  useEffect(() => {
    // Force complete cleanup on component mount
    const cleanup = () => {
      // Remove all chatbase related elements
      const elements = document.querySelectorAll('[id*="chatbase"], [class*="chatbase"], iframe[src*="chatbase"], script[src*="chatbase"]');
      elements.forEach(el => el.remove());
      
      // Clear all storage
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {}
      
      // Reset window.chatbase
      delete window.chatbase;
    };

    cleanup();

    // Initialize fresh chatbase after cleanup
    const initializeFreshChatbase = () => {
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

      const script = document.createElement("script");
      script.src = "https://www.chatbase.co/embed.min.js";
      script.id = "chatbase-fresh-" + Date.now();
      script.setAttribute("data-domain", "www.chatbase.co");
      script.onload = () => {
        setTimeout(() => {
          if (window.chatbase) {
            window.chatbase("open");
          }
        }, 1000);
      };
      document.body.appendChild(script);
    };

    setTimeout(initializeFreshChatbase, 500);

    return cleanup;
  }, []);

  const startFreshChat = () => {
    // Force page reload to ensure completely fresh state
    window.location.reload();
  };

  const openChatbot = () => {
    if (window.chatbase) {
      window.chatbase("open");
    } else {
      // If chatbase not loaded, reload page
      window.location.reload();
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
          <div className="flex gap-4 justify-center">
            <button
              onClick={openChatbot}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Start Conversation</span>
            </button>
            <button
              onClick={startFreshChat}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Fresh Start</span>
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What can I help you with?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Attendance', desc: 'Check attendance records and policies' },
            { title: 'Leave Management', desc: 'Apply for leave and check balances' },
            { title: 'Tasks', desc: 'Task assignments and deadlines' },
            { title: 'Employee Info', desc: 'Employee details and directory' }
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

export default ChatbotFresh;
