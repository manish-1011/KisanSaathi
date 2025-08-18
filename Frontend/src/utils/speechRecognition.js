// Enhanced Speech Recognition Utility
// Handles native script display for different languages

// Language code to Web Speech API language mapping
const LANGUAGE_MAPPING = {
  'en': 'en-US',
  'hi': 'hi-IN',
  'mr': 'mr-IN', 
  'gu': 'gu-IN',
  'bn': 'bn-IN',
  'ta': 'ta-IN',
  'te': 'te-IN',
  'kn': 'kn-IN',
  'ml': 'ml-IN',
  'pa': 'pa-IN',
  'or': 'or-IN',
  'as': 'as-IN'
};

// Fallback language detection based on script patterns
const SCRIPT_PATTERNS = {
  'hi': /[\u0900-\u097F]/,  // Devanagari
  'mr': /[\u0900-\u097F]/,  // Devanagari (Marathi uses same script as Hindi)
  'gu': /[\u0A80-\u0AFF]/,  // Gujarati
  'bn': /[\u0980-\u09FF]/,  // Bengali
  'ta': /[\u0B80-\u0BFF]/,  // Tamil
  'te': /[\u0C00-\u0C7F]/,  // Telugu
  'kn': /[\u0C80-\u0CFF]/,  // Kannada
  'ml': /[\u0D00-\u0D7F]/,  // Malayalam
  'pa': /[\u0A00-\u0A7F]/,  // Gurmukhi (Punjabi)
  'or': /[\u0B00-\u0B7F]/,  // Odia
  'as': /[\u0980-\u09FF]/   // Bengali script (Assamese uses Bengali script)
};

class EnhancedSpeechRecognition {
  constructor(selectedLanguage = 'en') {
    this.selectedLanguage = selectedLanguage;
    this.recognition = null;
    this.isSupported = this.checkSupport();
  }

  checkSupport() {
    return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
  }

  updateLanguage(langCode) {
    this.selectedLanguage = langCode;
  }

  createRecognition() {
    if (!this.isSupported) {
      throw new Error('Speech recognition not supported in this browser');
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Set language based on user's selected language
    const speechLang = LANGUAGE_MAPPING[this.selectedLanguage] || 'en-US';
    this.recognition.lang = speechLang;
    
    // Configure recognition settings
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 3; // Get multiple alternatives for better accuracy
    
    return this.recognition;
  }

  // Process the speech result to ensure native script display
  processResult(event) {
    const results = event.results[0];
    let bestTranscript = results[0].transcript;
    let bestConfidence = results[0].confidence || 0;

    // Check all alternatives for the best native script match
    for (let i = 0; i < results.length; i++) {
      const alternative = results[i];
      const transcript = alternative.transcript;
      const confidence = alternative.confidence || 0;

      // If we have a script pattern for the selected language, prefer transcripts that match
      if (SCRIPT_PATTERNS[this.selectedLanguage]) {
        const hasNativeScript = SCRIPT_PATTERNS[this.selectedLanguage].test(transcript);
        
        if (hasNativeScript && confidence >= bestConfidence * 0.8) {
          bestTranscript = transcript;
          bestConfidence = confidence;
          break; // Prefer native script even with slightly lower confidence
        }
      }
    }

    return {
      transcript: bestTranscript.trim(),
      confidence: bestConfidence,
      language: this.selectedLanguage,
      hasNativeScript: SCRIPT_PATTERNS[this.selectedLanguage] ? 
        SCRIPT_PATTERNS[this.selectedLanguage].test(bestTranscript) : true
    };
  }

  // Start speech recognition with callbacks
  start(callbacks = {}) {
    const {
      onStart = () => {},
      onResult = () => {},
      onError = () => {},
      onEnd = () => {}
    } = callbacks;

    try {
      this.createRecognition();

      this.recognition.onstart = () => {
        onStart();
      };

      this.recognition.onresult = (event) => {
        const result = this.processResult(event);
        onResult(result);
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        onError(event);
      };

      this.recognition.onend = () => {
        onEnd();
      };

      this.recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      onError({ error: error.message });
    }
  }

  stop() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  // Get supported languages for the current browser
  static getSupportedLanguages() {
    return Object.keys(LANGUAGE_MAPPING);
  }

  // Check if a language has native script support
  static hasNativeScriptSupport(langCode) {
    return langCode in SCRIPT_PATTERNS;
  }
}

export default EnhancedSpeechRecognition;