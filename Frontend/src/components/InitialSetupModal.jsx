import React, { useState } from "react";
import { STRINGS } from "../strings";
import { api } from "../api";
import LanguageGrid from "./LanguageGrid";

export default function InitialSetupModal({ 
  open, 
  onComplete, 
  initialLang = "en",
  userEmail = "TeamKisanSaathi@gmail.com" // Add userEmail prop for API calls
}) {
  const [step, setStep] = useState(1);
  const [selectedLang, setSelectedLang] = useState(initialLang);
  const [pincode, setPincode] = useState("");
  const [mode, setMode] = useState("personal");
  const [isUpdating, setIsUpdating] = useState(false);

  const t = STRINGS[selectedLang] || STRINGS.en;

  if (!open) return null;

  const handleLanguageSelect = (langCode) => {
    setSelectedLang(langCode);
    setStep(2);
  };

  const handleComplete = async () => {
    setIsUpdating(true);
    try {
      // Call the update API with all three parameters
      await api.updateUserInfo({
        user_email: userEmail,
        language: selectedLang,
        pincode: pincode.trim(),
        mode: mode
      });
      
      // Call the original onComplete callback
      onComplete({
        language: selectedLang,
        pincode: pincode.trim(),
        mode
      });
    } catch (error) {
      console.error('Failed to update user info:', error);
      // Still call onComplete even if API fails, for better UX
      onComplete({
        language: selectedLang,
        pincode: pincode.trim(),
        mode
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const renderLanguageSelection = () => (
    <div className="initial-setup-modal">
      <div className="initial-setup-overlay" />
      <div className="initial-setup-content">
        <div className="initial-setup-header">
          <h2 className="initial-setup-title">
            {STRINGS.en.chooseLanguage}
          </h2>
        </div>
        
        <LanguageGrid 
          onLanguageSelect={handleLanguageSelect}
          selectedLang={selectedLang}
        />
      </div>
    </div>
  );

  const renderPreferencesSelection = () => (
    <div className="initial-setup-modal">
      <div className="initial-setup-overlay" />
      <div className="initial-setup-content">
        <div className="initial-setup-header">
          <h2 className="initial-setup-title">
            {t.setup}
          </h2>
        </div>
        
        <div className="setup-section">
          <label className="setup-label">
            {t.enterPincode}
          </label>
          <input
            type="text"
            className="setup-input"
            placeholder="123456"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            maxLength={6}
          />
        </div>

        <div className="setup-section">
          <label className="setup-label">
            {t.selectAssistantType}
          </label>
          
          <div className="assistant-options">
            <button
              className={`assistant-option ${mode === "personal" ? "selected" : ""}`}
              onClick={() => setMode("personal")}
            >
              <div className="assistant-header">
                <h3>{t.personalizedAssistant}</h3>
              </div>
              <p className="assistant-description">
                {t.personalizedDescription}
              </p>
            </button>
            
            <button
              className={`assistant-option ${mode === "general" ? "selected" : ""}`}
              onClick={() => setMode("general")}
            >
              <div className="assistant-header">
                <h3>{t.generalAssistant}</h3>
              </div>
              <p className="assistant-description">
                {t.generalDescription}
              </p>
            </button>
          </div>
        </div>

        <div className="setup-actions">
          <button
            className={`setup-button primary ${isUpdating ? 'updating' : ''}`}
            onClick={handleComplete}
            disabled={isUpdating || !pincode.trim()}
          >
            {isUpdating ? 'Updating...' : t.start}
          </button>
        </div>
      </div>
    </div>
  );

  return step === 1 ? renderLanguageSelection() : renderPreferencesSelection();
}


