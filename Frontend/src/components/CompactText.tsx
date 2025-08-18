import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface CompactTextProps {
  children: React.ReactNode;
  variant?: 'default' | 'ultra-compact' | 'minimal';
  className?: string;
}

const CompactTextContainer = styled(Box)<{ variant: string }>(({ theme, variant }) => ({
  ...(variant === 'ultra-compact' && {
    '& *': {
      margin: '0 !important',
      padding: '0 !important',
      lineHeight: '1.2 !important',
    },
    '& .markdown-content': {
      lineHeight: '1.2 !important',
    },
    '& .markdown-heading': {
      margin: '0 !important',
      lineHeight: '1.1 !important',
    },
    '& .minimal-line-spacing': {
      height: '0.05em !important',
    },
    '& .markdown-text': {
      display: 'inline !important',
      margin: '0 !important',
    },
  }),
  ...(variant === 'minimal' && {
    '& .markdown-content': {
      lineHeight: '1.3',
    },
    '& .markdown-heading': {
      margin: '1px 0',
      lineHeight: '1.2',
    },
    '& .minimal-line-spacing': {
      height: '0.1em',
    },
  }),
  ...(variant === 'default' && {
    '& .markdown-content': {
      lineHeight: '1.4',
    },
    '& .markdown-heading': {
      margin: '2px 0 1px 0',
      lineHeight: '1.3',
    },
    '& .minimal-line-spacing': {
      height: '0.2em',
    },
  }),
}));

const CompactText: React.FC<CompactTextProps> = ({ 
  children, 
  variant = 'default', 
  className = '' 
}) => {
  return (
    <CompactTextContainer variant={variant} className={className}>
      {children}
    </CompactTextContainer>
  );
};

export default CompactText;