import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import InputBox from './components/InputBox';
import { STRINGS } from './strings';
import './styles.css';

export default function InputBoxFixPreview() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: 'For **whiteflies** in cotton, consider these options:\n\n• **Neem oil (5 ml/L)** is a safe, natural option.\n• **Imidacloprid** can also be effective; use the dosage recommended on the label.'
    },
    {
      id: 2,
      role: 'user',
      text: 'What about organic alternatives?'
    },
    {
      id: 3,
      role: 'bot',
      text: 'Great question! Here are some organic alternatives:\n\n• **Neem oil spray** - Mix 5ml per liter of water\n• **Soap solution** - Use mild liquid soap\n• **Companion planting** with marigolds\n• **Beneficial insects** like ladybugs'
    }
  ]);
  const [mode, setMode] = useState('general');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const t = STRINGS.en;

  const handleSend = (text: string) => {
    const newUserMessage = {
      id: messages.length + 1,
      role: 'user' as const,
      text
    };
    
    const newBotMessage = {
      id: messages.length + 2,
      role: 'bot' as const,
      text: 'Thank you for your question! This demonstrates the fixed input box styling that now properly matches the chat window background.'
    };

    setMessages(prev => [...prev, newUserMessage, newBotMessage]);
  };

  const handleFeedback = async ({ messageId, thumb, text }: any) => {
    console.log('Feedback:', { messageId, thumb, text });
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="app" data-theme={isDarkMode ? "dark" : "light"}>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ 
          background: 'var(--ks-gradient)', 
          color: 'white', 
          padding: '16px 24px',
          borderRadius: '14px 14px 0 0',
          margin: '8px 4px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
              Input Box Background Fix Demo
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '14px', opacity: 0.9 }}>
              The input box now matches the chat window background in both light and dark modes
            </p>
          </div>
          <button 
            onClick={toggleTheme}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        {/* Main chat area */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: 0,
          background: 'var(--bg)',
          transition: 'background-color 0.3s ease'
        }}>
          <ChatWindow
            messages={messages}
            onFeedback={handleFeedback}
            loading={loading}
          />
          
          <InputBox
            placeholder="Ask General Assistant regarding farming, weather, market price, government policies..."
            mode={mode}
            setMode={setMode}
            onSend={handleSend}
            disabled={loading}
            t={t}
            email="demo@example.com"
            selectedLanguage="en"
          />
        </div>
      </div>
    </div>
  );
}