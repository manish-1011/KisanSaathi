// -------------------------
// File: src/components/SideBar.jsx
// -------------------------
import React, { useEffect, useRef, useState } from "react";
import { Pencil, Search } from "lucide-react";
import SessionItem from "./SessionItem";

export default function SideBar({ t, sessionsByBucket, onNewChat, onSelectSession, onRename, onDelete, onShare, selectedId, onClose, onOpenSearch }) {
  const [editingId, setEditingId] = useState(null);
  const [menuFor, setMenuFor] = useState(null);
  const [tempName, setTempName] = useState("");
  const menuRef = useRef(null);

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
    const onDocClick = (e) => {
      // Close popover if clicking outside the open menu or its kebab button
      if (!menuRef.current) { setMenuFor(null); return; }
      if (menuRef.current.contains(e.target)) return;
      if (e.target.closest && e.target.closest('.sb-kebab')) return;
      setMenuFor(null);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const startInlineRename = (s) => { setMenuFor(null); setEditingId(s.session_id); setTempName(s.session_name || ""); };
  const commitRename = async (s) => {
    const name = tempName.trim();
    setEditingId(null);
    if (!name || name === s.session_name) return;
    await onRename(s, name);
  };

  return (
    <div className="sb-inner">
      <div className="sidebar-head">
        <div />
        {onClose && (<button className="sb-close" onClick={onClose} aria-label="Close sidebar">✕</button>)}
      </div>

      <div className="sb-section sb-actions">
        <button className="sb-link sb-new-chat" onClick={onNewChat}>
          <Pencil size={16}/> {t.newChat}
        </button>
        <button className="sb-link sb-search" onClick={onOpenSearch}>
          <Search size={16}/> {t.searchChats}
        </button>
      </div>

      <div className="sb-section sb-chats">
        <div className="sb-heading">{t.CHATS || "CHATS"}</div>
        {Object.keys(sessionsByBucket).map((bucket) => (
          <div key={bucket} className="sb-bucket">
            <div className="bucket-title">{translateBucket(bucket).toUpperCase()}</div>
            {sessionsByBucket[bucket].length === 0 ? (
              null
            ) : (
              sessionsByBucket[bucket].map((s) => (
                <SessionItem
                  key={s.session_id}
                  session={s}
                  isSelected={selectedId === s.session_id}
                  isEditing={editingId === s.session_id}
                  tempName={tempName}
                  menuFor={menuFor}
                  onSelectSession={onSelectSession}
                  onStartRename={startInlineRename}
                  onCommitRename={commitRename}
                  onSetTempName={setTempName}
                  onSetMenuFor={setMenuFor}
                  onShare={onShare}
                  onDelete={onDelete}
                  t={t}
                />
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}