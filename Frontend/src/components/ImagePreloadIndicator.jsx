import React, { useState, useEffect } from "react";
import { preloadAllImages, getCacheStats } from "../utils/imagePreloader";

export default function ImagePreloadIndicator() {
  const [isPreloading, setIsPreloading] = useState(true);
  const [stats, setStats] = useState({ totalImages: 0, cachedImages: 0, cacheHitRate: 0 });

  useEffect(() => {
    const startPreload = async () => {
      try {
        await preloadAllImages();
        setStats(getCacheStats());
        setIsPreloading(false);
      } catch (error) {
        console.warn('Image preloading failed:', error);
        setIsPreloading(false);
      }
    };

    startPreload();
  }, []);

  // Don't render anything if preloading is complete
  if (!isPreloading) {
    return null;
  }

  return (
    <div className="image-preload-indicator">
      <div className="preload-spinner"></div>
      <span>Loading images...</span>
    </div>
  );
}