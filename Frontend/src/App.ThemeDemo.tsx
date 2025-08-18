import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import { Stack, Typography, Paper, Button, Card, CardContent } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import theme from './theme';
import './utils/themeInitializer'; // Import to ensure immediate theme initialization

function ThemeDemo() {
  return (
    <MuiThemeProvider theme={theme}>
      <ThemeProvider>
        <div style={{ 
          minHeight: '100vh', 
          background: 'var(--bg)', 
          color: 'var(--text)',
          padding: '20px',
          transition: 'background-color 0.3s ease, color 0.3s ease'
        }}>
          <Stack spacing={3} maxWidth="800px" margin="0 auto">
            {/* Header with theme toggle */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" component="h1" sx={{ color: 'var(--text)' }}>
                KisanSathi Theme Demo
              </Typography>
              <ThemeToggle />
            </Stack>

            {/* Demo content */}
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                background: 'var(--panel)', 
                border: '1px solid var(--border)',
                borderRadius: '12px'
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: 'var(--text)' }}>
                Theme Debug Information
              </Typography>
              <Typography variant="body1" sx={{ color: 'var(--muted)', mb: 2 }}>
                Check the browser console for theme initialization logs. Clear localStorage and refresh to test default light mode.
              </Typography>
              
              <Button 
                variant="outlined" 
                onClick={() => {
                  localStorage.removeItem('ks_theme');
                  window.location.reload();
                }}
                sx={{ mr: 2, mb: 2 }}
              >
                Clear Theme & Reload
              </Button>
              
              <Stack direction="row" spacing={2}>
                <Button variant="contained" color="primary">
                  Primary Button
                </Button>
                <Button variant="outlined" color="secondary">
                  Secondary Button
                </Button>
              </Stack>
            </Paper>

            {/* Sample cards */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Card sx={{ 
                flex: 1, 
                background: 'var(--panel)', 
                border: '1px solid var(--border)' 
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: 'var(--text)' }}>
                    FOUC Prevention
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--muted)' }}>
                    Fixed the flash of white content (FOUC) issue. Theme is now applied immediately on page load.
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ 
                flex: 1, 
                background: 'var(--panel)', 
                border: '1px solid var(--border)' 
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: 'var(--text)' }}>
                    Theme Persistence
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--muted)' }}>
                    User theme preferences are saved in localStorage and persist across sessions.
                  </Typography>
                </CardContent>
              </Card>
            </Stack>

            {/* Instructions */}
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                background: 'var(--panel)', 
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}
            >
              <Typography variant="body2" sx={{ color: 'var(--muted)' }}>
                <strong>Fixed Issues:</strong> No more flash of white content on page load. Theme is applied immediately 
                before React renders. Refresh the page to test - you should see no white flash.
              </Typography>
            </Paper>
          </Stack>
        </div>
      </ThemeProvider>
    </MuiThemeProvider>
  );
}

export default ThemeDemo;