import React, { useState } from 'react';
import BigPrompt from './components/BigPrompt';
import InputBox from './components/InputBox';
import { STRINGS } from './strings';
import './styles.css';

export default function SendButtonEnhanced() {
  const [mode, setMode] = useState('personal');
  const [lang] = useState('en');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const t = STRINGS[lang] || STRINGS.en;
  const email = "demo@kisansaathi.com";

  const handleSend = (message: string) => {
    console.log('Sending message:', message);
    setMessages(prev => [...prev, { role: 'user', text: message }]);
    // Simulate response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: 'Thank you for your message! The send button arrow is now larger and more visible.' }]);
    }, 1000);
  };

  return (
    <div className="app">
      {/* Header */}
      <div style={{ 
        background: 'var(--ks-gradient)', 
        color: 'white', 
        padding: '20px', 
        textAlign: 'center',
        borderRadius: '12px',
        margin: '20px'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
          Enhanced Send Button & Mic Demo
        </h1>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
          Both send button and microphone icons have been enhanced for better visibility and user experience.
        </p>
      </div>

      {/* Demo Section */}
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Big Prompt Demo */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ color: 'var(--brand)', marginBottom: '20px' }}>Big Prompt Component</h2>
          <BigPrompt
            title="Welcome to KisanSaathi!"
            placeholder="Type your farming question here..."
            mode={mode}
            setMode={setMode}
            onSend={handleSend}
            t={t}
            email={email}
          />
        </div>

        {/* Input Box Demo */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ color: 'var(--brand)', marginBottom: '20px' }}>Input Box Component</h2>
          <InputBox
            placeholder="Type your message here..."
            mode={mode}
            setMode={setMode}
            onSend={handleSend}
            disabled={loading}
            t={t}
            email={email}
          />
        </div>

        {/* Messages Display */}
        {messages.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h2 style={{ color: 'var(--brand)', marginBottom: '20px' }}>Messages</h2>
            <div style={{ 
              background: 'white', 
              border: '1px solid var(--border)', 
              borderRadius: '12px', 
              padding: '20px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  style={{ 
                    marginBottom: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    background: msg.role === 'user' ? '#F0F9FF' : '#F9FAFB',
                    borderLeft: `4px solid ${msg.role === 'user' ? 'var(--brand-3)' : '#E5E7EB'}`
                  }}
                >
                  <strong>{msg.role === 'user' ? 'You' : 'Assistant'}:</strong> {msg.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhancement Details */}
        <div style={{ 
          marginTop: '40px', 
          background: '#F9FAFB', 
          border: '1px solid #E5E7EB', 
          borderRadius: '12px', 
          padding: '24px' 
        }}>
          <h3 style={{ color: 'var(--brand)', marginTop: 0 }}>Enhancement Details</h3>
          <ul style={{ color: '#374151', lineHeight: '1.6' }}>
            <li>Send button arrow icon increased from 24px to 32px</li>
            <li>Microphone icon increased from 20px to 28px</li>
            <li>Voice button size adjusted from 44px to 52px for better proportion</li>
            <li>Send button size adjusted from 44px to 56px for better proportion</li>
            <li>Enhanced visibility and accessibility for both buttons</li>
            <li>Consistent styling across BigPrompt and InputBox components</li>
            <li>Improved user experience with larger, more accessible buttons</li>
          </ul>
        </div>
      </div>
    </div>
  );
}