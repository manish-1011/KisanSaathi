// -------------------------
// File: src/components/FeedbackModal.jsx
// -------------------------
import React, { useState, useEffect } from "react";

export default function FeedbackModal({ open, thumb, onClose, onSubmit }) {
  const [text, setText] = useState("");
  useEffect(()=>{ if(open) setText(""); }, [open]);
  if (!open) return null;
  const title = thumb === 'down' ? 'Help us improve (optional)' : 'Thanks! Any details? (optional)';
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{title}</h3>
        <div style={{padding:"12px 0"}}>
          <textarea
            value={text}
            onChange={(e)=>setText(e.target.value)}
            placeholder="What could KisanSaathi have done better?"
            style={{width:'100%',minHeight:160,resize:'vertical',padding:12,borderRadius:12,border:'1px solid var(--border)',background:'var(--panel)',color:'var(--text)'}}
          />
        </div>
        <div className="modal-actions">
          <button className="pill" onClick={onClose}>Cancel</button>
          <button className="primary" onClick={()=>onSubmit(text)}>Submit Feedback</button>
        </div>
      </div>
    </div>
  );
}