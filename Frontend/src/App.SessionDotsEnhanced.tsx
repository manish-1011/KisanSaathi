import React, { useState } from 'react';
import SessionItem from './components/SessionItem';
import './styles.css';

// Mock sessions data for demonstration
const mockSessionsByBucket = {
  "Today": [
    { session_id: '1', session_name: 'How to do rice farming' },
    { session_id: '2', session_name: 'Best practices for wheat cultivation' },
    { session_id: '3', session_name: 'Pest control strategies' },
    { session_id: '4', session_name: 'Organic farming techniques' }
  ],
  "Yesterday": [
    { session_id: '5', session_name: 'Crop rotation benefits' },
    { session_id: '6', session_name: 'Soil health management' }
  ],
  "Last Week": [
    { session_id: '7', session_name: 'Weather forecasting for farmers' },
    { session_id: '8', session_name: 'Market price analysis' },
    { session_id: '9', session_name: 'Irrigation system setup' }
  ]
};

// Mock translations
const mockTranslations = {
  share: "Share",
  rename: "Rename", 
  delete: "Delete"
};

export default function App() {
  const [selectedId, setSelectedId] = useState('1');
  const [editingId, setEditingId] = useState(null);
  const [tempName, setTempName] = useState('');
  const [menuFor, setMenuFor] = useState(null);

  const handleSelectSession = (sessionId: string) => {
    setSelectedId(sessionId);
  };

  const handleStartRename = (session: any) => {
    setEditingId(session.session_id);
    setTempName(session.session_name || '');
    setMenuFor(null);
  };

  const handleCommitRename = (session: any) => {
    // In a real app, this would update the session name
    console.log('Renaming session:', session.session_id, 'to:', tempName);
    setEditingId(null);
    setTempName('');
  };

  const handleShare = (session: any) => {
    console.log('Sharing session:', session.session_id);
  };

  const handleDelete = (session: any) => {
    console.log('Deleting session:', session.session_id);
  };

  return (
    <div className="app">
      <div className="topbar">
        <div className="tb-left">
          <div className="topbar-logo">
            <img src="/logo.png" alt="KisanSathi" className="logo-img" />
            <div className="brand-name">KisanSathi</div>
          </div>
        </div>
        <div className="tb-right">
          <div className="editable-pincode display">
            <span className="pincode-text">Enhanced Session Dots Demo</span>
          </div>
        </div>
      </div>

      <div className="layout">
        <div className="sidebar desktop">
          <div className="sb-inner">
            <div className="sidebar-head">
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#374151' }}>
                Chat History
              </h2>
            </div>

            <div className="sb-section sb-actions">
              <button className="sb-link sb-new-chat">
                <span>+ New Chat</span>
              </button>
            </div>

            <div className="sb-section sb-chats">
              <div className="sb-heading">Recent Conversations</div>
              
              {Object.keys(mockSessionsByBucket).map((bucket) => (
                <div key={bucket} className="sb-bucket">
                  <div className="bucket-title">{bucket}</div>
                  {mockSessionsByBucket[bucket].map((session) => (
                    <SessionItem
                      key={session.session_id}
                      session={session}
                      isSelected={selectedId === session.session_id}
                      isEditing={editingId === session.session_id}
                      tempName={tempName}
                      menuFor={menuFor}
                      onSelectSession={handleSelectSession}
                      onStartRename={handleStartRename}
                      onCommitRename={handleCommitRename}
                      onSetTempName={setTempName}
                      onSetMenuFor={setMenuFor}
                      onShare={handleShare}
                      onDelete={handleDelete}
                      t={mockTranslations}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="main">
          <div className="empty-viewport">
            <div className="bigprompt-wrap">
              <h1 className="welcome-title">Enhanced Session Dots</h1>
              <div style={{ 
                background: '#F0F9FF', 
                border: '1px solid #BFDBFE', 
                borderRadius: '12px', 
                padding: '20px', 
                maxWidth: '600px',
                textAlign: 'center' as const
              }}>
                <h3 style={{ color: '#1F7507', marginTop: 0 }}>✨ Enhancement Applied!</h3>
                <p style={{ color: '#374151', lineHeight: '1.6' }}>
                  Hover over any session in the sidebar to see the enhanced 3 dots menu button. 
                  The dots now scale up by 30% on hover and have a slightly larger base size (20px instead of 18px) 
                  for better visibility and interaction.
                </p>
                <div style={{ 
                  background: '#fff', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '8px', 
                  padding: '12px', 
                  marginTop: '16px',
                  fontSize: '14px',
                  color: '#6B7280'
                }}>
                  <strong>Changes made:</strong><br />
                  • Increased icon size from 18px to 20px<br />
                  • Added scale(1.3) transform on hover<br />
                  • Smooth transition animation (0.2s ease)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}