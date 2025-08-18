import React, { useState } from 'react';
import { Box, Stack, Typography, Button, Paper } from '@mui/material';
import { STRINGS } from './strings';
import LanguageGrid from './components/LanguageGrid';
import SessionItem from './components/SessionItem';

// Mock session data for demonstration
const mockSessions = [
  { session_id: '1', session_name: 'New Chat' },
  { session_id: '2', session_name: 'नई चैट' },
  { session_id: '3', session_name: 'Weather Query' },
  { session_id: '4', session_name: 'કૃષિ સલાહ' },
  { session_id: '5', session_name: '' }, // Empty name
];

export default function ChatTranslationFixDemo() {
  const [selectedLang, setSelectedLang] = useState('en');
  const [selectedSession, setSelectedSession] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [menuFor, setMenuFor] = useState(null);
  const [tempName, setTempName] = useState('');

  const t = STRINGS[selectedLang] || STRINGS.en;

  const handleLanguageSelect = (langCode) => {
    setSelectedLang(langCode);
  };

  const startInlineRename = (s) => { 
    setMenuFor(null); 
    setEditingId(s.session_id); 
    setTempName(s.session_name || ""); 
  };

  const commitRename = async (s) => {
    const name = tempName.trim();
    setEditingId(null);
    if (!name || name === s.session_name) return;
    // In real app, this would call onRename
    console.log('Rename session:', s.session_id, 'to:', name);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Chat Translation Fix Demo
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        This demo shows how chat names in the sidebar now properly translate when you change languages. 
        Default chat names like "New Chat" will be translated to the selected language.
      </Typography>

      <Stack spacing={4}>
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
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Current Language: {selectedLang.toUpperCase()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            New Chat: {t.newChat} | Default Chat Name: {t.defaultChatName}
          </Typography>
        </Paper>

        {/* Session Items Demo */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Chat Sessions (Before & After Translation)
          </Typography>
          
          <Stack spacing={2}>
            {mockSessions.map((session) => (
              <Box key={session.session_id} sx={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: 1, 
                p: 2,
                backgroundColor: '#f9f9f9'
              }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Original: "{session.session_name || '(empty)'}"
                </Typography>
                
                <SessionItem
                  session={session}
                  isSelected={selectedSession === session.session_id}
                  isEditing={editingId === session.session_id}
                  tempName={tempName}
                  menuFor={menuFor}
                  onSelectSession={(id) => setSelectedSession(id)}
                  onStartRename={startInlineRename}
                  onCommitRename={commitRename}
                  onSetTempName={setTempName}
                  onSetMenuFor={setMenuFor}
                  onShare={() => console.log('Share:', session.session_id)}
                  onDelete={() => console.log('Delete:', session.session_id)}
                  t={t}
                />
              </Box>
            ))}
          </Stack>
        </Paper>

        {/* Instructions */}
        <Paper sx={{ p: 3, backgroundColor: '#f0f7ff' }}>
          <Typography variant="h6" gutterBottom>
            How it works:
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>When you change the language above, notice how the chat names update</li>
              <li>Default names like "New Chat", "नई चैट", etc. are automatically translated</li>
              <li>Custom chat names (like "Weather Query") remain unchanged</li>
              <li>Empty chat names show the translated default name</li>
              <li>This ensures a consistent user experience across all languages</li>
            </ul>
          </Typography>
        </Paper>
      </Stack>
    </Box>
  );
}