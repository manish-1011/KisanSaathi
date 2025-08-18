import { useState, useEffect } from 'react';
import { preloadAllImages, getCacheStats } from '../utils/imagePreloader';

/**
 * Hook to manage image preloading state (non-blocking)
 * @returns {object} - Preloading state and statistics
 */
export const useImagePreload = () => {
  const [isPreloading, setIsPreloading] = useState(false); // Start as false
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ 
    totalImages: 0, 
    cachedImages: 0, 
    cacheHitRate: 0,
    memoryUsage: 0 
  });

  useEffect(() => {
    // Start preloading in background without blocking
    const startBackgroundPreload = () => {
      // Don't block initial render
      setTimeout(async () => {
        try {
          setIsPreloading(true);
          setError(null);
          
          // Preload in background
          await preloadAllImages();
          
          const currentStats = getCacheStats();
          setStats(currentStats);
          
          console.log('📊 Background image preload stats:', currentStats);
        } catch (err) {
          console.warn('Background image preloading failed:', err);
          setError(err);
        } finally {
          setIsPreloading(false);
        }
      }, 1000); // Delay to not interfere with initial app load
    };

    startBackgroundPreload();
  }, []);

  return {
    isPreloading,
    error,
    stats,
    isComplete: !isPreloading && !error
  };
};

export default useImagePreload;