// -------------------------
// File: src/components/EditablePincode.jsx
// -------------------------
import React, { useState, useRef, useEffect } from "react";
import { MapPin, Check, X, Edit3 } from "lucide-react";

export default function EditablePincode({ pincode, onUpdate, t }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempPincode, setTempPincode] = useState(pincode || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Update temp value when pincode prop changes
  useEffect(() => {
    setTempPincode(pincode || "");
  }, [pincode]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempPincode(pincode || "");
    setError("");
  };

  const handleSave = async () => {
    const trimmedPincode = tempPincode.trim();
    
    // Basic validation
    if (!trimmedPincode) {
      setError("Pincode cannot be empty");
      return;
    }
    
    if (!/^\d{6}$/.test(trimmedPincode)) {
      setError("Pincode must be 6 digits");
      return;
    }

    if (trimmedPincode === pincode) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await onUpdate(trimmedPincode);
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update pincode");
      console.error("Pincode update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6); // Only digits, max 6
    setTempPincode(value);
    setError("");
  };

  if (isEditing) {
    return (
      <div className="editable-pincode editing">
        <MapPin size={16} className="location-icon" />
        <div className="pincode-edit-container">
          <input
            ref={inputRef}
            type="text"
            value={tempPincode}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="pincode-input"
            placeholder="Enter 6-digit pincode"
            disabled={isLoading}
            maxLength={6}
          />
          <div className="pincode-actions">
            <button
              onClick={handleSave}
              disabled={isLoading || !tempPincode.trim()}
              className="pincode-action-btn save"
              title="Save"
            >
              <Check size={14} />
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="pincode-action-btn cancel"
              title="Cancel"
            >
              <X size={14} />
            </button>
          </div>
        </div>
        {error && <div className="pincode-error">{error}</div>}
      </div>
    );
  }

  return (
    <div 
      className="editable-pincode display" 
      onClick={handleEdit}
      title={t?.changePincode || "Click to edit pincode"}
    >
      <MapPin size={16} className="location-icon" />
      <span className="pincode-text">
        {pincode || "Set Pincode"}
      </span>
      <Edit3 size={12} className="edit-icon" />
    </div>
  );
}