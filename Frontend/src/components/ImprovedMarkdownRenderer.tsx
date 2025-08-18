import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ImprovedMarkdownRendererProps {
  text: string;
  className?: string;
  spacing?: 'ultra-compact' | 'compact' | 'normal';
}

const MarkdownContainer = styled(Box)<{ spacing: string }>(({ theme, spacing }) => ({
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
  
  ...(spacing === 'ultra-compact' && {
    lineHeight: 1.2,
    '& .markdown-line': {
      display: 'inline',
      margin: 0,
      padding: 0,
    },
    '& .markdown-heading': {
      display: 'block',
      margin: '0 0 1px 0',
      lineHeight: 1.1,
      fontWeight: 700,
    },
    '& .markdown-bullet-list': {
      margin: '1px 0',
      paddingLeft: '16px',
      listStyle: 'none',
    },
    '& .markdown-bullet-item': {
      position: 'relative',
      margin: '0',
      paddingLeft: '12px',
      lineHeight: 1.2,
      '&::before': {
        content: '"•"',
        position: 'absolute',
        left: 0,
        color: 'inherit',
        fontWeight: 'bold',
      },
    },
    '& .line-break': {
      height: '0.1em',
      display: 'block',
    },
  }),
  
  ...(spacing === 'compact' && {
    lineHeight: 1.3,
    '& .markdown-line': {
      display: 'inline',
      margin: 0,
    },
    '& .markdown-heading': {
      display: 'block',
      margin: '1px 0 2px 0',
      lineHeight: 1.2,
      fontWeight: 700,
    },
    '& .markdown-bullet-list': {
      margin: '2px 0',
      paddingLeft: '18px',
      listStyle: 'none',
    },
    '& .markdown-bullet-item': {
      position: 'relative',
      margin: '1px 0',
      paddingLeft: '14px',
      lineHeight: 1.3,
      '&::before': {
        content: '"•"',
        position: 'absolute',
        left: 0,
        color: 'inherit',
        fontWeight: 'bold',
      },
    },
    '& .line-break': {
      height: '0.2em',
      display: 'block',
    },
  }),
  
  ...(spacing === 'normal' && {
    lineHeight: 1.5,
    '& .markdown-line': {
      display: 'inline',
    },
    '& .markdown-heading': {
      display: 'block',
      margin: '4px 0 2px 0',
      lineHeight: 1.3,
      fontWeight: 700,
    },
    '& .markdown-bullet-list': {
      margin: '4px 0',
      paddingLeft: '18px',
      listStyle: 'none',
    },
    '& .markdown-bullet-item': {
      position: 'relative',
      margin: '2px 0',
      paddingLeft: '14px',
      lineHeight: 1.4,
      '&::before': {
        content: '"•"',
        position: 'absolute',
        left: 0,
        color: 'inherit',
        fontWeight: 'bold',
      },
    },
    '& .line-break': {
      height: '0.5em',
      display: 'block',
    },
  }),
  
  '& .markdown-bold': {
    fontWeight: 700,
    color: 'inherit',
  },
}));

const ImprovedMarkdownRenderer: React.FC<ImprovedMarkdownRendererProps> = ({ 
  text, 
  className = '', 
  spacing = 'compact' 
}) => {
  const parseMarkdown = (input: string): React.ReactNode[] => {
    if (!input) return [];

    const elements: React.ReactNode[] = [];
    let elementKey = 0;

    // Split by line breaks and handle both \n and \\n
    const lines = input.split(/\\n|\n/);
    
    let currentList: React.ReactNode[] = [];
    let inList = false;
    let previousLineWasEmpty = false;

    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      
      // Handle empty lines with minimal spacing
      if (!trimmedLine) {
        previousLineWasEmpty = true;
        return;
      }
      
      // Check if this line is a bullet point
      const isBulletPoint = /^[\*\-•]\s+/.test(trimmedLine);
      
      // Check if this line is a heading (bold text that spans most of the line)
      const isHeading = /^\*\*.*\*\*:?\s*$/.test(trimmedLine);
      
      if (isBulletPoint) {
        // Extract the bullet point content
        const bulletContent = trimmedLine.replace(/^[\*\-•]\s+/, '');
        const bulletElements = parseBoldText(bulletContent);
        
        currentList.push(
          <li key={`bullet-${elementKey++}`} className="markdown-bullet-item">
            {bulletElements}
          </li>
        );
        inList = true;
      } else {
        // Close any open list
        if (inList && currentList.length > 0) {
          elements.push(
            <ul key={`list-${elementKey++}`} className="markdown-bullet-list">
              {currentList}
            </ul>
          );
          currentList = [];
          inList = false;
        }
        
        // Add minimal spacing only when needed
        if (previousLineWasEmpty && elements.length > 0) {
          elements.push(
            <div key={`break-${elementKey++}`} className="line-break" />
          );
        }
        
        const lineElements = parseBoldText(line);
        
        if (isHeading) {
          elements.push(
            <div key={`heading-${elementKey++}`} className="markdown-heading">
              {lineElements}
            </div>
          );
        } else {
          elements.push(
            <span key={`line-${elementKey++}`} className="markdown-line">
              {lineElements}
              {lineIndex < lines.length - 1 && lines[lineIndex + 1]?.trim() && ' '}
            </span>
          );
        }
      }
      
      previousLineWasEmpty = false;
    });
    
    // Close any remaining list
    if (inList && currentList.length > 0) {
      elements.push(
        <ul key={`list-${elementKey++}`} className="markdown-bullet-list">
          {currentList}
        </ul>
      );
    }

    return elements;
  };

  const parseBoldText = (text: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    let keyCounter = 0;
    
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let lastIndex = 0;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const beforeText = text.slice(lastIndex, match.index);
        if (beforeText) {
          elements.push(
            <span key={`text-${keyCounter++}`}>
              {beforeText}
            </span>
          );
        }
      }
      
      elements.push(
        <strong key={`bold-${keyCounter++}`} className="markdown-bold">
          {match[1]}
        </strong>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      if (remainingText) {
        elements.push(
          <span key={`text-${keyCounter++}`}>
            {remainingText}
          </span>
        );
      }
    }
    
    if (elements.length === 0) {
      elements.push(
        <span key={`text-${keyCounter++}`}>
          {text}
        </span>
      );
    }
    
    return elements;
  };

  const renderedContent = parseMarkdown(text);

  return (
    <MarkdownContainer spacing={spacing} className={className}>
      {renderedContent}
    </MarkdownContainer>
  );
};

export default ImprovedMarkdownRenderer;