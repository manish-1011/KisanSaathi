import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api';
import LoadingOverlay from './LoadingOverlay';

export default function LanguageChangeHandler({ 
  children, 
  lang, 
  email, 
  selectedSessionId, 
  onSessionsUpdate, 
  onSessionChatUpdate,
  onLanguageChangeStart,
  onLanguageChangeComplete 
}) {
  const [isLanguageChanging, setIsLanguageChanging] = useState(false);
  const prevLangRef = useRef(lang);
  const languageChangeTokenRef = useRef(0);
  const debounceTimeoutRef = useRef(null);

  // Optimized debounced language change handler
  const debouncedLanguageChange = useCallback(async (newLang, userEmail, sessionId) => {
    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set a new timeout with optimized delay
    debounceTimeoutRef.current = setTimeout(async () => {
      const token = ++languageChangeTokenRef.current;
      setIsLanguageChanging(true);
      onLanguageChangeStart?.();
      
      try {
        // Use batch API call for better performance
        const [updateResult, batchResult] = await Promise.allSettled([
          api.updateUserInfo({
            user_email: userEmail,
            language: newLang,
          }),
          api.batchHistoryRequests({
            user_email: userEmail,
            language: newLang,
            session_id: sessionId
          })
        ]);

        // Check if this is still the latest language change request
        if (token !== languageChangeTokenRef.current) return;

        if (updateResult.status === 'rejected') {
          console.error("Failed to update user language:", updateResult.reason);
        }

        if (batchResult.status === 'fulfilled') {
          const { sessions, chat } = batchResult.value;

          // Process session list result
          if (sessions?.data) {
            const filtered = {};
            Object.keys(sessions.data).forEach((k) => {
              if (Array.isArray(sessions.data[k]) && sessions.data[k].length > 0) {
                filtered[k] = sessions.data[k];
              }
            });
            if (Object.keys(filtered).length === 0 && Array.isArray(sessions.data["Today"])) {
              filtered["Today"] = sessions.data["Today"];
            }
            onSessionsUpdate?.(filtered);
          }

          // Process session chat result if available
          if (chat?.data && sessionId) {
            const msgs = [];
            (chat.data || []).forEach((row) => {
              if (row.user_query) msgs.push({ role: "user", text: row.user_query, id: row.message_id });
              if (row.bot_message) msgs.push({ role: "bot", text: row.bot_message, id: row.message_id });
            });
            onSessionChatUpdate?.(msgs);
          }
        } else {
          console.error("Batch history request failed:", batchResult.reason);
        }

      } catch (error) {
        console.error("Language change failed:", error);
      } finally {
        // Only hide loading if this is still the latest request
        if (token === languageChangeTokenRef.current) {
          setIsLanguageChanging(false);
          onLanguageChangeComplete?.();
        }
      }
    }, 500); // Increased to 500ms to reduce API calls
  }, [onSessionsUpdate, onSessionChatUpdate, onLanguageChangeStart, onLanguageChangeComplete]);

  useEffect(() => {
    const langChanged = prevLangRef.current !== lang;
    
    if (email && langChanged) {
      debouncedLanguageChange(lang, email, selectedSessionId);
    }

    prevLangRef.current = lang;
  }, [lang, email, selectedSessionId, debouncedLanguageChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {children}
      <LoadingOverlay 
        isVisible={isLanguageChanging} 
        message="Updating language..."
      />
    </>
  );
}