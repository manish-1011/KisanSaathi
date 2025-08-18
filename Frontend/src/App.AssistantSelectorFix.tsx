import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, Typography, Paper, Stack } from '@mui/material';
import AssistantSelector from './components/AssistantSelector';

// Create a theme for the preview
const theme = createTheme({
  palette: {
    primary: {
      main: '#1F7507',
      light: '#5B9E08',
      dark: '#0F3E00',
    },
    background: {
      default: '#F4F7FB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#8A94A6',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
  },
});

// Mock translations
const mockTranslations = {
  modePersonal: 'Personal Assistant',
  modeGeneral: 'General Assistant',
};

// Mock email for testing
const mockEmail = 'test@example.com';

export default function AssistantSelectorDemo() {
  const [mode, setMode] = useState('personal');
  const [demoMode, setDemoMode] = useState('personal');

  const handleModeChange = (newMode) => {
    console.log('Assistant mode changed to:', newMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={4}>
          <Typography variant="h3" component="h1" gutterBottom>
            Assistant Selector Fix Demo
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            This demo shows the fixed assistant selector dropdown that properly handles clicks without disappearing.
          </Typography>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Fixed Assistant Selector
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Click the dropdown and select an option - it should work properly now!
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <AssistantSelector
                mode={mode}
                setMode={setMode}
                t={mockTranslations}
                email={mockEmail}
                onModeChange={handleModeChange}
              />
              <Typography variant="body2">
                Current mode: <strong>{mode}</strong>
              </Typography>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Demo Controls
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Test different scenarios:
            </Typography>
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  Another instance (without email for testing):
                </Typography>
                <AssistantSelector
                  mode={demoMode}
                  setMode={setDemoMode}
                  t={mockTranslations}
                  email={null}
                />
              </Box>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              Features Fixed
            </Typography>
            <Stack component="ul" spacing={1} sx={{ pl: 2 }}>
              <Typography component="li" variant="body2">
                ✅ Dropdown stays open when clicking on options
              </Typography>
              <Typography component="li" variant="body2">
                ✅ Proper click-away detection to close dropdown
              </Typography>
              <Typography component="li" variant="body2">
                ✅ Escape key closes dropdown
              </Typography>
              <Typography component="li" variant="body2">
                ✅ API integration to update backend mode
              </Typography>
              <Typography component="li" variant="body2">
                ✅ Loading state during API calls
              </Typography>
              <Typography component="li" variant="body2">
                ✅ Error handling with state reversion
              </Typography>
              <Typography component="li" variant="body2">
                ✅ Accessible ARIA attributes
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </ThemeProvider>
  );
}