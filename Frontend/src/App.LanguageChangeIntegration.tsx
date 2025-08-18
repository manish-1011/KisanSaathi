import React, { useState } from 'react';
import TopBar from './components/TopBar';
import LanguageChangeHandler from './components/LanguageChangeHandler';
import { STRINGS } from './strings';
import './index.css';
import './styles.css';

export default function LanguageChangeIntegrationPreview() {
  const [lang, setLang] = useState('en');
  const [pincode, setPincode] = useState('123456');
  const [sessionsByBucket, setSessionsByBucket] = useState({
    'Today': [
      { session_id: '1', session_name: 'Crop Disease Query', created_at: '2024-01-15T10:30:00Z' },
      { session_id: '2', session_name: 'Weather Forecast', created_at: '2024-01-15T14:20:00Z' }
    ],
    'Yesterday': [
      { session_id: '3', session_name: 'Fertilizer Advice', created_at: '2024-01-14T09:15:00Z' }
    ]
  });
  const [messages, setMessages] = useState([
    { role: 'user', text: 'What is the best fertilizer for wheat?', id: '1' },
    { role: 'bot', text: 'For wheat cultivation, I recommend using a balanced NPK fertilizer with a ratio of 20-20-20 during the initial growth phase...', id: '2' }
  ]);
  const [selectedSessionId, setSelectedSessionId] = useState('1');

  const t = STRINGS[lang] || STRINGS.en;
  const email = "demo@kisansaathi.com";

  const handleUpdatePincode = async (newPincode) => {
    setPincode(newPincode);
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 1000);
    });
  };

  const handleSessionsUpdate = (newSessions) => {
    console.log('Sessions updated:', newSessions);
    setSessionsByBucket(newSessions);
  };

  const handleSessionChatUpdate = (newMessages) => {
    console.log('Session chat updated:', newMessages);
    setMessages(newMessages);
  };

  return (
    <LanguageChangeHandler
      lang={lang}
      email={email}
      selectedSessionId={selectedSessionId}
      onSessionsUpdate={handleSessionsUpdate}
      onSessionChatUpdate={handleSessionChatUpdate}
    >
      <div style={{ minHeight: '100vh', background: '#F4F7FB' }}>
        <TopBar
          brand="KisanSaathi"
          lang={lang}
          setLang={setLang}
          onUpdatePincode={handleUpdatePincode}
          pincode={pincode}
          t={t}
        />
        
        <div style={{ 
          padding: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '20px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#0F172A',
              marginBottom: '16px'
            }}>
              Language Change Integration Demo
            </h2>
            
            <p style={{
              fontSize: '16px',
              color: '#6B7280',
              marginBottom: '20px',
              lineHeight: '1.6'
            }}>
              Change the language using the dropdown in the top bar to see the loading overlay in action. 
              The system will fetch both session list and session chat data with proper loading states.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginTop: '24px'
            }}>
              <div style={{
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '12px'
                }}>
                  Current Language: {t.language || 'Language'}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  margin: 0
                }}>
                  Selected: {lang.toUpperCase()}
                </p>
              </div>

              <div style={{
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '12px'
                }}>
                  Sessions Count
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  margin: 0
                }}>
                  {Object.values(sessionsByBucket).flat().length} sessions loaded
                </p>
              </div>

              <div style={{
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '12px'
                }}>
                  Messages Count
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  margin: 0
                }}>
                  {messages.length} messages in current session
                </p>
              </div>
            </div>
          </div>

          <div style={{
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#0F172A',
              marginBottom: '16px'
            }}>
              Features Implemented:
            </h3>
            
            <ul style={{
              color: '#374151',
              lineHeight: '1.8',
              paddingLeft: '20px'
            }}>
              <li><strong>Loading Overlay:</strong> Shows when language is changed with backdrop blur</li>
              <li><strong>Dual API Calls:</strong> Fetches both session list and session chat data</li>
              <li><strong>Race Condition Protection:</strong> Prevents multiple concurrent language changes</li>
              <li><strong>Progressive Loading:</strong> Updates UI as each API call completes</li>
              <li><strong>Error Handling:</strong> Gracefully handles API failures</li>
              <li><strong>Cache Management:</strong> Updates local cache with new translated data</li>
              <li><strong>User Feedback:</strong> Clear loading messages throughout the process</li>
            </ul>
          </div>
        </div>
      </div>
    </LanguageChangeHandler>
  );
}