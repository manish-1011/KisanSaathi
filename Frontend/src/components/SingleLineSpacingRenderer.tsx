import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface SingleLineSpacingRendererProps {
  text: string;
  className?: string;
}

const SingleLineContainer = styled(Box)(({ theme }) => ({
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
  lineHeight: 1.5,
  
  '& .text-block': {
    display: 'block',
    margin: 0,
    padding: 0,
  },
  
  '& .text-block + .text-block': {
    marginTop: '1em', // Exactly one line spacing between blocks
  },
  
  '& .markdown-heading': {
    display: 'block',
    margin: 0,
    fontWeight: 700,
    lineHeight: 1.3,
  },
  
  '& .markdown-heading + .text-block': {
    marginTop: '1em', // One line after headings
  },
  
  '& .text-block + .markdown-heading': {
    marginTop: '1em', // One line before headings
  },
  
  '& .markdown-bullet-list': {
    margin: 0,
    paddingLeft: '18px',
    listStyle: 'none',
  },
  
  '& .markdown-bullet-list + .text-block': {
    marginTop: '1em', // One line after lists
  },
  
  '& .text-block + .markdown-bullet-list': {
    marginTop: '1em', // One line before lists
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
  
  '& .markdown-bold': {
    fontWeight: 700,
    color: 'inherit',
  },
}));

const SingleLineSpacingRenderer: React.FC<SingleLineSpacingRendererProps> = ({ 
  text, 
  className = '' 
}) => {
  const parseMarkdown = (input: string): React.ReactNode[] => {
    if (!input) return [];

    const elements: React.ReactNode[] = [];
    let elementKey = 0;

    // Split by line breaks and handle both \n and \\n
    const lines = input.split(/\\n|\n/);
    
    let currentList: React.ReactNode[] = [];
    let inList = false;
    let currentTextBlock: React.ReactNode[] = [];

    const flushTextBlock = () => {
      if (currentTextBlock.length > 0) {
        elements.push(
          <div key={`text-block-${elementKey++}`} className="text-block">
            {currentTextBlock}
          </div>
        );
        currentTextBlock = [];
      }
    };

    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines - they will create spacing between blocks
      if (!trimmedLine) {
        flushTextBlock();
        return;
      }
      
      // Check if this line is a bullet point
      const isBulletPoint = /^[\*\-•]\s+/.test(trimmedLine);
      
      // Check if this line is a heading (bold text that spans most of the line)
      const isHeading = /^\*\*.*\*\*:?\s*$/.test(trimmedLine);
      
      if (isBulletPoint) {
        // Flush any pending text block
        flushTextBlock();
        
        // Close any existing list and start new one if needed
        if (inList && currentList.length > 0) {
          elements.push(
            <ul key={`list-${elementKey++}`} className="markdown-bullet-list">
              {currentList}
            </ul>
          );
          currentList = [];
        }
        
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
        
        const lineElements = parseBoldText(line);
        
        if (isHeading) {
          // Flush any pending text block before heading
          flushTextBlock();
          
          elements.push(
            <div key={`heading-${elementKey++}`} className="markdown-heading">
              {lineElements}
            </div>
          );
        } else {
          // Add to current text block
          currentTextBlock.push(
            <span key={`line-${elementKey++}`}>
              {lineElements}
              {lineIndex < lines.length - 1 && ' '}
            </span>
          );
        }
      }
    });
    
    // Flush any remaining text block
    flushTextBlock();
    
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
    <SingleLineContainer className={className}>
      {renderedContent}
    </SingleLineContainer>
  );
};

export default SingleLineSpacingRenderer;