// -------------------------
// File: src/components/BigPrompt.jsx
// -------------------------
import React, { useState, useRef, lazy, Suspense } from "react";
import AssistantSelector from "./AssistantSelector";
import EnhancedSpeechRecognition from "../utils/speechRecognition";

// Lazy load images to improve initial load performance
const LazyHeroImages = lazy(() => import('./LazyHeroImages'));

export default function BigPrompt({ title, placeholder, mode, setMode, onSend, t, email, selectedLanguage = 'en' }) {
  const [value, setValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef(null);

  // Get dynamic placeholder based on mode
  const getDynamicPlaceholder = () => {
    if (mode === "personal") {
      return t.askPersonalPlaceholder || "Ask Personal Assistant regarding farming, weather, market price, government policies...";
    } else if (mode === "general") {
      return t.askGeneralPlaceholder || "Ask General Assistant regarding farming, weather, market price, government policies...";
    }
    return placeholder;
  };
  
  const submit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  };

  const startVoiceRecognition = () => {
    try {
      const speechRecognition = new EnhancedSpeechRecognition(selectedLanguage);
      speechRecognitionRef.current = speechRecognition;

      speechRecognition.start({
        onStart: () => {
          setIsListening(true);
          setIsRecording(true);
        },
        onResult: (result) => {
          setValue(result.transcript);
          setIsListening(false);
          setIsRecording(false);
          
          // Log for debugging
          console.log('Speech recognition result:', {
            transcript: result.transcript,
            language: result.language,
            hasNativeScript: result.hasNativeScript,
            confidence: result.confidence
          });
        },
        onError: (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          setIsRecording(false);
          
          // Show user-friendly error message
          if (event.error === 'not-allowed') {
            alert('Microphone access denied. Please allow microphone access and try again.');
          } else if (event.error === 'no-speech') {
            alert('No speech detected. Please try again.');
          } else {
            alert('Speech recognition error. Please try again.');
          }
        },
        onEnd: () => {
          setIsListening(false);
          setIsRecording(false);
        }
      });
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      alert('Speech recognition not supported in this browser');
      setIsListening(false);
      setIsRecording(false);
    }
  };

  const stopVoiceRecognition = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    setIsListening(false);
    setIsRecording(false);
  };

  const handleMicClick = () => {
    if (isListening) stopVoiceRecognition();
    else startVoiceRecognition();
  };

  return (
    <div className="bigprompt-wrap">
      {/* Greeting */}
      <h1 className="welcome-title">{title}</h1>

      {/* Horizontal images (no captions) - Lazy loaded */}
      <Suspense fallback={<div className="hero-tiles-placeholder">Loading images...</div>}>
        <LazyHeroImages />
      </Suspense>

      {/* Composer */}
      <form className="composer hero" onSubmit={submit}>
        <AssistantSelector
          mode={mode}
          setMode={setMode}
          t={t}
          email={email}
        />

        <input
          className="composer-input"
          placeholder={getDynamicPlaceholder()}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <button
          type="button"
          className={`voice-btn ${isRecording ? "recording" : ""}`}
          title="Voice to text"
          onClick={handleMicClick}
        >
          <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        </button>

        <button
          className={`composer-send ${value.trim() ? "active" : "inactive"}`}
          title="Send"
          disabled={!value.trim()}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </form>
    </div>
  );
}