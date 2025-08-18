import React, { useState, useRef, useEffect } from "react";
import { api } from "../api";

export default function AssistantSelector({ mode, setMode, t, email, onModeChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleModeSelect = async (newMode, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (newMode === mode || isUpdating) return;

    setIsUpdating(true);
    
    try {
      // Update local state immediately for better UX
      setMode(newMode);
      setIsOpen(false);
      
      // Call API to update backend if email is available
      if (email) {
        await api.updateUserInfo({
          user_email: email,
          mode: newMode,
        });
      }
      
      // Call optional callback
      if (onModeChange) {
        onModeChange(newMode);
      }
    } catch (error) {
      console.error("Failed to update assistant mode:", error);
      // Revert local state on error
      setMode(mode);
      alert("Failed to update assistant mode. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getCurrentModeLabel = () => {
    return mode === "personal" ? t.modePersonal : t.modeGeneral;
  };

  return (
    <div className="assistant-pill">
      <button
        ref={buttonRef}
        type="button"
        className={`assistant-btn ${isUpdating ? 'updating' : ''}`}
        onClick={handleToggle}
        disabled={isUpdating}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {getCurrentModeLabel()} {isUpdating ? "..." : "▾"}
      </button>
      
      {isOpen && (
        <div ref={dropdownRef} className="assistant-menu open">
          <button
            type="button"
            className={`assistant-opt ${mode === "personal" ? "active" : ""}`}
            onClick={(e) => handleModeSelect("personal", e)}
            disabled={isUpdating}
          >
            {t.modePersonal}
          </button>
          <button
            type="button"
            className={`assistant-opt ${mode === "general" ? "active" : ""}`}
            onClick={(e) => handleModeSelect("general", e)}
            disabled={isUpdating}
          >
            {t.modeGeneral}
          </button>
        </div>
      )}
    </div>
  );
}