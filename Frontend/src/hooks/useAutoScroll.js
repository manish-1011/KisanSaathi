import { useEffect, useRef } from 'react';

/**
 * Custom hook for auto-scrolling to bottom of a container
 * @param {Array} dependencies - Array of dependencies that trigger scroll
 * @param {Object} options - Configuration options
 * @param {boolean} options.smooth - Whether to use smooth scrolling
 * @param {number} options.delay - Delay before scrolling (in ms)
 * @param {boolean} options.force - Force scroll even if user has scrolled up
 */
export const useAutoScroll = (dependencies = [], options = {}) => {
  const { smooth = true, delay = 100, force = false } = options;
  const containerRef = useRef(null);
  const isUserScrolledRef = useRef(false);
  const lastScrollTopRef = useRef(0);

  // Function to scroll to bottom
  const scrollToBottom = (immediate = false) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollOptions = {
      top: container.scrollHeight,
      behavior: immediate ? 'auto' : (smooth ? 'smooth' : 'auto')
    };

    if (delay > 0 && !immediate) {
      setTimeout(() => {
        container.scrollTo(scrollOptions);
      }, delay);
    } else {
      container.scrollTo(scrollOptions);
    }

    // Reset user scroll tracking after auto-scroll
    isUserScrolledRef.current = false;
    lastScrollTopRef.current = container.scrollHeight;
  };

  // Track user scroll behavior
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
      
      // If user scrolled up from bottom, mark as user-scrolled
      if (scrollTop < lastScrollTopRef.current && !isAtBottom) {
        isUserScrolledRef.current = true;
      }
      
      // If user scrolled back to bottom, reset user-scrolled flag
      if (isAtBottom) {
        isUserScrolledRef.current = false;
      }
      
      lastScrollTopRef.current = scrollTop;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll when dependencies change
  useEffect(() => {
    if (!containerRef.current) return;

    // Always scroll if force is true, or if user hasn't manually scrolled up
    if (force || !isUserScrolledRef.current) {
      scrollToBottom();
    }
  }, dependencies);

  return {
    containerRef,
    scrollToBottom,
    isUserScrolled: () => isUserScrolledRef.current
  };
};

export default useAutoScroll;