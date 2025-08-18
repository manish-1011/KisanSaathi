import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Typography, Paper, Stack, TextField, Button, Box } from '@mui/material';
import MarkdownRenderer from './components/MarkdownRenderer';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1F7507',
      light: '#5B9E08',
      dark: '#1C5404',
    },
    background: {
      default: '#F4F7FB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
  },
});

const MarkdownDemo: React.FC = () => {
  const [inputText, setInputText] = useState(
    'Welcome to **KisanSathi**!\n\nThis is a demonstration of markdown parsing.\n\n**Bold text** works perfectly.\nLine breaks work too.\n\nYou can have **multiple bold sections** in the same line.\n\nHere are some **market prices**:\n**Mandvi Market Prices:**\n* **Beans:** ₹4,500 per quintal\n* **Cowpea (Lobia/Karamani):** ₹5,500 to ₹6,000 per quintal\n* **Groundnut:** ₹5250 per quintal\n* **Paddy (Dhan)(Common):** ₹1575 per quintal\n* **Sesamum (Til):**\n  - White: ₹5500 to ₹9000 per quintal\n  - Black: ₹12500 to ₹20000 per quintal\n\n**Mahuva Market Prices (Station Road):**\n* **Groundnut:** ₹6,755 per quintal\n* **Cotton:** ₹7,500 to ₹8,350 per quintal\n* **Onion:** ₹475 to ₹1,955 per quintal\n\n**Farming Tips:**\n* Check soil moisture before watering\n* Use **organic fertilizers** when possible\n* Monitor weather forecasts regularly\n* Keep records of crop yields'
  );

  const sampleMessages = [
    {
      id: 1,
      role: 'user',
      text: 'Mandvi no Bhav Suchi mahuva k yard mein'
    },
    {
      id: 2,
      role: 'bot',
      text: 'The current market prices for Mandvi and Mahuva are as follows:\n\n**Mandvi Market Prices:**\n* **Beans:** ₹4,500 per quintal\n* **Cowpea (Lobia/Karamani):** ₹5,500 to ₹6,000 per quintal\n* **Groundnut:** ₹5250 per quintal\n* **Paddy (Dhan)(Common):** ₹1575 per quintal\n* **Sesamum (Til):**\n  - White: ₹5500 to ₹9000 per quintal\n  - Black: ₹12500 to ₹20000 per quintal (as of Jul 27, 2025)\n\n**Mahuva Market Prices (Station Road):**\n* **Groundnut:** ₹6,755 per quintal\n* **Cotton:** ₹7,500 to ₹8,350 per quintal\n* **Onion:** ₹475 to ₹1,955 per quintal\n\nThese prices are subject to change based on quality, variety, and other market conditions.'
    },
    {
      id: 3,
      role: 'user',
      text: 'Give me some farming tips'
    },
    {
      id: 4,
      role: 'bot',
      text: 'Here are some **essential farming tips** for better crop yield:\n\n**Soil Management:**\n* Test soil pH regularly\n* Add **organic compost** to improve soil health\n* Ensure proper drainage\n* Rotate crops to prevent soil depletion\n\n**Water Management:**\n* Use drip irrigation for water efficiency\n* Water early morning or late evening\n* Monitor soil moisture levels\n* Collect rainwater when possible\n\n**Pest Control:**\n* Use **integrated pest management** (IPM)\n* Encourage beneficial insects\n* Regular crop inspection\n* Use organic pesticides when needed\n\nFollowing these practices will help you achieve **better yields** and **sustainable farming**.'
    }
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ 
          fontWeight: 800,
          background: 'linear-gradient(100deg, #0F3E00 0%, #1F7507 42%, #79C940 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          mb: 4
        }}>
          Markdown Parser Demo
        </Typography>

        <Stack spacing={4}>
          {/* Live Editor */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
              Live Markdown Editor
            </Typography>
            <Stack spacing={2}>
              <TextField
                multiline
                rows={10}
                fullWidth
                label="Enter markdown text (use ** for bold, \n for line breaks, * or - for bullet points)"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                variant="outlined"
                helperText="Supported: **bold text**, line breaks (\n), bullet points (* item or - item)"
              />
              <Box sx={{ 
                p: 2, 
                border: '1px solid #E5E9F2', 
                borderRadius: 2, 
                backgroundColor: '#F9FAFB',
                minHeight: 200
              }}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', mb: 2 }}>
                  Rendered Output:
                </Typography>
                <MarkdownRenderer text={inputText} />
              </Box>
            </Stack>
          </Paper>

          {/* Chat Message Examples */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
              Chat Message Examples
            </Typography>
            <Stack spacing={2}>
              {sampleMessages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: message.role === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '75%',
                      p: 2,
                      borderRadius: '20px',
                      backgroundColor: message.role === 'user' ? '#1F7507' : '#fff',
                      color: message.role === 'user' ? '#fff' : '#0F172A',
                      border: message.role === 'bot' ? '1px solid #E5E9F2' : 'none',
                      borderBottomRightRadius: message.role === 'user' ? '6px' : '20px',
                      borderBottomLeftRadius: message.role === 'bot' ? '6px' : '20px',
                      boxShadow: '0 2px 12px rgba(16,24,40,.1)',
                    }}
                  >
                    <MarkdownRenderer text={message.text} />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>

          {/* Feature Showcase */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
              Supported Features
            </Typography>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Bold Text
                </Typography>
                <Box sx={{ p: 2, backgroundColor: '#F9FAFB', borderRadius: 1 }}>
                  <MarkdownRenderer text="This is **bold text** and this is normal text." />
                </Box>
              </Box>
              
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Line Breaks
                </Typography>
                <Box sx={{ p: 2, backgroundColor: '#F9FAFB', borderRadius: 1 }}>
                  <MarkdownRenderer text="First line\nSecond line\nThird line" />
                </Box>
              </Box>
              
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Bullet Points
                </Typography>
                <Box sx={{ p: 2, backgroundColor: '#F9FAFB', borderRadius: 1 }}>
                  <MarkdownRenderer text="**Today's Tasks:**\n* Check irrigation system\n* Apply **organic fertilizer**\n* Monitor pest activity\n- Review weather forecast\n- Plan next week's activities" />
                </Box>
              </Box>
              
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Combined Formatting
                </Typography>
                <Box sx={{ p: 2, backgroundColor: '#F9FAFB', borderRadius: 1 }}>
                  <MarkdownRenderer text="**Market Update:**\nToday's prices are **very competitive**.\n\n**Top Crops:**\n* **Cotton:** ₹7,500 per quintal\n* **Wheat:** ₹2,100 per quintal\n* **Rice:** ₹1,850 per quintal\n\nPrices are **subject to change** based on market conditions." />
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </ThemeProvider>
  );
};

export default MarkdownDemo;