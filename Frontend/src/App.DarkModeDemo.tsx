import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import TopBar from './components/TopBar';
import { STRINGS } from './strings';

// Mock data for preview
const mockProps = {
  brand: "KisanSaathi",
  lang: "en",
  setLang: () => {},
  onUpdatePincode: async () => {},
  pincode: "400001",
  t: STRINGS.en
};

export default function DarkModeDemo() {
  return (
    <ThemeProvider>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <TopBar {...mockProps} />
        
        <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 800, 
            color: 'var(--text)', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Dark Mode Demo
          </h1>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '20px',
            marginTop: '40px'
          }}>
            {/* Sample Cards */}
            <div style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(16, 24, 40, 0.1)'
            }}>
              <h3 style={{ color: 'var(--text)', marginBottom: '12px' }}>Sample Card 1</h3>
              <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
                This is a sample card to demonstrate how the dark mode affects different UI elements. 
                The theme toggle is located in the top bar next to the pincode.
              </p>
            </div>
            
            <div style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(16, 24, 40, 0.1)'
            }}>
              <h3 style={{ color: 'var(--text)', marginBottom: '12px' }}>Sample Card 2</h3>
              <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
                Click the sun/moon icon in the top bar to switch between light and dark modes. 
                The theme preference is saved in localStorage.
              </p>
            </div>
            
            <div style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(16, 24, 40, 0.1)'
            }}>
              <h3 style={{ color: 'var(--text)', marginBottom: '12px' }}>Sample Card 3</h3>
              <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
                The dark mode uses a sophisticated color palette that maintains readability 
                while providing a comfortable viewing experience in low-light conditions.
              </p>
            </div>
          </div>
          
          {/* Sample Chat Bubbles */}
          <div style={{ marginTop: '60px' }}>
            <h2 style={{ color: 'var(--text)', marginBottom: '30px', textAlign: 'center' }}>
              Sample Chat Interface
            </h2>
            
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* User Message */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{
                  background: '#1F7507',
                  color: '#fff',
                  padding: '12px 16px',
                  borderRadius: '20px',
                  borderBottomRightRadius: '6px',
                  maxWidth: '75%',
                  boxShadow: '0 2px 12px rgba(16, 24, 40, 0.1)'
                }}>
                  How do I switch between light and dark mode?
                </div>
              </div>
              
              {/* Bot Message */}
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  background: 'var(--panel)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  padding: '12px 16px',
                  borderRadius: '20px',
                  borderBottomLeftRadius: '6px',
                  maxWidth: '75%',
                  boxShadow: '0 2px 12px rgba(16, 24, 40, 0.1)'
                }}>
                  You can switch between light and dark mode by clicking the sun/moon icon in the top bar, 
                  located to the left of the pincode field. The theme preference will be saved automatically.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}