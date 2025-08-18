import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Typography } from '@mui/material';
import SideBar from './components/SideBar';

// Create a simple theme
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

// Mock data for demonstration
const mockSessionsByBucket = {
  "Today": [
    { session_id: "1", session_name: "New Chat" },
    { session_id: "2", session_name: "How to do rice farming" },
    { session_id: "3", session_name: "How can we do rice farming" },
    { session_id: "4", session_name: "Hi how r u" },
    { session_id: "5", session_name: "What pest i should i use" },
  ],
  "Yesterday": [
    { session_id: "6", session_name: "How can u help me" },
    { session_id: "7", session_name: "New Chat" },
  ],
  "Past 7 Days": [
    { session_id: "8", session_name: "New Chat" },
    { session_id: "9", session_name: "New Chat" },
    { session_id: "10", session_name: "New Chat" },
    { session_id: "11", session_name: "give me information related to farming" },
    { session_id: "12", session_name: "New Chat" },
  ],
};

const mockTranslations = {
  newChat: "New Chat",
  searchChats: "Search Chats",
  today: "Today",
  yesterday: "Yesterday", 
  lastWeek: "Last Week",
  lastMonth: "Last Month",
  older: "Older",
  share: "Share",
  rename: "Rename",
  delete: "Delete",
};

export default function SidebarHoverDemo() {
  const [selectedId, setSelectedId] = useState("2");

  const handleSelectSession = (sessionId: string) => {
    setSelectedId(sessionId);
  };

  const handleNewChat = () => {
    setSelectedId("");
  };

  const handleRename = (session: any, name: string) => {
    console.log("Rename session:", session.session_id, "to:", name);
  };

  const handleDelete = (session: any) => {
    console.log("Delete session:", session.session_id);
  };

  const handleShare = (session: any) => {
    console.log("Share session:", session.session_id);
  };

  const handleOpenSearch = () => {
    console.log("Open search");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        height: '100vh', 
        backgroundColor: '#F4F7FB',
        fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
      }}>
        <Box sx={{ width: 300 }}>
          <SideBar
            t={mockTranslations}
            sessionsByBucket={mockSessionsByBucket}
            onNewChat={handleNewChat}
            onSelectSession={handleSelectSession}
            onRename={handleRename}
            onDelete={handleDelete}
            onShare={handleShare}
            selectedId={selectedId}
            onClose={undefined}
            onOpenSearch={handleOpenSearch}
          />
        </Box>
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 4
        }}>
          <Box sx={{ 
            textAlign: 'center',
            backgroundColor: 'white',
            p: 4,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h4" sx={{ mb: 2, color: '#1F7507', fontWeight: 700 }}>
              Sidebar Hover Demo
            </Typography>
            <Typography variant="body1" sx={{ color: '#6B7280', mb: 2 }}>
              Hover over session names in the sidebar to see the 3-dot menu appear.
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              The menu is hidden by default and only shows on hover for a cleaner interface.
            </Typography>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}