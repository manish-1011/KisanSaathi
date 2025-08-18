import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Stack, Typography, Paper, Container } from '@mui/material';
import InputBox from './components/InputBox';
import BigPrompt from './components/BigPrompt';
import './styles.css';

// Create a basic theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1F7507',
    },
    background: {
      default: '#F4F7FB',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
  },
});

// Mock translation object
const mockTranslations = {
  askPersonalPlaceholder: "Ask Personal Assistant regarding farming, weather, market price, government policies...",
  askGeneralPlaceholder: "Ask General Assistant regarding farming, weather, market price, government policies...",
};

function App() {
  const [mode, setMode] = useState('personal');
  const [messages, setMessages] = useState<string[]>([]);

  const handleSend = (message: string) => {
    setMessages(prev => [...prev, message]);
    console.log('Message sent:', message);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={4}>
          <Typography variant="h3" component="h1" align="center" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Voice Button & Send Icon Fix Demo
          </Typography>
          
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Big Prompt Component
            </Typography>
            <BigPrompt
              title="Welcome to KisanSaathi"
              placeholder="Type your message..."
              mode={mode}
              setMode={setMode}
              onSend={handleSend}
              t={mockTranslations}
              email="demo@example.com"
            />
          </Paper>

          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Input Box Component
            </Typography>
            <InputBox
              placeholder="Type your message..."
              mode={mode}
              setMode={setMode}
              onSend={handleSend}
              disabled={false}
              t={mockTranslations}
              email="demo@example.com"
            />
          </Paper>

          {messages.length > 0 && (
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Messages Sent:
              </Typography>
              <Stack spacing={1}>
                {messages.map((message, index) => (
                  <Typography key={index} variant="body2" sx={{ 
                    p: 1, 
                    bgcolor: '#F0F9FF', 
                    borderRadius: 1,
                    border: '1px solid #E0F2FE'
                  }}>
                    {message}
                  </Typography>
                ))}
              </Stack>
            </Paper>
          )}

          <Paper elevation={1} sx={{ p: 2, borderRadius: 2, bgcolor: '#F9FAFB' }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Changes Made:</strong>
              <br />
              • Removed background circle from voice button (now transparent)
              • Increased send icon size from 20px to 24px
              • Updated voice button recording animation to use color changes instead of background glow
              • Voice button now has no border-radius (removed circular background)
            </Typography>
          </Paper>
        </Stack>
      </Container>
    </ThemeProvider>
  );
}

export default App;