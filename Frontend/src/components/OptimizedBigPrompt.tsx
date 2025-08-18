import React, { useState, useRef, lazy, Suspense } from "react";
import { Box, Stack, Typography, TextField, IconButton, Button } from "@mui/material";
import { Mic, Send } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import AssistantSelector from "./AssistantSelector";
import EnhancedSpeechRecognition from "../utils/speechRecognition";

// Lazy load images to improve initial load performance
const LazyHeroImages = lazy(() => import('./OptimizedLazyHeroImages'));

const WelcomeTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.125rem',
  fontWeight: 800,
  color: '#0f172a',
  marginBottom: '1rem', // Reduced from 40px to 16px
  textAlign: 'center',
  [theme.breakpoints.down('md')]: {
    fontSize: '1.75rem',
    marginBottom: '0.75rem', // Reduced for mobile
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.5rem',
    marginBottom: '0.5rem', // Further reduced for mobile
  },
}));

const CompactComposer = styled(Box)(({ theme }) => ({
  maxWidth: '1200px',
  width: '95%',
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  background: '#fff',
  border: '1px solid #E5E9F2',
  borderRadius: '24px',
  padding: '16px 20px', // Reduced from 24px to 16px
  boxShadow: '0 6px 24px rgba(16,24,40,.08)',
  minHeight: '60px', // Reduced from 80px
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    borderRadius: '18px',
    padding: '12px 16px', // Further reduced for mobile
    minHeight: '50px',
  },
}));

const CompactInput = styled(TextField)(({ theme }) => ({
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
    fontSize: '18px',
    padding: '8px 12px', // Reduced padding
    [theme.breakpoints.down('sm')]: {
      fontSize: '15px',
      padding: '6px 8px',
    },
  },
}));

const VoiceButton = styled(IconButton)(({ theme, isRecording }) => ({
  background: 'transparent',
  border: 'none',
  width: '48px', // Reduced from 52px
  height: '48px',
  color: isRecording ? '#1C8208' : '#6B7280',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'transparent',
    color: '#374151',
    transform: 'scale(1.05)',
  },
  ...(isRecording && {
    color: '#1C8208',
    animation: 'gradientGlow 2s infinite',
  }),
}));

const SendButton = styled(IconButton)(({ theme, hasValue }) => ({
  background: hasValue ? 'linear-gradient(100deg, #0F3E00 0%, #1F7507 42%, #79C940 100%)' : '#E5E7EB',
  color: hasValue ? '#fff' : '#9CA3AF',
  border: 'none',
  borderRadius: '50%',
  width: '48px', // Reduced from 56px
  height: '48px',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: hasValue ? 'scale(1.05)' : 'none',
    boxShadow: hasValue ? '0 4px 12px rgba(31, 117, 7, 0.3)' : 'none',
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}));

export default function OptimizedBigPrompt({ 
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
      spacing={2} // Reduced spacing between elements
      alignItems="center" 
      sx={{ 
        width: '100%', 
        maxWidth: '1400px', 
        margin: '0 auto',
        px: 2,
      }}
    >
      {/* Greeting */}
      <WelcomeTitle variant="h1">
        {title}
      </WelcomeTitle>

      {/* Horizontal images (no captions) - Lazy loaded */}
      <Suspense fallback={
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px', // Reduced from 240px
          color: '#6B7280', 
          fontSize: '14px' 
        }}>
          Loading images...
        </Box>
      }>
        <LazyHeroImages />
      </Suspense>

      {/* Composer */}
      <Box component="form" onSubmit={submit} sx={{ width: '100%' }}>
        <CompactComposer>
          <AssistantSelector
            mode={mode}
            setMode={setMode}
            t={t}
            email={email}
          />

          <CompactInput
            placeholder={getDynamicPlaceholder()}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            variant="outlined"
            fullWidth
          />

          <VoiceButton
            isRecording={isRecording}
            title="Voice to text"
            onClick={handleMicClick}
          >
            <Mic />
          </VoiceButton>

          <SendButton
            hasValue={!!value.trim()}
            title="Send"
            disabled={!value.trim()}
            type="submit"
          >
            <Send />
          </SendButton>
        </CompactComposer>
      </Box>
    </Stack>
  );
}