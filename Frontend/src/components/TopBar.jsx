// -------------------------
// File: src/components/TopBar.jsx
// -------------------------
import React, { useState, useRef, useEffect } from "react";
import { UserRound } from "lucide-react";
import EditablePincode from "./EditablePincode";
import ThemeToggle from "./ThemeToggle";
import { preloadedImages } from "../utils/imagePreloader";

export default function TopBar({ brand, lang, setLang, onUpdatePincode, pincode, t }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const email = "TeamKisanSaathi@gmail.com";
  const avatarRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="topbar">
      <div className="tb-left">
        <div className="topbar-logo">
          <img src={preloadedImages.logo} alt="KisanSaathi Logo" className="logo-img" />
          <span className="brand-name">KisanSaathi</span>
        </div>
      </div>
      
      <div className="tb-right">
        <ThemeToggle />
        <EditablePincode 
          pincode={pincode}
          onUpdate={onUpdatePincode}
          t={t}
        />
        <div className="language-dropdown">
          <select className="lang-select-clean" value={lang} onChange={(e)=>setLang(e.target.value)}>
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="mr">मराठी</option>
            <option value="gu">ગુજરાતી</option>
            <option value="bn">বাংলা</option>
            <option value="ta">தমিழ্</option>
            <option value="te">తెలుగు</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="ml">മലയാളം</option>
            <option value="pa">ਪੰਜਾਬੀ</option>
            <option value="or">ଓଡ଼ିଆ</option>
            <option value="as">অসমীয়া</option>
          </select>
        </div>
        <div 
          className="avatar" 
          ref={avatarRef}
          title={email}
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <UserRound size={22} />
          {showUserMenu && (
            <div className="avatar-menu-new">
              <div className="user-email-label">Signed in as</div>
              <div className="user-email">{email}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}