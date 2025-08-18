import React from 'react';
import MarkdownRenderer from './components/MarkdownRenderer';
import './index.css';

const App: React.FC = () => {
  // Sample markdown text with market prices data
  const marketPricesText = `Okay, here are some recent Nashik market prices:

• **Tomatoes**: Retail ₹60/kg (Nashik city, good quality). Wholesale at Pimpalgaon APMC: ₹765/crate (20kg).

**Satana Market (July 2025):**

• Wheat: ₹2412 per unit
• Bajra: ₹2000 - ₹2651 per unit  
• Onion: ₹265 - ₹1550 per unit

**Nasik Wholesale Mandi (Aug 16, 2025):**

• Potato: ₹1,350 - ₹1,700 per unit
• Ridgeguard: ₹3,335 - ₹4,165 per unit`;

  const additionalTestText = `**Important Notice:**

This is a **bold text** in the middle of a sentence with **multiple bold sections** to test the rendering.

**Market Analysis:**
• **Price trends** are showing **upward movement** in most commodities
• **Supply chain** disruptions affecting **wholesale rates**
• **Retail prices** remain **stable** despite **wholesale fluctuations**

**Key Points:**
• Regular text with **bold emphasis** works properly
• **Multiple** bold **words** in **single** line
• **Complete bold sentences should work too**

Normal paragraph text with **embedded bold** and more normal text after.`;

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <h1 className="main-title">Markdown Renderer Test</h1>
        
        <div className="test-sections">
          <div className="test-section">
            <h2 className="section-title">Market Prices Data</h2>
            <div className="markdown-demo-container">
              <MarkdownRenderer text={marketPricesText} />
            </div>
          </div>

          <div className="test-section">
            <h2 className="section-title">Additional Bold Text Tests</h2>
            <div className="markdown-demo-container">
              <MarkdownRenderer text={additionalTestText} />
            </div>
          </div>

          <div className="test-section">
            <h2 className="section-title">Chat Bubble Simulation</h2>
            <div className="chat-simulation">
              {/* Bot message bubble */}
              <div className="bubble bot">
                <MarkdownRenderer text={marketPricesText} />
              </div>
              
              {/* User message bubble */}
              <div className="bubble user">
                <MarkdownRenderer text="Can you provide **more details** about **potato prices** and **market trends**?" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;