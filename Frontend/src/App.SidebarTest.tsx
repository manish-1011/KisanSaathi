import React, { useState } from 'react';
import SideBar from './components/SideBar.jsx';
import './styles.css';

export default function App() {
  const [selectedId, setSelectedId] = useState('1');

  // Mock translation object
  const mockTranslations = {
    today: 'Today',
    yesterday: 'Yesterday', 
    lastWeek: 'Last Week',
    lastMonth: 'Last Month',
    older: 'Older',
    newChat: 'New Chat',
    searchChats: 'Search Chats',
    share: 'Share',
    rename: 'Rename',
    delete: 'Delete'
  };

  // Mock sessions data
  const mockSessionsByBucket = {
    'Today': [
      { session_id: '1', session_name: 'How to do rice farming' },
      { session_id: '2', session_name: 'How can we do rice farming' },
      { session_id: '3', session_name: 'Hi how r u' },
      { session_id: '4', session_name: 'What pest i should i use' }
    ],
    'Yesterday': [
      { session_id: '5', session_name: 'New Chat' },
      { session_id: '6', session_name: 'How can u help me' }
    ],
    'Last Week': [],
    'Last Month': [],
    'Older': []
  };

  const handleNewChat = () => console.log('New chat clicked');
  const handleSelectSession = (sessionId: string) => {
    setSelectedId(sessionId);
    console.log('Selected session:', sessionId);
  };
  const handleRename = (session: any, newName: string) => console.log('Rename session:', session, 'to:', newName);
  const handleDelete = (session: any) => console.log('Delete session:', session);
  const handleShare = (session: any) => console.log('Share session:', session);
  const handleOpenSearch = () => console.log('Open search');

  return (
    <>
      <style>{`
        /* Force 3 dots to be visible with strong specificity */
        .sb-kebab {
          opacity: 1 !important;
          display: flex !important;
          visibility: visible !important;
          background: rgba(107, 114, 128, 0.15) !important;
          border: 1px solid rgba(107, 114, 128, 0.3) !important;
          color: #6B7280 !important;
          width: 28px !important;
          height: 28px !important;
          border-radius: 6px !important;
          cursor: pointer !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .sb-kebab:hover {
          background: rgba(28, 130, 8, 0.15) !important;
          color: #1C8208 !important;
          border: 1px solid rgba(28, 130, 8, 0.3) !important;
        }
        .sb-item .sb-kebab {
          opacity: 1 !important;
          visibility: visible !important;
          display: flex !important;
        }
        .sb-item:hover .sb-kebab {
          opacity: 1 !important;
        }
      `}</style>
      <div style={{ 
        display: 'flex', 
        height: '100vh', 
        fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
        background: '#F4F7FB'
      }}>
        <div style={{ width: '300px', background: '#fff', borderRight: '1px solid #E5E9F2' }}>
          <SideBar
            t={mockTranslations}
            sessionsByBucket={mockSessionsByBucket}
            onNewChat={handleNewChat}
            onSelectSession={handleSelectSession}
            onRename={handleRename}
            onDelete={handleDelete}
            onShare={handleShare}
            selectedId={selectedId}
            onOpenSearch={handleOpenSearch}
          />
        </div>
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#0F172A',
          fontSize: '18px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2>Sidebar with FORCED Visible 3 Dots Menu</h2>
            <p>The horizontal 3 dots should now be DEFINITELY visible for each session</p>
            <p>They have a light background to make them more obvious</p>
            <p>Selected Session ID: {selectedId}</p>
          </div>
        </div>
      </div>
    </>
  );
}