import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

export default function SearchModal({ isOpen, onClose, sessionsByBucket, onSelectSession, t }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSessions, setFilteredSessions] = useState([]);
  const searchInputRef = useRef(null);

  // Function to translate bucket names
  const translateBucket = (bucket) => {
    const bucketMap = {
      'Today': t.today,
      'Yesterday': t.yesterday,
      'Last Week': t.lastWeek,
      'Last Month': t.lastMonth,
      'Older': t.older
    };
    return bucketMap[bucket] || bucket;
  };

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      // Show all sessions when no search query
      const allSessions = [];
      Object.keys(sessionsByBucket).forEach(bucket => {
        sessionsByBucket[bucket].forEach(session => {
          allSessions.push({ ...session, bucket });
        });
      });
      setFilteredSessions(allSessions);
    } else {
      // Filter sessions based on search query
      const filtered = [];
      Object.keys(sessionsByBucket).forEach(bucket => {
        sessionsByBucket[bucket].forEach(session => {
          const sessionName = session.session_name || "New Chat";
          if (sessionName.toLowerCase().includes(searchQuery.toLowerCase())) {
            filtered.push({ ...session, bucket });
          }
        });
      });
      setFilteredSessions(filtered);
    }
  }, [searchQuery, sessionsByBucket]);

  const handleSessionClick = (sessionId) => {
    onSelectSession(sessionId);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Group filtered sessions by bucket
  const groupedSessions = {};
  filteredSessions.forEach(session => {
    if (!groupedSessions[session.bucket]) {
      groupedSessions[session.bucket] = [];
    }
    groupedSessions[session.bucket].push(session);
  });

  return (
    <div className="search-modal-backdrop" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-header">
          <div className="search-input-container">
            <Search size={16} className="search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="search-modal-input"
            />
          </div>
          <button className="search-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="search-modal-content">
          <div className="search-results">
            {Object.keys(groupedSessions).length === 0 ? (
              <div className="no-results">{t.noChatsFound}</div>
            ) : (
              Object.keys(groupedSessions).map(bucket => (
                <div key={bucket} className="search-bucket">
                  <div className="search-bucket-title">{translateBucket(bucket).toUpperCase()}</div>
                  {groupedSessions[bucket].map(session => (
                    <button
                      key={session.session_id}
                      className="search-result-item"
                      onClick={() => handleSessionClick(session.session_id)}
                    >
                      <Search size={14} className="search-result-icon" />
                      <span className="search-result-name">
                        {session.session_name || "New Chat"}
                      </span>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
