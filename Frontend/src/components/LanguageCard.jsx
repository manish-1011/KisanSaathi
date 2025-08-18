import React from 'react';

export default function LanguageCard({ language, isSelected, onSelect }) {
  return (
    <button
      className={`language-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <span className="language-name">{language.name}</span>
      <span className="language-native">{language.nativeName}</span>
    </button>
  );
}