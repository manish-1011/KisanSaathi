import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface DirectSpacingRendererProps {
  text: string;
  className?: string;
}

const DirectSpacingContainer = styled(Box)(({ theme }) => ({
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
  lineHeight: '1.5em',
  fontSize: '15px',
  
  // Override all existing spacing
  '& *': {
    margin: '0 !important',
    padding: '0 !important',
    boxSizing: 'border-box',
  },
  
  // Direct spacing control
  '& .text-line': {
    display: 'block',
    margin: '0 !important',
    padding: '0 !important',
    lineHeight: '1.5em',
  },
  
  '& .single-space': {
    display: 'block',
    height: '1.5em', // Exactly one line
    margin: '0 !important',
    padding: '0 !important',
  },
  
  '& .double-space': {
    display: 'block',
    height: '3em', // Exactly two lines
    margin: '0 !important',
    padding: '0 !important',
  },
  
  '& .bullet-list': {
    margin: '0 !important',
    padding: '0 0 0 20px !important',
    listStyle: 'disc',
    listStylePosition: 'outside',
  },
  
  '& .bullet-item': {
    margin: '0.3em 0 !important',
    padding: '0 !important',
    lineHeight: '1.5em',
    display: 'list-item',
  },
  
  '& .bold': {
    fontWeight: 700,
  },
}));

const DirectSpacingRenderer: React.FC<DirectSpacingRendererProps> = ({ 
  text, 
  className = '' 
}) => {
  const renderWithDirectSpacing = (): React.ReactNode => {
    if (!text) return null;

    // Split by double line breaks first (sections)
    const sections = text.split(/\n\s*\n/);
    const elements: React.ReactNode[] = [];
    let key = 0;

    sections.forEach((section, sectionIndex) => {
      if (!section.trim()) return;

      // Split section by single line breaks
      const lines = section.split('\n');
      const sectionElements: React.ReactNode[] = [];
      let currentBullets: React.ReactNode[] = [];
      let inBulletList = false;

      lines.forEach((line, lineIndex) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        const isBullet = /^[\*\-•]\s+/.test(trimmedLine);

        if (isBullet) {
          if (!inBulletList) {
            inBulletList = true;
            currentBullets = [];
          }
          
          const bulletText = trimmedLine.replace(/^[\*\-•]\s+/, '');
          const bulletContent = parseBold(bulletText);
          
          currentBullets.push(
            <li key={`bullet-${key++}`} className="bullet-item">
              {bulletContent}
            </li>
          );
        } else {
          // Close bullet list if we were in one
          if (inBulletList && currentBullets.length > 0) {
            sectionElements.push(
              <ul key={`list-${key++}`} className="bullet-list">
                {currentBullets}
              </ul>
            );
            currentBullets = [];
            inBulletList = false;
          }

          // Regular text line
          const lineContent = parseBold(line);
          sectionElements.push(
            <div key={`line-${key++}`} className="text-line">
              {lineContent}
            </div>
          );
        }
      });

      // Close any remaining bullet list
      if (inBulletList && currentBullets.length > 0) {
        sectionElements.push(
          <ul key={`list-${key++}`} className="bullet-list">
            {currentBullets}
          </ul>
        );
      }

      // Add section to main elements
      elements.push(
        <div key={`section-${sectionIndex}`}>
          {sectionElements}
        </div>
      );

      // Add spacing between sections (but not after the last one)
      if (sectionIndex < sections.length - 1) {
        elements.push(
          <div key={`space-${sectionIndex}`} className="double-space" />
        );
      }
    });

    return elements;
  };

  const parseBold = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*[^*]+\*\*)/);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <span key={index} className="bold">
            {part.slice(2, -2)}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <DirectSpacingContainer className={className}>
      {renderWithDirectSpacing()}
    </DirectSpacingContainer>
  );
};

export default DirectSpacingRenderer;