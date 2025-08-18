import React, { useState } from 'react';
import AssistantSelector from './components/AssistantSelector';
import InputBox from './components/InputBox';
import './styles.css';

// Mock translation object
const mockTranslations = {
  modePersonal: "Personal",
  modeGeneral: "General",
  askPersonalPlaceholder: "Ask Personal Assistant regarding farming, weather, market price, government policies...",
  askGeneralPlaceholder: "Ask General Assistant regarding farming, weather, market price, government policies..."
};

export default function App() {
  const [mode, setMode] = useState("general");
  const [message, setMessage] = useState("");

  const handleSend = (value: string) => {
    console.log("Sent:", value);
    setMessage(value);
  };

  const handleModeChange = (newMode: string) => {
    console.log("Mode changed to:", newMode);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#F4F7FB',
      padding: '20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(16, 24, 40, 0.1)'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#0F172A',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          Assistant Selector Size Comparison
        </h1>
        
        <div style={{
          marginBottom: '32px',
          padding: '20px',
          background: '#F9FAFB',
          borderRadius: '12px',
          border: '1px solid #E5E7EB'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '16px'
          }}>
            Standalone Assistant Selector
          </h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <AssistantSelector
              mode={mode}
              setMode={setMode}
              t={mockTranslations}
              email="test@example.com"
              onModeChange={handleModeChange}
            />
            <span style={{ color: '#6B7280', fontSize: '14px' }}>
              Now matches the size of send and mic buttons
            </span>
          </div>
        </div>

        <div style={{
          marginBottom: '32px',
          padding: '20px',
          background: '#F9FAFB',
          borderRadius: '12px',
          border: '1px solid #E5E7EB'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '16px'
          }}>
            Complete Input Box with All Buttons
          </h2>
          <InputBox
            placeholder="Type your message..."
            mode={mode}
            setMode={setMode}
            onSend={handleSend}
            disabled={false}
            t={mockTranslations}
            email="test@example.com"
            selectedLanguage="en"
          />
        </div>

        {message && (
          <div style={{
            padding: '16px',
            background: '#EFF9EF',
            borderRadius: '8px',
            border: '1px solid #CFE8D0',
            color: '#1F7507'
          }}>
            <strong>Last message sent:</strong> {message}
          </div>
        )}

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#FEF3C7',
          borderRadius: '8px',
          border: '1px solid #F59E0B',
          color: '#92400E',
          fontSize: '14px'
        }}>
          <strong>Note:</strong> The AssistantSelector button now has the same dimensions (56x56px) as the send and mic buttons, 
          with proper hover effects and responsive text handling.
        </div>
      </div>
    </div>
  );
}