import { useState, useCallback } from 'react';
import { api } from '../api';

export const usePagination = (userEmail, language) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState(null);

  const LIMIT = 15;

  // Load initial sessions
  const loadInitialSessions = useCallback(async () => {
    if (!userEmail || !language) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.history({
        domain: "list-session",
        user_email: userEmail,
        language,
        limit: LIMIT,
        offset: 0
      });

      if (response && response.sessions) {
        setSessions(response.sessions);
        setOffset(0);
        setHasMore(response.sessions.length === LIMIT);
      } else {
        setSessions([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading initial sessions:', err);
      setError(err.message);
      setSessions([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [userEmail, language]);

  // Load more sessions
  const loadMoreSessions = useCallback(async () => {
    if (!userEmail || !language || loading || !hasMore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const nextOffset = offset + 1;
      const response = await api.history({
        domain: "list-session",
        user_email: userEmail,
        language,
        limit: LIMIT,
        offset: nextOffset
      });

      if (response && response.sessions) {
        // Merge new sessions with existing ones, avoiding duplicates
        setSessions(prevSessions => {
          const existingIds = new Set(prevSessions.map(s => s.session_id));
          const newSessions = response.sessions.filter(s => !existingIds.has(s.session_id));
          return [...prevSessions, ...newSessions];
        });
        
        setOffset(nextOffset);
        setHasMore(response.sessions.length === LIMIT);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more sessions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userEmail, language, loading, hasMore, offset]);

  // Reset pagination state
  const resetPagination = useCallback(() => {
    setSessions([]);
    setOffset(0);
    setHasMore(true);
    setError(null);
  }, []);

  // Update a specific session (for rename operations)
  const updateSession = useCallback((sessionId, updates) => {
    setSessions(prevSessions => 
      prevSessions.map(session => 
        session.session_id === sessionId 
          ? { ...session, ...updates }
          : session
      )
    );
  }, []);

  // Remove a session (for delete operations)
  const removeSession = useCallback((sessionId) => {
    setSessions(prevSessions => 
      prevSessions.filter(session => session.session_id !== sessionId)
    );
  }, []);

  return {
    sessions,
    loading,
    hasMore,
    error,
    loadInitialSessions,
    loadMoreSessions,
    resetPagination,
    updateSession,
    removeSession
  };
};