import React, { useState } from 'react';
import LoadingOverlay from './components/LoadingOverlay';
import LanguageGrid from './components/LanguageGrid';
import './index.css';

export default function LanguageChangeLoadingPreview() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [loadingMessage, setLoadingMessage] = useState('Fetching data in selected language...');

  const handleLanguageSelect = (langCode) => {
    setSelectedLang(langCode);
    setIsLoading(true);
    setLoadingMessage('Fetching data in selected language...');
    
    // Simulate API calls
    setTimeout(() => {
      setLoadingMessage('Loading session list...');
      setTimeout(() => {
        setLoadingMessage('Loading session chat...');
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const simulateLoading = () => {
    setIsLoading(true);
    setLoadingMessage('Fetching data in selected language...');
    
    setTimeout(() => {
      setLoadingMessage('Loading session list...');
      setTimeout(() => {
        setLoadingMessage('Loading session chat...');
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }, 1000);
    }, 1000);
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
          Language Change Loading Preview
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#6B7280',
          marginBottom: '30px'
        }}>
          This preview shows the loading overlay that appears when users change language. 
          It fetches both session list and session chat data with proper loading states.
        </p>

        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          marginBottom: '40px'
        }}>
          <button
            onClick={simulateLoading}
            style={{
              background: 'linear-gradient(100deg, #0F3E00 0%, #1F7507 42%, #79C940 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Simulate Language Change Loading
          </button>
        </div>

        <div style={{
          background: '#fff',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#0F172A',
            marginBottom: '20px'
          }}>
            Select a Language to See Loading State:
          </h3>
          
          <LanguageGrid 
            onLanguageSelect={handleLanguageSelect}
            selectedLang={selectedLang}
          />
        </div>

        <div style={{
          background: '#fff',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'left'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#0F172A',
            marginBottom: '12px'
          }}>
            Features:
          </h3>
          <ul style={{
            color: '#374151',
            lineHeight: '1.6',
            paddingLeft: '20px'
          }}>
            <li>Loading overlay with backdrop blur effect</li>
            <li>Animated spinner with brand colors</li>
            <li>Progressive loading messages</li>
            <li>Fetches both session list and session chat data</li>
            <li>Prevents multiple concurrent language changes</li>
            <li>Graceful error handling</li>
          </ul>
        </div>
      </div>

      <LoadingOverlay 
        isVisible={isLoading} 
        message={loadingMessage}
      />
    </div>
  );
}