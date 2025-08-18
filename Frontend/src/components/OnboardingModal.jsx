import React from "react";

export default function OnboardingModal({ open, lang, setLang, pincode, setPincode, mode, setMode, email, setEmail, onClose, t }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{t.setup}</h3>
        <div className="form-grid">
          <label>
            {t.emailLabel}
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="user@company.com" />
          </label>
          <label>
            {t.pickLang}
            <select value={lang} onChange={(e)=>setLang(e.target.value)}>
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="gu">ગુજરાતી (Gujarati)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="ml">മലയാളം (Malayalam)</option>
              <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
              <option value="or">ଓଡ଼ିଆ (Odia)</option>
              <option value="as">অসমীয়া (Assamese)</option>
            </select>
          </label>
          <label>
            {t.pickPincode}
            <input value={pincode} onChange={(e)=>setPincode(e.target.value)} placeholder="422303" />
          </label>
          <label>
            {t.pickMode}
            <select value={mode} onChange={(e)=>setMode(e.target.value)}>
              <option value="personal">{t.modePersonal}</option>
              <option value="general">{t.modeGeneral}</option>
            </select>
          </label>
        </div>
        <div className="modal-actions">
          <button className="primary" onClick={onClose}>{t.start}</button>
        </div>
      </div>
    </div>
  );
}
