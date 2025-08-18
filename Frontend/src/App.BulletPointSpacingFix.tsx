import React from 'react';
import BulletPointSpacingDemo from './components/BulletPointSpacingDemo';

export default function BulletPointSpacingFixPreview() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#F4F7FB',
      fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
    }}>
      <BulletPointSpacingDemo />
    </div>
  );
}