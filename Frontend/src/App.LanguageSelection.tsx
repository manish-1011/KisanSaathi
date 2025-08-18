import React, { useState } from 'react';
import InitialSetupModal from './components/InitialSetupModal';
import './styles.css';

export default function LanguageSelectionPreview() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [setupData, setSetupData] = useState(null);

  const handleSetupComplete = (data) => {
    console.log('Setup completed with data:', data);
    setSetupData(data);
    setIsModalOpen(false);
  };

  const handleReopenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#F4F7FB',
      padding: '20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#0F172A',
          marginBottom: '20px'
        }}>
          Language Selection Modal Preview
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#6B7280',
          marginBottom: '30px'
        }}>
          This preview shows the improved language selection modal with 5x2 grid layout and API integration.
        </p>

        <button
          onClick={handleReopenModal}
          style={{
            background: 'linear-gradient(100deg, #0F3E00 0%, #1F7507 42%, #79C940 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '30px'
          }}
        >
          Open Language Selection Modal
        </button>

        {setupData && (
          <div style={{
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'left',
            marginTop: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#0F172A',
              marginBottom: '12px'
            }}>
              Setup Data:
            </h3>
            <pre style={{
              background: '#F9FAFB',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#374151',
              overflow: 'auto'
            }}>
              {JSON.stringify(setupData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <InitialSetupModal
        open={isModalOpen}
        onComplete={handleSetupComplete}
        initialLang="en"
        userEmail="demo@example.com"
      />
    </div>
  );
}