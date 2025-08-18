import React, { useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import ChatWindow from './components/ChatWindow';
import InputBox from './components/InputBox';
import TopBar from './components/TopBar';
import { STRINGS } from './strings';
import './styles.css';

// Mock data for preview
const mockMessages = [
  {
    id: 1,
    role: 'user',
    text: 'what is market price of soyabean in nashik ?'
  },
  {
    id: 2,
    role: 'bot',
    text: 'The current market price for soybean in Nashik, Maharashtra is around ₹4850 per quintal (average price). It may vary between ₹4000 and ₹4900. This was last updated on August 13, 2025. Prices can change, so check the NaPanta App for the latest updates.'
  },
  {
    id: 3,
    role: 'user',
    text: 'hi'
  },
  {
    id: 4,
    role: 'bot',
    text: 'Hello! How can I help you with your farming needs today? I can provide information on weather, crop practices, pest control, market prices, and government schemes.'
  },
  {
    id: 5,
    role: 'user',
    text: 'what is market price of soyabean in nashik ?'
  },
  {
    id: 6,
    role: 'bot',
    text: `The average price of soybean in Nashik today is ₹4850/Quintal.
• Lowest: ₹4000/Quintal
• Highest: ₹4900/Quintal

Prices may vary.`
  },
  {
    id: 7,
    role: 'user',
    text: '#EFF9EF'
  },
  {
    id: 8,
    role: 'bot',
    text: 'Please be more specific. What information do you need? For example, ask about weather, crop information, market prices, or something else.'
  }
];

const mockStrings = STRINGS.en || {
  messagePlaceholder: 'Ask General Assistant regarding farming, weather, market price, government policies...',
  askGeneralPlaceholder: 'Ask General Assistant regarding farming, weather, market price, government policies...',
  askPersonalPlaceholder: 'Ask Personal Assistant regarding farming, weather, market price, government policies...',
  modePersonal: 'Personal Assistant',
  modeGeneral: 'General Assistant'
};

// Force dark theme component
function ForceDarkTheme({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Force dark theme CSS variables with higher specificity
    const root = document.documentElement;
    root.setAttribute('data-theme', 'dark');
    root.style.setProperty('--bg', '#0F172A', 'important');
    root.style.setProperty('--panel', '#1E293B', 'important');
    root.style.setProperty('--border', '#334155', 'important');
    root.style.setProperty('--text', '#F1F5F9', 'important');
    root.style.setProperty('--muted', '#94A3B8', 'important');
    
    // Also update body background directly with important
    document.body.style.setProperty('background', '#0F172A', 'important');
    document.body.style.setProperty('color', '#F1F5F9', 'important');
    
    // Force all elements with white backgrounds to use dark theme
    const style = document.createElement('style');
    style.textContent = `
      [data-theme="dark"] .modal,
      [data-theme="dark"] .share-modal,
      [data-theme="dark"] .search-modal,
      [data-theme="dark"] .assistant-menu,
      [data-theme="dark"] .avatar-menu-new,
      [data-theme="dark"] .pill,
      [data-theme="dark"] input,
      [data-theme="dark"] textarea,
      [data-theme="dark"] select {
        background: var(--panel) !important;
        color: var(--text) !important;
        border-color: var(--border) !important;
      }
    `;
    document.head.appendChild(style);
    
    console.log('🌙 Dark theme forced with important styles!');
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return <>{children}</>;
}

export default function App() {
  const [mode, setMode] = React.useState('general');
  const [loading, setLoading] = React.useState(false);

  const handleSend = (message: string) => {
    console.log('Sending message:', message);
    // Mock sending functionality
  };

  const handleFeedback = ({ messageId, thumb, text }: any) => {
    console.log('Feedback:', { messageId, thumb, text });
    // Mock feedback functionality
  };

  const handleUpdatePincode = async (newPincode: string) => {
    console.log('Updating pincode:', newPincode);
    // Mock pincode update
  };

  return (
    <ThemeProvider>
      <ForceDarkTheme>
        <div className="app">
          <TopBar
            brand="KisanSaathi"
            lang="en"
            setLang={() => {}}
            onUpdatePincode={handleUpdatePincode}
            pincode="411001"
            t={mockStrings}
          />

          <div className="layout">
            <main className="main">
              <ChatWindow
                messages={mockMessages}
                onFeedback={handleFeedback}
                email="test@example.com"
                sessionId="test-session"
                loading={loading}
              />
              <InputBox
                placeholder={mockStrings.messagePlaceholder}
                mode={mode}
                setMode={setMode}
                onSend={handleSend}
                disabled={loading}
                t={mockStrings}
                email="test@example.com"
                selectedLanguage="en"
              />
            </main>
          </div>
        </div>
      </ForceDarkTheme>
    </ThemeProvider>
  );
}