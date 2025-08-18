import React, { useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import EnhancedMarkdownRenderer from './EnhancedMarkdownRenderer';

const BulletPointSpacingDemo: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('hi');

  // Sample text with bullet points followed by paragraphs (similar to the onion varieties example)
  const sampleTexts = {
    en: `I cannot access a live database of seed distributors. However, popular onion varieties in India include:

• **Agrifound Dark Red**: Good for export, long storage.
• **Pusa Red**: Medium-sized bulbs, early maturing.
• **Nasik Red (नासिक रेड)**: A local favorite.
• **Hisar-2 (हिसार-2)**: High yield, good keeping quality.

Check with your local agriculture extension office or seed dealer for availability and suitability to your region.`,

    hi: `मैं बीज वितरकों के लाइव डेटाबेस तक नहीं पहुंच सकता। हालांकि, भारत में लोकप्रिय प्याज की किस्में शामिल हैं:

• **एग्रीफाउंड डार्क रेड**: निर्यात के लिए अच्छा, लंबा भंडारण।
• **पूसा रेड**: मध्यम आकार के बल्ब, जल्दी पकने वाला।
• **नासिक रेड (Nasik Red)**: एक स्थानीय पसंदीदा।
• **हिसार-2 (Hisar-2)**: उच्च उपज, अच्छी रखने की गुणवत्ता।

उपलब्धता और आपके क्षेत्र के लिए उपयुक्तता के लिए अपने स्थानीय कृषि विस्तार कार्यालय या बीज डीलर से संपर्क करें।`
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#1F7507', marginBottom: '10px' }}>
          Bullet Point Spacing & Language Consistency Demo
        </h1>
        <p style={{ color: '#6B7280', fontSize: '16px' }}>
          This demo shows the improved spacing after bullet points and language consistency fixes.
        </p>
      </div>

      {/* Language Selector */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <label style={{ marginRight: '10px', fontWeight: '600' }}>
          Select Language:
        </label>
        <select 
          value={selectedLanguage} 
          onChange={(e) => setSelectedLanguage(e.target.value)}
          style={{ 
            padding: '8px 12px', 
            borderRadius: '8px', 
            border: '1px solid #E5E7EB',
            fontSize: '16px'
          }}
        >
          <option value="en">English</option>
          <option value="hi">हिंदी (Hindi)</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Original Renderer */}
        <div>
          <h2 style={{ color: '#374151', marginBottom: '15px', fontSize: '18px' }}>
            Original Renderer
          </h2>
          <div className="bubble bot" style={{ maxWidth: '100%' }}>
            <MarkdownRenderer 
              text={sampleTexts[selectedLanguage as keyof typeof sampleTexts]} 
            />
          </div>
          <div style={{ marginTop: '15px', padding: '12px', background: '#FEF3C7', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#92400E' }}>Issues:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400E' }}>
              <li>Less spacing after bullet points</li>
              <li>Language mixing in bullet points 3 & 4</li>
            </ul>
          </div>
        </div>

        {/* Enhanced Renderer */}
        <div>
          <h2 style={{ color: '#374151', marginBottom: '15px', fontSize: '18px' }}>
            Enhanced Renderer
          </h2>
          <div className="bubble bot" style={{ maxWidth: '100%' }}>
            <EnhancedMarkdownRenderer 
              text={sampleTexts[selectedLanguage as keyof typeof sampleTexts]}
              selectedLanguage={selectedLanguage}
            />
          </div>
          <div style={{ marginTop: '15px', padding: '12px', background: '#D1FAE5', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#065F46' }}>Improvements:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#065F46' }}>
              <li>Enhanced spacing after bullet lists (1.8em)</li>
              <li>Language consistency maintained</li>
              <li>Better visual separation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div style={{ marginTop: '40px', padding: '20px', background: '#F9FAFB', borderRadius: '12px' }}>
        <h3 style={{ color: '#374151', marginBottom: '15px' }}>Technical Improvements</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <h4 style={{ color: '#1F7507', marginBottom: '8px' }}>Spacing Enhancement</h4>
            <ul style={{ color: '#6B7280', lineHeight: '1.6' }}>
              <li>Added <code>.post-bullet-list-spacing</code> class</li>
              <li>Increased spacing from 1em to 1.8em</li>
              <li>Better visual separation between content blocks</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#1F7507', marginBottom: '8px' }}>Language Consistency</h4>
            <ul style={{ color: '#6B7280', lineHeight: '1.6' }}>
              <li>Added <code>selectedLanguage</code> prop</li>
              <li>Language-aware text processing</li>
              <li>Consistent script rendering</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulletPointSpacingDemo;