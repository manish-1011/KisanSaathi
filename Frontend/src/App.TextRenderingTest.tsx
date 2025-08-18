import React, { useState } from 'react';
import MarkdownRenderer from './components/MarkdownRenderer';
import './index.css';

const App: React.FC = () => {
  const [language, setLanguage] = useState('hi');

  // Sample text with formatting issues that need to be fixed
  const sampleTexts = {
    en: `In Mahuva, cotton is around ₹7235 per quintal today.

Tip: Prices fluctuate; check again before selling.`,
    hi: `तुमच्या २ एकर स्वर्ण भातासाठी, जेव्हा रोपे भरून येतात तेव्हा: * मूळ कजण्यापासून रोखण्यासाठी **जास्त पाणी तावडतोब कापून टाका.** * पुनर्प्रीती वाढवण्यासाठी **युरिया खत** (अंदाजे ४० किलो/एकर) विमाजित डोसमध्ये द्या. * पाणी सावल्यामुळे **कीटक/रोग** प्रादुर्भाव **आहे का ते तपासा; आवश्यक असल्यास योग्य कीटकनाशके फवारणी करा** (पुरानंतर स्प्रेट सामान्य आहे). * वाढत्या वाढीसाठी सूक्ष्म पोषक घटकांचा (जस्त, लोह) **पानेरील फवारणी** विचारात घ्या. * जर रोपांना गंभीर नुकसान झाले असेल, तर ७-१० दिवसांनी **पुन्हा भरणी** करावी लागू शकते.

पुढील: पुरानंतर विशिष्ट कीटक किंवा रोगाचे व्यवस्थापन करण्यासाठी तुम्हाला सल्ल्याची आवश्यकता आहे का?`
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Text Rendering Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          Language: 
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ marginLeft: '10px' }}>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
        </label>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3>User Message (Green Bubble)</h3>
          <div className="bubble user" lang={language}>
            <MarkdownRenderer text={sampleTexts[language as keyof typeof sampleTexts]} />
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3>Bot Message (White Bubble)</h3>
          <div className="bubble bot" lang={language}>
            <MarkdownRenderer text={sampleTexts[language as keyof typeof sampleTexts]} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Raw Text Preview</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px', fontSize: '12px' }}>
          {sampleTexts[language as keyof typeof sampleTexts]}
        </pre>
      </div>
    </div>
  );
};

export default App;