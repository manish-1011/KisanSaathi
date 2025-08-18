import React from 'react';
import { Box, Stack, Typography, Paper, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import MarkdownRenderer from './MarkdownRenderer';
import ImprovedMarkdownRenderer from './ImprovedMarkdownRenderer';
import CompactText from './CompactText';
import SingleLineSpacingRenderer from './SingleLineSpacingRenderer';
import PreciseSpacingRenderer from './PreciseSpacingRenderer';
import DirectSpacingRenderer from './DirectSpacingRenderer';

const DemoContainer = styled(Box)(({ theme }) => ({
  padding: '24px',
  maxWidth: '1200px',
  margin: '0 auto',
  background: '#F4F7FB',
  minHeight: '100vh',
}));

const DemoSection = styled(Paper)(({ theme }) => ({
  padding: '20px',
  marginBottom: '24px',
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(16, 24, 40, 0.1)',
}));

const MessageBubble = styled(Box)<{ variant: string }>(({ theme, variant }) => ({
  maxWidth: '75%',
  padding: '10px 14px',
  borderRadius: '20px',
  boxShadow: '0 2px 12px rgba(16,24,40,.1)',
  background: '#fff',
  color: '#0f172a',
  border: '1px solid #E5E9F2',
  borderBottomLeftRadius: '6px',
  fontSize: '15px',
  lineHeight: 1.5,
  marginBottom: '16px',
  
  ...(variant === 'compact' && {
    fontSize: '14px',
    lineHeight: 1.4,
    padding: '8px 12px',
  }),
  
  ...(variant === 'ultra-compact' && {
    fontSize: '13px',
    lineHeight: 1.3,
    padding: '6px 10px',
  }),
}));

const SpacingDemo: React.FC = () => {
  const sampleText = `In **Mahuva**, cotton is around ₹7235 per quintal today.

Tip: Prices fluctuate; check again before selling.

**Next Steps:**
• Monitor market trends daily
• Check quality requirements
• Compare prices across markets
• Consider transportation costs

**Important Notes:**
• Prices may vary by quality grade
• Market conditions change frequently`;

  // Example from engineer's image
  const pmKisanText = `The PM-KISAN scheme provides income support to **landholding farmer families**.

• You'll receive **₹6,000 per year** in **three ₹2,000 installments** every four months.
• The money is directly transferred to your bank account.
• All **landholding farmer families with cultivable land** are eligible.

Next: Want to know about **Kisan Credit Card (KCC)** and how it links with this scheme?`;

  return (
    <DemoContainer>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 800, color: '#0f172a' }}>
        Text Spacing Comparison Demo
      </Typography>

      <DemoSection>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#dc2626' }}>
          ❌ Original MarkdownRenderer (excessive spacing)
        </Typography>
        <MessageBubble variant="default">
          <MarkdownRenderer text={sampleText} />
        </MessageBubble>
      </DemoSection>

      <DemoSection>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#16a34a' }}>
          ✅ Direct Spacing Renderer (FIXED - minimal spacing)
        </Typography>
        <MessageBubble variant="default">
          <DirectSpacingRenderer text={pmKisanText} />
        </MessageBubble>
      </DemoSection>

      <DemoSection>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1F7507' }}>
          Precise Spacing Renderer (alternative)
        </Typography>
        <MessageBubble variant="default">
          <PreciseSpacingRenderer text={pmKisanText} />
        </MessageBubble>
      </DemoSection>

      <DemoSection>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1F7507' }}>
          Single Line Spacing Renderer (general use)
        </Typography>
        <MessageBubble variant="default">
          <SingleLineSpacingRenderer text={sampleText} />
        </MessageBubble>
      </DemoSection>

      <DemoSection>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1F7507' }}>
          Updated MarkdownRenderer (with single line spacing)
        </Typography>
        <MessageBubble variant="default">
          <MarkdownRenderer text={sampleText} />
        </MessageBubble>
      </DemoSection>

      <DemoSection>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1F7507' }}>
          Other Spacing Options (for reference)
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Compact Spacing:</Typography>
            <MessageBubble variant="compact">
              <ImprovedMarkdownRenderer text={sampleText} spacing="compact" />
            </MessageBubble>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Ultra Compact:</Typography>
            <MessageBubble variant="ultra-compact">
              <ImprovedMarkdownRenderer text={sampleText} spacing="ultra-compact" />
            </MessageBubble>
          </Box>
        </Stack>
      </DemoSection>

      <DemoSection>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1F7507' }}>
          Side-by-Side Comparison
        </Typography>
        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#dc2626' }}>
              ❌ Before (Excessive Spacing)
            </Typography>
            <MessageBubble variant="default">
              <MarkdownRenderer text={pmKisanText} />
            </MessageBubble>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#16a34a' }}>
              ✅ After (FIXED - Direct Spacing Control)
            </Typography>
            <MessageBubble variant="default">
              <DirectSpacingRenderer text={pmKisanText} />
            </MessageBubble>
          </Box>
        </Stack>
      </DemoSection>

      <DemoSection>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1F7507' }}>
          Usage Guidelines
        </Typography>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            <strong>DirectSpacingRenderer</strong> - Simple and effective solution with forced spacing control using !important CSS
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Spacing Rules:</strong> Sections separated by double line breaks get 3em spacing, bullet points get 0.3em spacing
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Key feature:</strong> Uses !important to override all existing CSS and ensure spacing works
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Usage:</strong> Replace MarkdownRenderer with DirectSpacingRenderer for guaranteed spacing control
          </Typography>
        </Stack>
      </DemoSection>
    </DemoContainer>
  );
};

export default SpacingDemo;