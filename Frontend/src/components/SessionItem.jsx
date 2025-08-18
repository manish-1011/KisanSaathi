import React, { useRef, useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Share } from "lucide-react";

export default function SessionItem({ 
  session, 
  isSelected, 
  isEditing, 
  tempName, 
  menuFor, 
  onSelectSession, 
  onStartRename, 
  onCommitRename, 
  onSetTempName, 
  onSetMenuFor, 
  onShare, 
  onDelete, 
  t 
}) {
  const menuRef = useRef(null);

  // Function to get translated chat name
  const getDisplayName = (sessionName) => {
    if (!sessionName || sessionName.trim() === "") {
      return t.defaultChatName || t.newChat;
    }
    
    // Check if it's a default name in any language and translate it
    const defaultNames = [
      "New Chat", "नई चैट", "नवी चॅट", "નવી ચેટ", "নতুন চ্যাট", 
      "புதிய அரட்டை", "కొత్త చాట్", "ಹೊಸ ಚಾಟ್", "പുതിയ ചാറ്റ്", 
      "ਨਵੀਂ ਚੈਟ", "ନୂଆ ଚାଟ୍", "নতুন চেট"
    ];
    
    if (defaultNames.includes(sessionName)) {
      return t.defaultChatName || t.newChat;
    }
    
    return sessionName;
  };

  return (
    <div className={`sb-item ${isSelected ? "active" : ""}`}>
      {isEditing ? (
        <input
          className="sb-rename-input"
          autoFocus
          value={tempName}
          onChange={(e) => onSetTempName(e.target.value)}
          onBlur={() => onCommitRename(session)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCommitRename(session);
            if (e.key === 'Escape') onSetMenuFor(null);
          }}
        />
      ) : (
        <button 
          className="sb-item-name" 
          onClick={() => onSelectSession(session.session_id)}
        >
          {getDisplayName(session.session_name)}
        </button>
      )}
      <div className="sb-item-actions">
        <button 
          className="sb-kebab" 
          title="Session options" 
          onClick={(ev) => {
            ev.stopPropagation();
            onSetMenuFor(menuFor === session.session_id ? null : session.session_id);
          }}
        >
          <MoreHorizontal size={20} />
        </button>
        {menuFor === session.session_id && (
          <div ref={menuRef} className="sb-menu">
            <button 
              className="sb-menu-item" 
              onClick={() => {
                onSetMenuFor(null);
                onShare(session);
              }}
            >
              <Share size={16} />
              <span>{t.share}</span>
            </button>
            <button 
              className="sb-menu-item" 
              onClick={() => onStartRename(session)}
            >
              <Pencil size={16} />
              <span>{t.rename}</span>
            </button>
            <button 
              className="sb-menu-item danger" 
              onClick={() => {
                onSetMenuFor(null);
                onDelete(session);
              }}
            >
              <Trash2 size={16} />
              <span>{t.delete}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}