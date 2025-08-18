import React, { useState } from 'react';
import AssistantSelector from './components/AssistantSelector';
import './styles.css';

// Mock translation object
const mockT = {
  modePersonal: 'Personal Assistant',
  modeGeneral: 'General Assistant',
  askPersonalPlaceholder: 'Ask Personal Assistant regarding farming, weather, market price, government policies...',
  askGeneralPlaceholder: 'Ask General Assistant regarding farming, weather, market price, government policies...'
};

export default function SpacingFixDemo() {
  const [mode, setMode] = useState('general');
  const [value, setValue] = useState('');

  const getDynamicPlaceholder = () => {
    if (mode === "personal") {
      return mockT.askPersonalPlaceholder;
    } else if (mode === "general") {
      return mockT.askGeneralPlaceholder;
    }
    return "Ask Assistant regarding farming, weather, market price, government policies...";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted:', value);
    setValue('');
  };

  return (
    <div style={{ 
      padding: '40px', 
      background: 'var(--bg)', 
      minHeight: '100vh',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        color: 'var(--text)',
        fontSize: '28px',
        fontWeight: '800'
      }}>
        Spacing Fix Demo - Closer Assistant Selector
      </h1>
      
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
      }}>
        
        {/* Hero Style Input (BigPrompt) */}
        <div>
          <h2 style={{ 
            marginBottom: '20px',
            color: 'var(--text)',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            Hero Input Style (BigPrompt)
          </h2>
          <form className="composer hero" onSubmit={handleSubmit}>
            <AssistantSelector
              mode={mode}
              setMode={setMode}
              t={mockT}
              email="test@example.com"
            />
            <input
              className="composer-input"
              placeholder={getDynamicPlaceholder()}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <button
              type="button"
              className="voice-btn"
              title="Voice to text"
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </button>
            <button
              className={`composer-send ${value.trim() ? "active" : "inactive"}`}
              title="Send"
              disabled={!value.trim()}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </form>
        </div>

        {/* Regular Style Input (InputBox) */}
        <div>
          <h2 style={{ 
            marginBottom: '20px',
            color: 'var(--text)',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            Regular Input Style (InputBox)
          </h2>
          <div className="composer-shell">
            <form className="composer" onSubmit={handleSubmit}>
              <AssistantSelector
                mode={mode}
                setMode={setMode}
                t={mockT}
                email="test@example.com"
              />
              <input 
                className="composer-input" 
                placeholder={getDynamicPlaceholder()} 
                value={value} 
                onChange={(e) => setValue(e.target.value)} 
              />
              <button 
                type="button"
                className="voice-btn" 
                title="Voice to text"
              >
                <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </button>
              <button 
                className={`composer-send ${value.trim() ? 'active' : 'inactive'}`} 
                disabled={!value.trim()} 
                title="Send"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Comparison Info */}
        <div style={{
          background: 'var(--panel)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid var(--border)'
        }}>
          <h3 style={{ 
            margin: '0 0 12px 0',
            color: 'var(--text)',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            Extreme Minimal Spacing Fix Applied
          </h3>
          <p style={{ 
            margin: '0',
            color: 'var(--muted)',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            Maximum possible spacing reduction between Assistant Selector and input field:
            <br />• Set .composer gap to 0px (no flexbox gap)
            <br />• Set .assistant-pill margin-right to -6px (aggressive negative overlap)
            <br />• Set .composer-input margin-left to -6px (aggressive negative overlap)
            <br />• Reduced .assistant-btn padding from 8px 12px to 8px 8px
            <br />• Reduced .composer-input padding from 12px 20px to 12px 16px
            <br />• Net result: Elements are touching with minimal visual separation
          </p>
        </div>
      </div>
    </div>
  );
}