import React, { useState, useRef } from "react";
import { Box, TextField, IconButton } from "@mui/material";
import { Mic, Send } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import AssistantSelector from "./AssistantSelector";
import EnhancedSpeechRecognition from "../utils/speechRecognition";

const CompactComposerShell = styled(Box)(({ theme }) => ({
  position: 'sticky',
  bottom: 0,
  zIndex: 5,
  padding: '20px', // Reduced from 40px
  background: 'linear-gradient(to bottom, rgba(244,247,251,0), rgba(244,247,251,1))',
  [theme.breakpoints.down('sm')]: {
    padding: '12px', // Further reduced for mobile
  },
}));

const CompactComposer = styled(Box)(({ theme }) => ({
  maxWidth: '1050px',
  margin: '0 auto',
  background: '#fff',
  border: '1px solid #E5E9F2',
  borderRadius: '24px',
  boxShadow: '0 8px 32px rgba(16,24,40,.12)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px', // Reduced gap
  padding: '12px', // Reduced from 16px
  minHeight: '50px', // Reduced from 60px
  [theme.breakpoints.down('sm')]: {
    padding: '10px',
    minHeight: '45px',
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
    minHeight: '20px', // Reduced from 32px
    [theme.breakpoints.down('sm')]: {
      fontSize: '15px',
      padding: '6px 8px',
    },
  },
}));

const VoiceButton = styled(IconButton)(({ theme, isRecording }) => ({
  background: 'transparent',
  border: 'none',
  width: '44px', // Reduced from 52px
  height: '44px',
  color: isRecording ? '#1C8208' : '#6B7280',
  transition: 'all 0.2s ease',
  marginRight: '4px', // Reduced from 8px
  '&:hover': {
    background: 'transparent',
    color: '#374151',
    transform: 'scale(1.05)',
  },
  ...(isRecording && {
    color: '#1C8208',
    animation: 'gradientGlow 2s infinite',
  }),
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
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

export default function OptimizedInputBox({ 
  placeholder, 
  mode, 
  setMode, 
  onSend, 
  disabled, 
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
    const v = value.trim();
    if (!v) return;
    onSend(v);
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
    if (isListening) {
      stopVoiceRecognition();
    } else {
      startVoiceRecognition();
    }
  };

  return (
    <CompactComposerShell>
      <Box component="form" onSubmit={submit}>
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
            disabled={disabled}
            variant="outlined"
            fullWidth
          />
          
          <VoiceButton 
            isRecording={isRecording}
            title="Voice to text" 
            onClick={handleMicClick}
            disabled={disabled}
          >
            <Mic />
          </VoiceButton>
          
          <SendButton 
            hasValue={!!value.trim()}
            disabled={disabled || !value.trim()} 
            title="Send"
            type="submit"
          >
            <Send />
          </SendButton>
        </CompactComposer>
      </Box>
    </CompactComposerShell>
  );
}