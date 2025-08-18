import React from 'react';

export default function LoadingOverlay({ isVisible, message = "Fetching data..." }) {
  if (!isVisible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-overlay-backdrop" />
      <div className="loading-overlay-content">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
}