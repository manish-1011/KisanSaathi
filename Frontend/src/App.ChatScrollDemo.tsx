import React, { useState, useEffect } from 'react';
import { Stack, Box, Typography, Button, Paper } from '@mui/material';
import ChatWindow from './components/ChatWindow';
import InputBox from './components/InputBox';

// Mock data for demonstration
const mockMessages = [
  { id: 1, role: 'user', text: 'Hello! Can you help me with farming techniques?' },
  { id: 2, role: 'bot', text: 'Hello! I\'d be happy to help you with farming techniques. What specific area would you like to know about?' },
  { id: 3, role: 'user', text: 'I want to know about organic farming methods' },
  { id: 4, role: 'bot', text: 'Organic farming is a great choice! Here are some key methods:\n\n• **Crop Rotation**: Rotating different crops helps maintain soil health\n• **Composting**: Using organic matter to enrich soil\n• **Natural Pest Control**: Using beneficial insects and companion planting\n• **Cover Crops**: Planting crops to protect and improve soil\n\nWould you like me to elaborate on any of these methods?' },
  { id: 5, role: 'user', text: 'Tell me more about composting' },
  { id: 6, role: 'bot', text: 'Composting is an excellent way to create nutrient-rich soil amendment! Here\'s how to get started:\n\n**What to Compost:**\n• Green materials (nitrogen): Kitchen scraps, fresh grass clippings\n• Brown materials (carbon): Dry leaves, paper, cardboard\n\n**Steps:**\n1. Layer green and brown materials in a 1:3 ratio\n2. Keep the pile moist but not waterlogged\n3. Turn the pile every 2-3 weeks for aeration\n4. Compost will be ready in 3-6 months\n\n**Benefits:**\n• Improves soil structure\n• Increases water retention\n• Provides slow-release nutrients\n• Reduces waste' }
];

const STRINGS = {
  en: {
    welcome: (name) => `Welcome back, ${name}!`,
    askPlaceholder: 'Ask me anything about farming...',
    messagePlaceholder: 'Type your message...',
    askPersonalPlaceholder: 'Ask Personal Assistant about farming...',
    askGeneralPlaceholder: 'Ask General Assistant about farming...'
  }
};

export default function ChatScrollDemo() {
  const [messages, setMessages] = useState(mockMessages);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('demo-session');

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { 
      id: Date.now(), 
      role: 'user', 
      text: text.trim() 
    };

    const typingMessage = { 
      id: 'typing-' + Date.now(), 
      role: 'bot', 
      text: 'Generating', 
      isTyping: true 
    };

    // Add user message and typing indicator
    setMessages(prev => [...prev, userMessage, typingMessage]);
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        role: 'bot',
        text: `Thank you for your question: "${text}". This is a demo response showing the auto-scroll functionality. The chat should automatically scroll to show this new message when it appears.`
      };

      setMessages(prev => {
        // Remove typing indicator and add bot response
        const withoutTyping = prev.filter(msg => !msg.isTyping);
        return [...withoutTyping, botResponse];
      });
      setLoading(false);
    }, 2000);
  };

  const handleFeedback = async ({ messageId, thumb, text }) => {
    console.log('Feedback:', { messageId, thumb, text });
  };

  const addMoreMessages = () => {
    const newMessages = [
      { id: Date.now(), role: 'user', text: 'Can you tell me about crop rotation?' },
      { id: Date.now() + 1, role: 'bot', text: 'Crop rotation is a farming practice where different crops are planted in the same area across different seasons or years. This helps:\n\n• **Prevent soil depletion**: Different crops use different nutrients\n• **Break pest cycles**: Pests specific to one crop are disrupted\n• **Improve soil health**: Some crops add nitrogen to soil\n• **Increase yields**: Better soil health leads to better harvests\n\nA common rotation might be: Corn → Soybeans → Wheat → Cover crop, then repeat.' }
    ];
    setMessages(prev => [...prev, ...newMessages]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const resetToMockData = () => {
    setMessages(mockMessages);
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#F4F7FB'
    }}>
      {/* Header */}
      <Paper sx={{ 
        p: 2, 
        mb: 1, 
        mx: 2, 
        mt: 1,
        borderRadius: 2,
        background: 'linear-gradient(100deg, #0F3E00 0%, #1F7507 42%, #79C940 100%)',
        color: 'white'
      }}>
        <Typography variant="h5" fontWeight="bold">
          KisanSaathi Chat - Auto Scroll Demo
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
          Test the auto-scroll functionality when opening sessions and sending messages
        </Typography>
      </Paper>

      {/* Demo Controls */}
      <Paper sx={{ p: 2, mx: 2, mb: 1 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button 
            variant="contained" 
            onClick={addMoreMessages}
            sx={{ bgcolor: '#1F7507' }}
          >
            Add Messages
          </Button>
          <Button 
            variant="outlined" 
            onClick={clearMessages}
          >
            Clear Chat
          </Button>
          <Button 
            variant="outlined" 
            onClick={resetToMockData}
          >
            Reset to Mock Data
          </Button>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          • When you open this demo, it should auto-scroll to the bottom
          • When you send a message, it should auto-scroll to show the response
          • If you scroll up manually, auto-scroll will be disabled until you scroll back to bottom
        </Typography>
      </Paper>

      {/* Chat Area */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: 0,
        mx: 2
      }}>
        {messages.length === 0 ? (
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'white',
            borderRadius: 2,
            mb: 1
          }}>
            <Typography variant="h6" color="text.secondary">
              No messages yet. Send a message to test auto-scroll!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            flex: 1, 
            bgcolor: 'white', 
            borderRadius: 2,
            mb: 1,
            overflow: 'hidden'
          }}>
            <ChatWindow
              messages={messages}
              onFeedback={handleFeedback}
              loading={loading}
              email="demo@kisansaathi.com"
              sessionId={sessionId}
            />
          </Box>
        )}

        {/* Input Box */}
        <Box>
          <InputBox
            placeholder="Type your message to test auto-scroll..."
            mode="personal"
            setMode={() => {}}
            onSend={handleSendMessage}
            disabled={loading}
            t={STRINGS.en}
            email="demo@kisansaathi.com"
          />
        </Box>
      </Box>
    </Box>
  );
}