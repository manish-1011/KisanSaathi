import React, { useState } from 'react';
import InitialSetupModal from './components/InitialSetupModal';
import './styles.css';

export default function InitialSetupModalPreview() {
  const [showModal, setShowModal] = useState(true);
  const [setupData, setSetupData] = useState(null);

  const handleComplete = (data: { language: string; pincode: string; mode: string }) => {
    setSetupData(data);
    setShowModal(false);
    console.log('Setup completed with:', data);
  };

  const resetModal = () => {
    setShowModal(true);
    setSetupData(null);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg)', 
      padding: '20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        background: '#fff',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          color: 'var(--brand)', 
          marginBottom: '24px',
          fontSize: '28px',
          fontWeight: '800'
        }}>
          KisanSaathi Initial Setup Modal Test
        </h1>
        
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#374151' }}>
            Current Behavior:
          </h2>
          <ul style={{ color: '#6B7280', lineHeight: '1.6' }}>
            <li>Modal appears when user opens UI via link (first time)</li>
            <li>Modal does NOT appear on page reload (uses sessionStorage)</li>
            <li>User selects language first, then preferences</li>
            <li>Data is stored in localStorage and sent to backend</li>
          </ul>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#374151' }}>
            Test Controls:
          </h2>
          <button
            onClick={resetModal}
            style={{
              background: 'var(--ks-gradient)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginRight: '12px'
            }}
          >
            Show Setup Modal
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem('ks_initial_setup');
              window.location.reload();
            }}
            style={{
              background: '#6B7280',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Clear Session & Reload
          </button>
        </div>

        {setupData && (
          <div style={{ 
            background: '#F0F9FF', 
            border: '2px solid var(--brand-3)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <h3 style={{ color: 'var(--brand)', marginBottom: '12px' }}>
              Setup Completed!
            </h3>
            <div style={{ color: '#374151' }}>
              <p><strong>Language:</strong> {setupData.language}</p>
              <p><strong>Pincode:</strong> {setupData.pincode}</p>
              <p><strong>Mode:</strong> {setupData.mode}</p>
            </div>
          </div>
        )}

        <div style={{ 
          background: '#FEF3C7', 
          border: '1px solid #F59E0B',
          borderRadius: '8px',
          padding: '16px',
          color: '#92400E'
        }}>
          <strong>Note:</strong> The modal should now be visible with proper styling. 
          If you still don't see it in your main app, check the browser console for any JavaScript errors 
          and ensure sessionStorage doesn't have 'ks_initial_setup' key set.
        </div>
      </div>

      <InitialSetupModal
        open={showModal}
        onComplete={handleComplete}
        initialLang="en"
      />
    </div>
  );
}