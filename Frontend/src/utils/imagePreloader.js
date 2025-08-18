// Optimized image preloader utility with non-blocking load
// This prevents blocking the main thread during startup

import img1 from "../assets/img1.png";
import img2 from "../assets/img2.png";
import img3 from "../assets/img3.png";
import img4 from "../assets/img4.png";
import logo from "../assets/logo.png";
import user from "../assets/user.png";
import imageCacheService from "./imageCacheService";

// All images that need to be preloaded
const imagesToPreload = [
  img1,
  img2,
  img3,
  img4,
  logo,
  user
];

// Additional images that might be loaded dynamically
const additionalImages = [
  '/32.png',
  '/64.png', 
  '/128.png'
].filter(Boolean);

// Combine all images
const allImages = [...imagesToPreload, ...additionalImages];

let preloadPromise = null;

/**
 * Preload all images in background without blocking main thread
 * @returns {Promise} - Promise that resolves when all images are loaded
 */
export const preloadAllImages = async () => {
  if (preloadPromise) {
    return preloadPromise;
  }

  console.log('🖼️ Starting background image preloading...');
  
  preloadPromise = (async () => {
    try {
      // Initialize the cache service
      await imageCacheService.initialize();
      
      // Preload all images with reduced batch size for better performance
      const results = await imageCacheService.preloadImages(allImages, {
        batchSize: 2, // Reduced from 6 to 2
        priority: 'low' // Changed from high to low
      });
      
      const successful = results.filter(r => !r.error).length;
      const failed = results.filter(r => r.error).length;
      
      console.log(`✅ Background image preloading complete: ${successful} successful, ${failed} failed`);
      
      return results;
    } catch (error) {
      console.error('❌ Error during background image preloading:', error);
      // Don't throw error to avoid blocking app
      return [];
    }
  })();

  return preloadPromise;
};

/**
 * Get a preloaded image from cache
 * @param {string} src - Image source URL
 * @returns {HTMLImageElement|null} - Cached image element or null
 */
export const getCachedImage = (src) => {
  return imageCacheService.getCachedImage(src);
};

/**
 * Check if an image is cached
 * @param {string} src - Image source URL
 * @returns {boolean} - True if image is cached
 */
export const isImageCached = (src) => {
  return imageCacheService.isImageCached(src);
};

/**
 * Get cache statistics
 * @returns {object} - Cache statistics
 */
export const getCacheStats = () => {
  const serviceStats = imageCacheService.getCacheStats();
  return {
    totalImages: allImages.length,
    ...serviceStats,
    cacheHitRate: serviceStats.cachedImages > 0 ? serviceStats.cachedImages / allImages.length : 0
  };
};

// Export the image URLs for use in components
export const preloadedImages = {
  img1,
  img2,
  img3,
  img4,
  logo,
  user
};

export default {
  preloadAllImages,
  getCachedImage,
  isImageCached,
  getCacheStats,
  preloadedImages
};