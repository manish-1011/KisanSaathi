import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, t, sessionId }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate the shareable link based on current URL and session ID
  const shareableLink = `${window.location.origin}/shared/${sessionId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareableLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="share-modal-backdrop" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h3 className="share-modal-title">{t.sharePublicLink}</h3>
          <button className="share-modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        
        <div className="share-modal-content">
          <div className="share-privacy-notice">
            {t.sharePrivacyNotice}
          </div>
          
          <div className="share-link-container">
            <div className="share-link-input">
              {shareableLink}
            </div>
            <button 
              className={`share-copy-button ${copied ? 'copied' : ''}`}
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <Check size={16} />
                  {t.linkCopied}
                </>
              ) : (
                <>
                  <Copy size={16} />
                  {t.copyLink}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
