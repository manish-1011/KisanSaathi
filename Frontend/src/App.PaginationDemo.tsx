import React, { useEffect, useState } from 'react';
import { usePagination } from './hooks/usePagination';
import SideBar from './components/SideBar';
import './styles.css';

// Mock translation object
const mockTranslations = {
  newChat: 'New Chat',
  searchChats: 'Search Chats',
  CHATS: 'CHATS',
  today: 'Today',
  yesterday: 'Yesterday',
  lastWeek: 'Last Week',
  lastMonth: 'Last Month',
  older: 'Older',
  share: 'Share',
  rename: 'Rename',
  delete: 'Delete',
  defaultChatName: 'New Chat',
  loadMoreSessions: 'Load More Sessions',
  loadingSessions: 'Loading Sessions...'
};

// Helper function to organize sessions by time buckets
const organizeSessions = (sessions) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const buckets = {
    'Today': [],
    'Yesterday': [],
    'Last Week': [],
    'Last Month': [],
    'Older': []
  };

  sessions.forEach(session => {
    const sessionDate = new Date(session.created_at || session.timestamp || Date.now());
    
    if (sessionDate >= today) {
      buckets['Today'].push(session);
    } else if (sessionDate >= yesterday) {
      buckets['Yesterday'].push(session);
    } else if (sessionDate >= lastWeek) {
      buckets['Last Week'].push(session);
    } else if (sessionDate >= lastMonth) {
      buckets['Last Month'].push(session);
    } else {
      buckets['Older'].push(session);
    }
  });

  return buckets;
};

export default function PaginationDemo() {
  const [userEmail] = useState('demo@example.com');
  const [language] = useState('en');
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const {
    sessions,
    loading,
    hasMore,
    error,
    loadInitialSessions,
    loadMoreSessions,
    resetPagination,
    updateSession,
    removeSession
  } = usePagination(userEmail, language);

  // Load initial sessions on mount
  useEffect(() => {
    loadInitialSessions();
  }, [loadInitialSessions]);

  // Organize sessions by time buckets
  const sessionsByBucket = organizeSessions(sessions);

  const handleNewChat = () => {
    console.log('New chat clicked');
  };

  const handleSelectSession = (sessionId) => {
    setSelectedSessionId(sessionId);
    console.log('Selected session:', sessionId);
  };

  const handleRename = async (session, newName) => {
    try {
      // Update locally first for immediate feedback
      updateSession(session.session_id, { session_name: newName });
      
      // Here you would call the API to update the session name
      console.log('Renaming session:', session.session_id, 'to:', newName);
    } catch (error) {
      console.error('Error renaming session:', error);
      // Revert the change if API call fails
      updateSession(session.session_id, { session_name: session.session_name });
    }
  };

  const handleDelete = async (session) => {
    try {
      // Remove locally first for immediate feedback
      removeSession(session.session_id);
      
      // Here you would call the API to delete the session
      console.log('Deleting session:', session.session_id);
    } catch (error) {
      console.error('Error deleting session:', error);
      // You might want to reload sessions if delete fails
    }
  };

  const handleShare = (session) => {
    console.log('Sharing session:', session.session_id);
  };

  const handleOpenSearch = () => {
    console.log('Opening search');
  };

  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <h2>Error Loading Sessions</h2>
          <p>{error}</p>
          <button onClick={loadInitialSessions}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="topbar">
        <div className="tb-left">
          <div className="topbar-logo">
            <div className="brand-name">KisanSathi</div>
          </div>
        </div>
        <div className="tb-right">
          <div className="language-dropdown">
            <select className="lang-select-clean">
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="layout">
        <div className="sidebar desktop">
          <SideBar
            t={mockTranslations}
            sessionsByBucket={sessionsByBucket}
            onNewChat={handleNewChat}
            onSelectSession={handleSelectSession}
            onRename={handleRename}
            onDelete={handleDelete}
            onShare={handleShare}
            selectedId={selectedSessionId}
            onOpenSearch={handleOpenSearch}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMoreSessions}
          />
        </div>
        
        <div className="main">
          <div className="chat-window">
            <div className="chat-track">
              {selectedSessionId ? (
                <div className="selected-session-info">
                  <h3>Selected Session: {selectedSessionId}</h3>
                  <p>Total Sessions Loaded: {sessions.length}</p>
                  <p>Has More: {hasMore ? 'Yes' : 'No'}</p>
                  <p>Loading: {loading ? 'Yes' : 'No'}</p>
                </div>
              ) : (
                <div className="empty-viewport">
                  <div className="welcome-title">Session Pagination Demo</div>
                  <div className="demo-stats">
                    <p><strong>Total Sessions Loaded:</strong> {sessions.length}</p>
                    <p><strong>Has More Sessions:</strong> {hasMore ? 'Yes' : 'No'}</p>
                    <p><strong>Currently Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                    <p><strong>Sessions per page:</strong> 15</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}