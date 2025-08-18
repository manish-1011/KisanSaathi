import { useState, useCallback, useRef } from 'react';
import { api } from '../api';

export const useSessionPagination = (email, lang) => {
  const [sessionsByBucket, setSessionsByBucket] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreSessions, setHasMoreSessions] = useState(true);
  const [offset, setOffset] = useState(0);
  const debounceRef = useRef(null);
  
  const LIMIT = 15;

  // Debounce helper
  const debounce = (fn, ms = 300) => (...args) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fn(...args), ms);
  };

  // Load initial sessions (offset = 0)
  const loadInitialSessions = useCallback(async (emailArg = email) => {
    if (!emailArg) return;
    
    setIsLoading(true);
    try {
      const res = await api.history({ 
        domain: "list-session", 
        user_email: emailArg, 
        language: lang,
        limit: LIMIT,
        offset: 0
      });
      
      if (res?.data) {
        const filtered = {};
        Object.keys(res.data).forEach((k) => {
          if (Array.isArray(res.data[k]) && res.data[k].length > 0) {
            filtered[k] = res.data[k];
          }
        });
        
        // If no sessions found but Today bucket exists (empty), keep it
        if (Object.keys(filtered).length === 0 && Array.isArray(res.data["Today"])) {
          filtered["Today"] = res.data["Today"];
        }
        
        setSessionsByBucket(filtered);
        setOffset(0);
        
        // Check if we have more sessions to load
        const totalSessions = Object.values(filtered).flat().length;
        setHasMoreSessions(totalSessions >= LIMIT);
      }
    } catch (e) {
      console.error("loadInitialSessions:", e);
    } finally {
      setIsLoading(false);
    }
  }, [email, lang, LIMIT]);

  // Load more sessions (increment offset)
  const loadMoreSessions = useCallback(async () => {
    if (!email || isLoadingMore || !hasMoreSessions) return;
    
    setIsLoadingMore(true);
    const nextOffset = offset + 1;
    
    try {
      const res = await api.history({ 
        domain: "list-session", 
        user_email: email, 
        language: lang,
        limit: LIMIT,
        offset: nextOffset
      });
      
      if (res?.data) {
        const newSessions = {};
        Object.keys(res.data).forEach((k) => {
          if (Array.isArray(res.data[k]) && res.data[k].length > 0) {
            newSessions[k] = res.data[k];
          }
        });
        
        // Merge new sessions with existing ones
        setSessionsByBucket(prevSessions => {
          const merged = { ...prevSessions };
          
          Object.keys(newSessions).forEach(bucket => {
            if (merged[bucket]) {
              // Merge sessions, avoiding duplicates
              const existingIds = new Set(merged[bucket].map(s => s.session_id));
              const newSessionsToAdd = newSessions[bucket].filter(s => !existingIds.has(s.session_id));
              merged[bucket] = [...merged[bucket], ...newSessionsToAdd];
            } else {
              merged[bucket] = newSessions[bucket];
            }
          });
          
          return merged;
        });
        
        setOffset(nextOffset);
        
        // Check if we have more sessions to load
        const totalNewSessions = Object.values(newSessions).flat().length;
        setHasMoreSessions(totalNewSessions >= LIMIT);
      }
    } catch (e) {
      console.error("loadMoreSessions:", e);
    } finally {
      setIsLoadingMore(false);
    }
  }, [email, lang, offset, isLoadingMore, hasMoreSessions, LIMIT]);

  // Debounced version of loadInitialSessions
  const debouncedLoadInitialSessions = useCallback(
    debounce(loadInitialSessions, 300), 
    [loadInitialSessions]
  );

  // Reset pagination state
  const resetPagination = useCallback(() => {
    setOffset(0);
    setHasMoreSessions(true);
    setSessionsByBucket({});
  }, []);

  // Update sessions after operations like rename, delete, etc.
  const updateSessionsByBucket = useCallback((updatedSessions) => {
    setSessionsByBucket(updatedSessions);
  }, []);

  return {
    sessionsByBucket,
    isLoading,
    isLoadingMore,
    hasMoreSessions,
    offset,
    loadInitialSessions: debouncedLoadInitialSessions,
    loadMoreSessions,
    resetPagination,
    updateSessionsByBucket
  };
};