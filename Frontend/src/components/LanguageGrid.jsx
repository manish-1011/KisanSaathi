import React from 'react';
import LanguageCard from './LanguageCard';

const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" }
];

export default function LanguageGrid({ onLanguageSelect, selectedLang }) {
  const firstRowLanguages = LANGUAGES.slice(0, 5);
  const secondRowLanguages = LANGUAGES.slice(5, 10);

  return (
    <div className="language-selection-container">
      {/* First row - 5 languages */}
      <div className="language-row">
        {firstRowLanguages.map((lang) => (
          <LanguageCard
            key={lang.code}
            language={lang}
            isSelected={selectedLang === lang.code}
            onSelect={() => onLanguageSelect(lang.code)}
          />
        ))}
      </div>
      
      {/* Second row - 5 languages */}
      <div className="language-row">
        {secondRowLanguages.map((lang) => (
          <LanguageCard
            key={lang.code}
            language={lang}
            isSelected={selectedLang === lang.code}
            onSelect={() => onLanguageSelect(lang.code)}
          />
        ))}
      </div>
    </div>
  );
}