import React from 'react';
import App from './App.jsx';

// Preview component showing the updated App without image preloading indicator
export default function AppPreloadRemoved() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <App />
    </div>
  );
}