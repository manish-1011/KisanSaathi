import React, { useState } from 'react';
import { STRINGS } from './strings';
import AssistantSelector from './components/AssistantSelector';
import LanguageGrid from './components/LanguageGrid';
import BigPrompt from './components/BigPrompt';
import InputBox from './components/InputBox';
import './styles.css';

export default function LanguageAssistantTest() {
  const [lang, setLang] = useState('hi');
  const [mode, setMode] = useState('personal');
  const [email] = useState('test@example.com');

  const t = STRINGS[lang] || STRINGS.en;

  const handleLanguageSelect = (selectedLang: string) => {
    setLang(selectedLang);
  };

  const handleSend = (message: string) => {
    console.log('Message sent:', message);
    alert(`Message sent: ${message}`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Language Assistant Test</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>Language Selection</h2>
        <LanguageGrid 
          onLanguageSelect={handleLanguageSelect}
          selectedLang={lang}
        />
        <p>Current Language: <strong>{lang}</strong></p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Assistant Mode Test</h2>
        <div style={{ marginBottom: '20px' }}>
          <AssistantSelector
            mode={mode}
            setMode={setMode}
            t={t}
            email={email}
          />
        </div>
        <p>Current Mode: <strong>{mode}</strong></p>
        <p>Mode Label: <strong>{mode === 'personal' ? t.modePersonal : t.modeGeneral}</strong></p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>BigPrompt Component (Hero Section)</h2>
        <BigPrompt
          title={t.welcome('Test User')}
          placeholder={t.askPlaceholder}
          mode={mode}
          setMode={setMode}
          onSend={handleSend}
          t={t}
          email={email}
          selectedLanguage={lang}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>InputBox Component (Chat Input)</h2>
        <InputBox
          placeholder={t.messagePlaceholder}
          mode={mode}
          setMode={setMode}
          onSend={handleSend}
          disabled={false}
          t={t}
          email={email}
          selectedLanguage={lang}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Placeholder Text Preview</h2>
        <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
          <p><strong>Personal Assistant Placeholder:</strong></p>
          <p style={{ fontStyle: 'italic', color: '#666' }}>
            {t.askPersonalPlaceholder || 'Not available for this language'}
          </p>
          
          <p><strong>General Assistant Placeholder:</strong></p>
          <p style={{ fontStyle: 'italic', color: '#666' }}>
            {t.askGeneralPlaceholder || 'Not available for this language'}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Instructions</h2>
        <ol>
          <li>Select different languages from the language grid above</li>
          <li>Switch between Personal and General assistant modes</li>
          <li>Notice how the placeholder text changes based on both language and mode</li>
          <li>The placeholder text should be different for Personal vs General assistant in each language</li>
        </ol>
      </div>
    </div>
  );
}