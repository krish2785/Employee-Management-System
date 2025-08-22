import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // Clear chat history when user logs in
  useEffect(() => {
    if (user && window.chatbase) {
      // Clear chat history on login
      try {
        window.chatbase("reset");
        window.chatbase("clear");
      } catch (e) {
        console.log('Chat history cleared');
      }
    }
  }, [user]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Custom Chatbot Toggle Button */}
      <button
        onClick={toggleChatbot}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 z-[99999]"
        title={isOpen ? "Close EMS Assistant" : "Open EMS Assistant"}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chatbot Iframe */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[99998]">
          <iframe
            src="https://www.chatbase.co/chatbot-iframe/9V3iws6f5sUSDPl-dQkvl"
            width="400"
            height="600"
            frameBorder="0"
            className="rounded-lg shadow-xl border border-gray-200"
            title="EMS Assistant"
          />
        </div>
      )}
    </>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    chatbase: any;
    chatbaseConfig: any;
  }
}

export default Chatbot;
