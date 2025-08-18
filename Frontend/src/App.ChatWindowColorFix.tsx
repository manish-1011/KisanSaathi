import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import InputBox from './components/InputBox';

// Mock data for demonstration
const mockMessages = [
  {
    id: 1,
    role: 'user',
    text: 'What are the best crops to grow in Maharashtra during monsoon season?',
    timestamp: new Date()
  },
  {
    id: 2,
    role: 'bot',
    text: 'During the monsoon season in Maharashtra, you can grow several excellent crops:\n\n**Kharif Crops (Monsoon Season):**\n• **Rice** - Main staple crop, grows well in heavy rainfall areas\n• **Cotton** - Major cash crop in Vidarbha and Marathwada regions\n• **Sugarcane** - Thrives in western Maharashtra\n• **Soybean** - Important oilseed crop\n• **Maize** - Good for both grain and fodder\n• **Jowar (Sorghum)** - Drought-resistant grain crop\n• **Bajra (Pearl Millet)** - Suitable for drier areas\n\n**Vegetables:**\n• Okra, Brinjal, Tomato, Chili, Cucumber\n\nThe choice depends on your specific location, soil type, and water availability. Would you like detailed information about any specific crop?',
    timestamp: new Date()
  },
  {
    id: 3,
    role: 'user',
    text: 'Tell me more about cotton cultivation',
    timestamp: new Date()
  }
];

const mockStrings = {
  askPersonalPlaceholder: "Ask Personal Assistant regarding farming, weather, market price, government policies...",
  askGeneralPlaceholder: "Ask General Assistant regarding farming, weather, market price, government policies...",
  modePersonal: "Personal Assistant",
  modeGeneral: "General Assistant"
};

export default function App() {
  const [messages, setMessages] = useState(mockMessages);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('general');

  const handleSend = (message: string) => {
    const newMessage = {
      id: messages.length + 1,
      role: 'user' as const,
      text: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setLoading(true);
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        role: 'bot' as const,
        text: 'Thank you for your question. This is a sample response to demonstrate the chat interface with consistent background colors.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setLoading(false);
    }, 1500);
  };

  const handleFeedback = async (feedback: any) => {
    console.log('Feedback received:', feedback);
  };

  return (
    <div className="app">
      {/* Topbar */}
      <div className="topbar">
        <div className="tb-left">
          <div className="topbar-logo">
            <div className="brand-name">KisanSaathi</div>
          </div>
        </div>
        <div className="tb-right">
          <div className="editable-pincode display">
            <span className="pincode-text">411001</span>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="layout">
        <div className="main">
          <ChatWindow 
            messages={messages}
            onFeedback={handleFeedback}
            loading={loading}
          />
          
          <InputBox
            placeholder="Ask about farming, weather, market prices..."
            mode={mode}
            setMode={setMode}
            onSend={handleSend}
            disabled={loading}
            t={mockStrings}
            email="user@example.com"
            selectedLanguage="en"
          />
        </div>
      </div>
    </div>
  );
}