import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const ScrollToBottomButton = ({ containerRef, threshold = 200 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setIsVisible(distanceFromBottom > threshold);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef, threshold]);

  const scrollToBottom = () => {
    if (containerRef?.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  if (!isVisible) return null;

  return (
    <button
      className="scroll-to-bottom-btn"
      onClick={scrollToBottom}
      title="Scroll to bottom"
      aria-label="Scroll to bottom"
    >
      <ChevronDown size={20} />
    </button>
  );
};

export default ScrollToBottomButton;