import React, { useState } from 'react';
import { STRINGS } from './strings';
import LanguageGrid from './components/LanguageGrid';
import SideBar from './components/SideBar';
import { Box, Typography, Paper, Stack, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32',
    },
    secondary: {
      main: '#FF6F00',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default function ChatLanguageTranslationPreview() {
  const [selectedLang, setSelectedLang] = useState('hi');
  
  const handleLanguageSelect = (langCode) => {
    setSelectedLang(langCode);
  };

  const t = STRINGS[selectedLang] || STRINGS.en;

  // Mock session data for demonstration
  const mockSessionsByBucket = {
    'Today': [
      { session_id: '1', session_name: t.defaultChatName || 'New Chat', created_at: new Date().toISOString() },
      { session_id: '2', session_name: 'How to do rice farming', created_at: new Date().toISOString() },
    ],
    'Yesterday': [
      { session_id: '3', session_name: 'How can we do rice farming', created_at: new Date().toISOString() },
      { session_id: '4', session_name: 'Hi how r u', created_at: new Date().toISOString() },
    ],
    'Last Week': [
      { session_id: '5', session_name: 'What pest i should i use', created_at: new Date().toISOString() },
      { session_id: '6', session_name: t.defaultChatName || 'New Chat', created_at: new Date().toISOString() },
    ],
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
        <Stack spacing={4}>
          {/* Header */}
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom color="primary">
              Chat Language Translation Demo
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This demo shows how the "CHATS" heading and other UI text automatically translates when you change languages.
              Notice how the sidebar heading changes from "CHATS" to the selected language equivalent.
            </Typography>
          </Paper>

          {/* Language Selection */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select Language
            </Typography>
            <LanguageGrid 
              onLanguageSelect={handleLanguageSelect}
              selectedLang={selectedLang}
            />
          </Paper>

          {/* Current Language Display */}
          <Paper sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6">
              Current Language: {selectedLang.toUpperCase()}
            </Typography>
          </Paper>

          {/* Demo Layout */}
          <Box sx={{ display: 'flex', gap: 2, minHeight: '500px' }}>
            {/* Sidebar Demo */}
            <Paper sx={{ width: '300px', overflow: 'hidden' }}>
              <Box sx={{ height: '500px', '& .sb-inner': { height: '100%' } }}>
                <SideBar
                  t={t}
                  sessionsByBucket={mockSessionsByBucket}
                  onNewChat={() => console.log('New chat')}
                  onSelectSession={(id) => console.log('Select session:', id)}
                  onRename={() => console.log('Rename')}
                  onDelete={() => console.log('Delete')}
                  onShare={() => console.log('Share')}
                  selectedId="1"
                  onClose={() => console.log('Close')}
                  onOpenSearch={() => console.log('Open search')}
                />
              </Box>
            </Paper>

            {/* Explanation */}
            <Paper sx={{ flex: 1, p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Translation Features Demonstrated:
              </Typography>
              <Stack spacing={2}>
                <Typography variant="body1">
                  • <strong>CHATS Heading:</strong> The sidebar heading now shows "{t.CHATS || 'CHATS'}" in the selected language
                </Typography>
                <Typography variant="body1">
                  • <strong>Action Buttons:</strong> "New Chat" and "Search Chats" buttons are translated
                </Typography>
                <Typography variant="body1">
                  • <strong>Time Buckets:</strong> "Today", "Yesterday", "Last Week" etc. are translated
                </Typography>
                <Typography variant="body1">
                  • <strong>Default Chat Names:</strong> Default chat names like "New Chat" are translated
                </Typography>
                <Typography variant="body1">
                  • <strong>Dynamic Updates:</strong> All text updates immediately when language changes
                </Typography>
              </Stack>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Current Translations:
                </Typography>
                <Typography variant="body2">
                  • CHATS: "{t.CHATS || 'CHATS'}"
                </Typography>
                <Typography variant="body2">
                  • New Chat: "{t.newChat}"
                </Typography>
                <Typography variant="body2">
                  • Search Chats: "{t.searchChats}"
                </Typography>
                <Typography variant="body2">
                  • Today: "{t.today}"
                </Typography>
                <Typography variant="body2">
                  • Default Chat Name: "{t.defaultChatName}"
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Stack>
      </Box>
    </ThemeProvider>
  );
}