import React, { useState, useRef, lazy, Suspense } from "react";
import { Box, Stack, Typography, TextField, IconButton } from "@mui/material";
import { Mic, Send } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import AssistantSelector from "./AssistantSelector";
import EnhancedSpeechRecognition from "../utils/speechRecognition";

// Lazy load images to improve initial load performance
const LazyHeroImages = lazy(() => import('./UltraCompactLazyHeroImages'));

const UltraCompactTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.875rem', // Further reduced from 2.125rem
  fontWeight: 800,
  color: '#0f172a',
  marginBottom: '0.25rem', // Drastically reduced from 1rem to 4px
  textAlign: 'center',
  lineHeight: 1.1, // Tighter line height
  [theme.breakpoints.down('md')]: {
    fontSize: '1.5rem',
    marginBottom: '0.125rem', // 2px
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.25rem',
    marginBottom: '0', // No margin on mobile
  },
}));

const UltraCompactComposer = styled(Box)(({ theme }) => ({
  maxWidth: '1200px',
  width: '95%',
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  gap: '8px', // Reduced from 12px
  background: '#fff',
  border: '1px solid #E5E9F2',
  borderRadius: '20px', // Reduced from 24px
  padding: '8px 12px', // Drastically reduced from 16px 20px
  boxShadow: '0 4px 16px rgba(16,24,40,.06)', // Reduced shadow
  minHeight: '44px', // Reduced from 60px
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    borderRadius: '16px',
    padding: '6px 10px', // Further reduced for mobile
    minHeight: '40px',
    gap: '6px',
  },
}));

const UltraCompactInput = styled(TextField)(({ theme }) => ({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    border: 'none',
    '& fieldset': {
      border: 'none',
    },
    '&:hover fieldset': {
      border: 'none',
    },
    '&.Mui-focused fieldset': {
      border: 'none',
    },
  },
  '& .MuiInputBase-input': {
    fontSize: '16px', // Reduced from 18px
    padding: '4px 8px', // Drastically reduced padding
    lineHeight: 1.3,
    [theme.breakpoints.down('sm')]: {
      fontSize: '14px',
      padding: '2px 6px',
    },
  },
}));

const UltraCompactVoiceButton = styled(IconButton)(({ theme, isRecording }) => ({
  background: 'transparent',
  border: 'none',
  width: '36px', // Reduced from 48px
  height: '36px',
  minWidth: '36px',
  color: isRecording ? '#1C8208' : '#6B7280',
  transition: 'all 0.2s ease',
  padding: '6px',
  '&:hover': {
    background: 'transparent',
    color: '#374151',
    transform: 'scale(1.05)',
  },
  ...(isRecording && {
    color: '#1C8208',
    animation: 'gradientGlow 2s infinite',
  }),
  '& .MuiSvgIcon-root': {
    fontSize: '18px', // Smaller icon
  },
}));

const UltraCompactSendButton = styled(IconButton)(({ theme, hasValue }) => ({
  background: hasValue ? 'linear-gradient(100deg, #0F3E00 0%, #1F7507 42%, #79C940 100%)' : '#E5E7EB',
  color: hasValue ? '#fff' : '#9CA3AF',
  border: 'none',
  borderRadius: '50%',
  width: '36px', // Reduced from 48px
  height: '36px',
  minWidth: '36px',
  padding: '6px',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: hasValue ? 'scale(1.05)' : 'none',
    boxShadow: hasValue ? '0 2px 8px rgba(31, 117, 7, 0.3)' : 'none',
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '18px', // Smaller icon
  },
}));

export default function UltraCompactBigPrompt({ 
  title, 
  placeholder, 
  mode, 
  setMode, 
  onSend, 
  t, 
  email, 
  selectedLanguage = 'en' 
}) {
  const [value, setValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef(null);

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
    <Stack 
      spacing={0.5} // Minimal spacing - 4px between elements
      alignItems="center" 
      sx={{ 
        width: '100%', 
        maxWidth: '1400px', 
        margin: '0 auto',
        px: 1, // Reduced padding
      }}
    >
      {/* Greeting */}
      <UltraCompactTitle variant="h1">
        {title}
      </UltraCompactTitle>

      {/* Horizontal images (no captions) - Lazy loaded */}
      <Suspense fallback={
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '120px', // Drastically reduced from 200px
          color: '#6B7280', 
          fontSize: '12px' 
        }}>
          Loading images...
        </Box>
      }>
        <LazyHeroImages />
      </Suspense>

      {/* Composer */}
      <Box component="form" onSubmit={submit} sx={{ width: '100%' }}>
        <UltraCompactComposer>
          <AssistantSelector
            mode={mode}
            setMode={setMode}
            t={t}
            email={email}
          />

          <UltraCompactInput
            placeholder={getDynamicPlaceholder()}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            variant="outlined"
            fullWidth
          />

          <UltraCompactVoiceButton
            isRecording={isRecording}
            title="Voice to text"
            onClick={handleMicClick}
          >
            <Mic />
          </UltraCompactVoiceButton>

          <UltraCompactSendButton
            hasValue={!!value.trim()}
            title="Send"
            disabled={!value.trim()}
            type="submit"
          >
            <Send />
          </UltraCompactSendButton>
        </UltraCompactComposer>
      </Box>
    </Stack>
  );
}