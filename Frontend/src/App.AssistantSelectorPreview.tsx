import React, { useState } from 'react';
import AssistantSelector from './components/AssistantSelector';
import './styles.css';

// Mock translations
const mockTranslations = {
  modePersonal: "Personal Assistant",
  modeGeneral: "General Assistant"
};

export default function App() {
  const [mode, setMode] = useState("personal");

  return (
    <div style={{ padding: '20px', backgroundColor: '#F4F7FB', minHeight: '100vh' }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '700', 
          color: '#0F172A', 
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          Assistant Selector Preview
        </h1>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          padding: '20px',
          backgroundColor: '#F9FAFB',
          borderRadius: '12px',
          border: '1px solid #E5E9F2'
        }}>
          <span style={{ fontSize: '17px', color: '#374151', fontWeight: '500' }}>
            Choose Assistant:
          </span>
          
          <AssistantSelector
            mode={mode}
            setMode={setMode}
            t={mockTranslations}
            email="test@example.com"
          />
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            fontSize: '17px',
            color: '#6B7280'
          }}>
            <span>🔍</span>
            <span>🔗</span>
            <span>👤</span>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          backgroundColor: '#F0F9FF', 
          borderRadius: '8px',
          border: '1px solid #BFDBFE'
        }}>
          <p style={{ margin: '0', color: '#374151', fontSize: '14px' }}>
            <strong>Current Mode:</strong> {mode === "personal" ? "Personal Assistant" : "General Assistant"}
          </p>
        </div>
      </div>
    </div>
  );
}