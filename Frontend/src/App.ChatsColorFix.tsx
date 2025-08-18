import React, { useState } from 'react';
import SideBar from './components/SideBar';

// Mock translation object
const mockTranslations = {
  en: {
    CHATS: 'CHATS',
    today: 'Today',
    yesterday: 'Yesterday',
    lastWeek: 'Last Week',
    lastMonth: 'Last Month',
    older: 'Older',
    newChat: 'New Chat',
    searchChats: 'Search Chats'
  }
};

// Mock session data
const mockSessionsByBucket = {
  'Today': [
    { session_id: '1', session_name: 'Cotton price inquiry' },
    { session_id: '2', session_name: 'Weather forecast for crops' }
  ],
  'Yesterday': [
    { session_id: '3', session_name: 'Pest control advice' },
    { session_id: '4', session_name: 'Fertilizer recommendations' }
  ],
  'Last Week': [
    { session_id: '5', session_name: 'Market prices discussion' },
    { session_id: '6', session_name: 'Irrigation scheduling' }
  ]
};

export default function ChatsColorFixDemo() {
  const [selectedId, setSelectedId] = useState(null);
  const [lang] = useState('en');
  
  const t = mockTranslations[lang];

  const handleNewChat = () => {
    console.log('New chat clicked');
  };

  const handleSelectSession = (session) => {
    setSelectedId(session.session_id);
  };

  const handleRename = (session, newName) => {
    console.log('Rename session:', session.session_id, 'to:', newName);
  };

  const handleDelete = (session) => {
    console.log('Delete session:', session.session_id);
  };

  const handleShare = (session) => {
    console.log('Share session:', session.session_id);
  };

  const handleOpenSearch = () => {
    console.log('Open search');
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      fontFamily: 'Inter, system-ui, sans-serif',
      background: '#F4F7FB'
    }}>
      <div style={{ width: '300px', background: '#FFFFFF', borderRight: '1px solid #E5E9F2' }}>
        <SideBar
          t={t}
          sessionsByBucket={mockSessionsByBucket}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
          onRename={handleRename}
          onDelete={handleDelete}
          onShare={handleShare}
          selectedId={selectedId}
          onClose={null}
          onOpenSearch={handleOpenSearch}
        />
      </div>
      <div style={{ 
        flex: 1, 
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '800', 
          color: '#0F172A',
          margin: 0,
          textAlign: 'center'
        }}>
          CHATS Color Fix Demo
        </h1>
        <div style={{
          background: '#FFFFFF',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid #E5E9F2',
          maxWidth: '600px',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#1F7507',
            margin: '0 0 16px 0'
          }}>
            ✅ Fixed: CHATS heading color
          </h2>
          <p style={{ 
            fontSize: '16px', 
            color: '#6B7280', 
            margin: 0,
            lineHeight: '1.5'
          }}>
            The "CHATS" heading in the sidebar is now <strong>black (#000000)</strong> while the time bucket labels like "TODAY", "YESTERDAY", etc. remain in their original gray color.
          </p>
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: '#F9FAFB',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#374151'
          }}>
            <strong>Changes made:</strong><br/>
            • Updated .sb-heading color from var(--muted) to #000000<br/>
            • Kept .bucket-title color as var(--muted) for time buckets
          </div>
        </div>
      </div>
    </div>
  );
}