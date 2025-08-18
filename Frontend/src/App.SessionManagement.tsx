import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Container,
  Typography,
  Paper,
  Stack,
  Chip,
  Alert,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon,
  AutoAwesome as AutoAwesomeIcon,
  Refresh as RefreshIcon,
  Chat as ChatIcon,
  Edit as EditIcon
} from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1F7507',
      light: '#4CAF50',
      dark: '#0D4A02',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#FF6B35',
      light: '#FF8A65',
      dark: '#E64A19',
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#F4F7FB',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B'
    }
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    h4: {
      fontWeight: 700,
      color: '#0F172A'
    },
    h5: {
      fontWeight: 600,
      color: '#1F7507'
    },
    h6: {
      fontWeight: 600,
      color: '#0F172A'
    }
  },
  shape: {
    borderRadius: 12
  }
});

const SessionManagementDemo: React.FC = () => {
  const features = [
    {
      icon: <SpeedIcon color="primary" />,
      title: 'Instant Session List Refresh',
      description: 'Session list updates immediately when a new session is created, providing instant visual feedback to users.'
    },
    {
      icon: <AutoAwesomeIcon color="secondary" />,
      title: 'Smart Session Naming',
      description: 'Sessions start as "New Chat" and automatically update to the first meaningful user query for better organization.'
    },
    {
      icon: <RefreshIcon color="primary" />,
      title: 'Real-time Updates',
      description: 'All session operations (create, rename, delete) trigger immediate UI updates without manual refresh.'
    },
    {
      icon: <EditIcon color="secondary" />,
      title: 'Intelligent Name Generation',
      description: 'Automatically generates concise, meaningful session names from user queries with smart truncation.'
    }
  ];

  const implementationDetails = [
    'Enhanced ensureSession() to await session list refresh',
    'Modified sendMessage() to detect first meaningful query',
    'Added automatic session name generation from user input',
    'Implemented cache clearing for immediate UI updates',
    'Added smart truncation for long session names'
  ];

  const workflow = [
    'User starts typing a message',
    'Session is created instantly with "New Chat" name',
    'Session list refreshes immediately to show new session',
    'User sends first meaningful query',
    'Session name updates automatically to query content',
    'Session list reflects the new name in real-time'
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={4}>
          {/* Header */}
          <Box textAlign="center">
            <Typography variant="h4" gutterBottom>
              Enhanced Session Management
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Improved session handling with instant feedback and intelligent naming for KisanSaathi chat application
            </Typography>
          </Box>

          {/* Status Alert */}
          <Alert 
            severity="success" 
            icon={<CheckCircleIcon />}
            sx={{ 
              borderRadius: 2,
              '& .MuiAlert-message': { fontSize: '1rem' }
            }}
          >
            <Typography variant="h6" component="div" gutterBottom>
              Implementation Complete
            </Typography>
            Session management has been enhanced with instant list updates and automatic session naming from user queries.
          </Alert>

          {/* Key Features */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Key Features
            </Typography>
            <Stack spacing={3}>
              {features.map((feature, index) => (
                <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
                  <Box sx={{ mt: 0.5 }}>
                    {feature.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Paper>

          {/* Implementation Details */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Paper elevation={2} sx={{ p: 3, flex: 1 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Implementation Details
              </Typography>
              <List dense>
                {implementationDetails.map((detail, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={detail}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            <Paper elevation={2} sx={{ p: 3, flex: 1 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                User Workflow
              </Typography>
              <Stack spacing={2}>
                {workflow.map((step, index) => (
                  <Box key={index}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Chip 
                        label={index + 1} 
                        size="small" 
                        color="primary"
                        sx={{ minWidth: 32, height: 24 }}
                      />
                      <Typography variant="body2">
                        {step}
                      </Typography>
                    </Stack>
                    {index < workflow.length - 1 && (
                      <Divider sx={{ ml: 4, mt: 1 }} />
                    )}
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>

          {/* Technical Benefits */}
          <Paper elevation={2} sx={{ p: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'inherit' }}>
              Technical Benefits
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <ChatIcon />
                  <Typography variant="h6" sx={{ color: 'inherit' }}>
                    Better UX
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: 'inherit', opacity: 0.9 }}>
                  Users see immediate feedback when creating sessions, improving perceived performance
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <AutoAwesomeIcon />
                  <Typography variant="h6" sx={{ color: 'inherit' }}>
                    Smart Organization
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: 'inherit', opacity: 0.9 }}>
                  Automatic session naming helps users quickly identify and navigate their conversations
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <SpeedIcon />
                  <Typography variant="h6" sx={{ color: 'inherit' }}>
                    Real-time Sync
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: 'inherit', opacity: 0.9 }}>
                  Cache management ensures UI stays synchronized with backend state
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </ThemeProvider>
  );
};

export default SessionManagementDemo;