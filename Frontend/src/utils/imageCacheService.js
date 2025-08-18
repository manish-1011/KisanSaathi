// Optimized image caching service with non-blocking preload
// This service provides efficient caching without blocking the main thread

class ImageCacheService {
  constructor() {
    this.memoryCache = new Map();
    this.preloadPromises = new Map();
    this.isInitialized = false;
    this.abortController = new AbortController();
  }

  /**
   * Initialize the cache service (non-blocking)
   */
  async initialize() {
    if (this.isInitialized) return;
    
    console.log('🚀 Initializing Image Cache Service...');
    this.isInitialized = true;
    console.log('✅ Image Cache Service initialized');
  }

  /**
   * Check if a URL is an image request
   */
  isImageRequest(url) {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  }

  /**
   * Preload an image with aggressive caching (non-blocking)
   */
  async preloadImage(src, options = {}) {
    const { priority = 'low', fetchPriority = 'low' } = options;
    
    // Return existing promise if already preloading
    if (this.preloadPromises.has(src)) {
      return this.preloadPromises.get(src);
    }

    // Return cached image if available
    if (this.memoryCache.has(src)) {
      return Promise.resolve(this.memoryCache.get(src));
    }

    const preloadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      
      // Set fetch priority for better loading performance
      if ('fetchPriority' in img) {
        img.fetchPriority = fetchPriority;
      }
      
      // Handle abort signal
      const onAbort = () => {
        img.src = '';
        this.preloadPromises.delete(src);
        reject(new Error('Image preload aborted'));
      };
      
      if (this.abortController.signal.aborted) {
        onAbort();
        return;
      }
      
      this.abortController.signal.addEventListener('abort', onAbort);
      
      img.onload = () => {
        this.memoryCache.set(src, img);
        this.preloadPromises.delete(src);
        this.abortController.signal.removeEventListener('abort', onAbort);
        resolve(img);
      };
      
      img.onerror = (error) => {
        this.preloadPromises.delete(src);
        this.abortController.signal.removeEventListener('abort', onAbort);
        console.warn(`Failed to preload image: ${src}`, error);
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      // Use requestIdleCallback for non-blocking loading
      const loadImage = () => {
        img.crossOrigin = 'anonymous';
        img.src = src;
      };
      
      if (window.requestIdleCallback) {
        window.requestIdleCallback(loadImage, { timeout: 1000 });
      } else {
        setTimeout(loadImage, 0);
      }
    });

    this.preloadPromises.set(src, preloadPromise);
    return preloadPromise;
  }

  /**
   * Preload multiple images with batching (non-blocking)
   */
  async preloadImages(imageSources, options = {}) {
    const { batchSize = 2, priority = 'low' } = options; // Reduced batch size
    
    console.log(`📦 Preloading ${imageSources.length} images in background...`);
    
    // Use requestIdleCallback to avoid blocking main thread
    return new Promise((resolve) => {
      const results = [];
      let currentIndex = 0;
      
      const processBatch = async () => {
        if (currentIndex >= imageSources.length) {
          const successful = results.filter(r => !r.error).length;
          const failed = results.filter(r => r.error).length;
          console.log(`✅ Background image preloading complete: ${successful} successful, ${failed} failed`);
          resolve(results);
          return;
        }
        
        const batch = imageSources.slice(currentIndex, currentIndex + batchSize);
        currentIndex += batchSize;
        
        const batchPromises = batch.map(src => 
          this.preloadImage(src, { priority })
            .catch(error => ({ error, src }))
        );
        
        try {
          const batchResults = await Promise.all(batchPromises);
          results.push(...batchResults);
        } catch (error) {
          console.warn('Batch preload error:', error);
        }
        
        // Schedule next batch with idle callback
        if (window.requestIdleCallback) {
          window.requestIdleCallback(processBatch, { timeout: 100 });
        } else {
          setTimeout(processBatch, 50);
        }
      };
      
      // Start first batch
      if (window.requestIdleCallback) {
        window.requestIdleCallback(processBatch, { timeout: 100 });
      } else {
        setTimeout(processBatch, 0);
      }
    });
  }

  /**
   * Get cached image
   */
  getCachedImage(src) {
    return this.memoryCache.get(src) || null;
  }

  /**
   * Check if image is cached
   */
  isImageCached(src) {
    return this.memoryCache.has(src);
  }

  /**
   * Clear cache and abort pending requests
   */
  clearCache() {
    this.abortController.abort();
    this.abortController = new AbortController();
    this.memoryCache.clear();
    this.preloadPromises.clear();
    console.log('🗑️ Image cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cachedImages: this.memoryCache.size,
      pendingPreloads: this.preloadPromises.size,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Estimate memory usage (rough calculation)
   */
  estimateMemoryUsage() {
    let totalSize = 0;
    for (const [src, img] of this.memoryCache) {
      // Rough estimate: width * height * 4 bytes per pixel
      totalSize += (img.naturalWidth || 0) * (img.naturalHeight || 0) * 4;
    }
    return Math.round(totalSize / 1024 / 1024 * 100) / 100; // MB
  }

  /**
   * Cleanup method for proper disposal
   */
  dispose() {
    this.clearCache();
  }
}

// Create singleton instance
const imageCacheService = new ImageCacheService();

export default imageCacheService;