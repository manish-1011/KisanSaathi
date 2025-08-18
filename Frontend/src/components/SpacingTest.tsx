import React from 'react';
import { Box, Stack, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import MarkdownRenderer from './MarkdownRenderer';
import DirectSpacingRenderer from './DirectSpacingRenderer';

const TestContainer = styled(Box)(({ theme }) => ({
  padding: '24px',
  maxWidth: '800px',
  margin: '0 auto',
  background: '#F4F7FB',
  minHeight: '100vh',
}));

const TestBubble = styled(Box)(({ theme }) => ({
  padding: '16px',
  borderRadius: '12px',
  background: '#fff',
  border: '1px solid #E5E9F2',
  marginBottom: '16px',
  fontSize: '15px',
  lineHeight: 1.5,
}));

const SpacingTest: React.FC = () => {
  const testText = `The PM-KISAN scheme provides income support to **landholding farmer families**.

• You'll receive **₹6,000 per year** in **three ₹2,000 installments** every four months.
• The money is directly transferred to your bank account.
• All **landholding farmer families with cultivable land** are eligible.

Next: Want to know about **Kisan Credit Card (KCC)** and how it links with this scheme?`;

  return (
    <TestContainer>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 800, color: '#0f172a' }}>
        Spacing Fix Test
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#dc2626' }}>
          ❌ BEFORE: Original MarkdownRenderer (excessive spacing)
        </Typography>
        <TestBubble>
          <MarkdownRenderer text={testText} />
        </TestBubble>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#16a34a' }}>
          ✅ AFTER: DirectSpacingRenderer (fixed spacing)
        </Typography>
        <TestBubble>
          <DirectSpacingRenderer text={testText} />
        </TestBubble>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#1F7507' }}>
          📏 Spacing Analysis
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2">
            • <strong>Before:</strong> Large gaps between first sentence and bullet points
          </Typography>
          <Typography variant="body2">
            • <strong>After:</strong> Controlled spacing - exactly 3em between sections
          </Typography>
          <Typography variant="body2">
            • <strong>Bullet spacing:</strong> Minimal 0.3em between bullet points
          </Typography>
          <Typography variant="body2">
            • <strong>Section breaks:</strong> Double line breaks create proper separation
          </Typography>
        </Stack>
      </Paper>
    </TestContainer>
  );
};

export default SpacingTest;