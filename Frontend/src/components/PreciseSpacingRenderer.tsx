import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface PreciseSpacingRendererProps {
  text: string;
  className?: string;
}

const PreciseSpacingContainer = styled(Box)(({ theme }) => ({
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
  lineHeight: 1.5,
  
  // Single line break between related content (1\n)
  '& .single-break': {
    display: 'block',
    height: '1.5em', // Exactly one line height
    margin: 0,
    padding: 0,
  },
  
  // Double line break between sections (2\n)
  '& .double-break': {
    display: 'block',
    height: '3em', // Exactly two line heights
    margin: 0,
    padding: 0,
  },
  
  '& .content-block': {
    display: 'block',
    margin: 0,
    padding: 0,
    lineHeight: 1.5,
  },
  
  '& .bullet-list': {
    margin: 0,
    paddingLeft: '20px',
    listStyle: 'none',
  },
  
  '& .bullet-item': {
    position: 'relative',
    margin: '0.2em 0', // Minimal spacing between bullet points
    paddingLeft: '0',
    lineHeight: 1.5,
    display: 'list-item',
    listStyleType: 'disc',
    listStylePosition: 'outside',
  },
  
  '& .heading': {
    display: 'block',
    margin: 0,
    fontWeight: 700,
    lineHeight: 1.4,
  },
  
  '& .bold-text': {
    fontWeight: 700,
    color: 'inherit',
  },
  
  // Ensure no extra margins or padding
  '& *': {
    boxSizing: 'border-box',
  },
}));

const PreciseSpacingRenderer: React.FC<PreciseSpacingRendererProps> = ({ 
  text, 
  className = '' 
}) => {
  const parseWithPreciseSpacing = (input: string): React.ReactNode[] => {
    if (!input) return [];

    const elements: React.ReactNode[] = [];
    let elementKey = 0;

    // Split by line breaks and handle both \n and \\n
    const lines = input.split(/\\n|\n/);
    
    let currentBulletList: React.ReactNode[] = [];
    let inBulletList = false;
    let emptyLineCount = 0;
    let lastContentType: 'text' | 'heading' | 'bullet' | 'empty' = 'empty';

    const flushBulletList = () => {
      if (currentBulletList.length > 0) {
        elements.push(
          <ul key={`bullet-list-${elementKey++}`} className="bullet-list">
            {currentBulletList}
          </ul>
        );
        currentBulletList = [];
        inBulletList = false;
      }
    };

    const addSpacing = (breakType: 'single' | 'double') => {
      if (elements.length > 0) {
        elements.push(
          <div key={`${breakType}-break-${elementKey++}`} className={`${breakType}-break`} />
        );
      }
    };

    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      
      // Handle empty lines
      if (!trimmedLine) {
        emptyLineCount++;
        lastContentType = 'empty';
        return;
      }
      
      // Determine content type
      const isBulletPoint = /^[\*\-•]\s+/.test(trimmedLine);
      const isHeading = /^\*\*.*\*\*:?\s*$/.test(trimmedLine);
      
      // Add appropriate spacing based on empty line count and content transition
      if (emptyLineCount > 0 && elements.length > 0) {
        if (emptyLineCount >= 2 || 
            (lastContentType === 'bullet' && !isBulletPoint) ||
            (lastContentType !== 'heading' && isHeading) ||
            (lastContentType === 'text' && isBulletPoint)) {
          // Double break for section changes
          addSpacing('double');
        } else if (emptyLineCount === 1) {
          // Single break for related content
          addSpacing('single');
        }
      }
      
      emptyLineCount = 0;
      
      if (isBulletPoint) {
        // If we're not in a bullet list, start one
        if (!inBulletList) {
          flushBulletList(); // Close any existing list
          inBulletList = true;
        }
        
        const bulletContent = trimmedLine.replace(/^[\*\-•]\s+/, '');
        const bulletElements = parseBoldText(bulletContent);
        
        currentBulletList.push(
          <li key={`bullet-${elementKey++}`} className="bullet-item">
            {bulletElements}
          </li>
        );
        
        lastContentType = 'bullet';
      } else {
        // Close bullet list if we're in one
        if (inBulletList) {
          flushBulletList();
        }
        
        const lineElements = parseBoldText(line);
        
        if (isHeading) {
          elements.push(
            <div key={`heading-${elementKey++}`} className="heading content-block">
              {lineElements}
            </div>
          );
          lastContentType = 'heading';
        } else {
          elements.push(
            <div key={`text-${elementKey++}`} className="content-block">
              {lineElements}
            </div>
          );
          lastContentType = 'text';
        }
      }
    });
    
    // Close any remaining bullet list
    flushBulletList();

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
        <strong key={`bold-${keyCounter++}`} className="bold-text">
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

  const renderedContent = parseWithPreciseSpacing(text);

  return (
    <PreciseSpacingContainer className={className}>
      {renderedContent}
    </PreciseSpacingContainer>
  );
};

export default PreciseSpacingRenderer;