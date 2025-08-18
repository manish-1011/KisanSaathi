import React, { useState } from 'react';
import SessionItem from './components/SessionItem';
import './index.css';

const App: React.FC = () => {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [menuFor, setMenuFor] = useState<string | null>(null);

  // Mock translation object
  const t = {
    defaultChatName: 'New Chat',
    newChat: 'New Chat',
    share: 'Share',
    rename: 'Rename',
    delete: 'Delete'
  };

  // Mock session data with various name lengths
  const mockSessions = [
    {
      session_id: '1',
      session_name: 'I am sowing wheat next week, what is the best time?'
    },
    {
      session_id: '2', 
      session_name: 'Short name'
    },
    {
      session_id: '3',
      session_name: 'This is a very long session name that should be truncated properly to avoid collision with the kebab menu'
    },
    {
      session_id: '4',
      session_name: 'Medium length session name here'
    },
    {
      session_id: '5',
      session_name: 'New Chat'
    },
    {
      session_id: '6',
      session_name: 'Another extremely long session name that demonstrates the text truncation functionality working correctly'
    }
  ];

  const handleSelectSession = (sessionId: string) => {
    setSelectedSession(sessionId);
    setMenuFor(null);
  };

  const handleStartRename = (session: any) => {
    setEditingSession(session.session_id);
    setTempName(session.session_name);
    setMenuFor(null);
  };

  const handleCommitRename = (session: any) => {
    // In real app, this would update the session name
    console.log('Renaming session:', session.session_id, 'to:', tempName);
    setEditingSession(null);
    setTempName('');
  };

  const handleShare = (session: any) => {
    console.log('Sharing session:', session.session_id);
  };

  const handleDelete = (session: any) => {
    console.log('Deleting session:', session.session_id);
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <h1 className="main-title">Session Item Demo - Text Truncation Fix</h1>
        
        <div className="demo-sections">
          <div className="demo-section">
            <h2 className="section-title">Sidebar Session Items</h2>
            <p className="section-description">
              Session names are now truncated to 20 characters to prevent collision with the kebab menu (three dots). 
              Hover over truncated items to see the full name in a tooltip.
            </p>
            
            <div className="sidebar-demo">
              <div className="sidebar-mock">
                <div className="sb-section sb-chats">
                  <h3 className="sb-heading">Recent Chats</h3>
                  {mockSessions.map((session) => (
                    <SessionItem
                      key={session.session_id}
                      session={session}
                      isSelected={selectedSession === session.session_id}
                      isEditing={editingSession === session.session_id}
                      tempName={tempName}
                      menuFor={menuFor}
                      onSelectSession={handleSelectSession}
                      onStartRename={handleStartRename}
                      onCommitRename={handleCommitRename}
                      onSetTempName={setTempName}
                      onSetMenuFor={setMenuFor}
                      onShare={handleShare}
                      onDelete={handleDelete}
                      t={t}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="demo-section">
            <h2 className="section-title">Key Improvements</h2>
            <ul className="improvement-list">
              <li><strong>Text Truncation:</strong> Session names longer than 20 characters are truncated with "..." to prevent overflow</li>
              <li><strong>Tooltip Support:</strong> Full session name is shown on hover for truncated items</li>
              <li><strong>Proper Spacing:</strong> Kebab menu (three dots) now has consistent spacing from session names</li>
              <li><strong>CSS Improvements:</strong> Better flex layout with proper min-width and max-width constraints</li>
              <li><strong>Visual Hierarchy:</strong> Clear separation between session name and action buttons</li>
            </ul>
          </div>

          <div className="demo-section">
            <h2 className="section-title">Test Cases</h2>
            <div className="test-cases">
              <div className="test-case">
                <strong>Long Name:</strong> "I am sowing wheat next week, what is the best time?" → "I am sowing wheat ne..."
              </div>
              <div className="test-case">
                <strong>Short Name:</strong> "Short name" → "Short name" (no truncation)
              </div>
              <div className="test-case">
                <strong>Default Name:</strong> "New Chat" → Translated to current language
              </div>
              <div className="test-case">
                <strong>Very Long:</strong> "This is a very long session name..." → "This is a very long..."
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;