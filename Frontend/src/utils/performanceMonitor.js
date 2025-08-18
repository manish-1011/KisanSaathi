// Performance monitoring utility to track API latency
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  /**
   * Start timing an operation
   */
  startTimer(operationName) {
    if (!this.isEnabled) return null;
    
    const startTime = performance.now();
    const timerId = `${operationName}_${Date.now()}_${Math.random()}`;
    
    this.metrics.set(timerId, {
      operation: operationName,
      startTime,
      endTime: null,
      duration: null
    });
    
    return timerId;
  }

  /**
   * End timing an operation
   */
  endTimer(timerId) {
    if (!this.isEnabled || !timerId) return null;
    
    const metric = this.metrics.get(timerId);
    if (!metric) return null;
    
    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    metric.endTime = endTime;
    metric.duration = duration;
    
    // Log slow operations
    if (duration > 1000) { // More than 1 second
      console.warn(`🐌 Slow operation detected: ${metric.operation} took ${duration.toFixed(2)}ms`);
    } else if (duration > 500) { // More than 500ms
      console.log(`⚠️ ${metric.operation} took ${duration.toFixed(2)}ms`);
    } else {
      console.log(`✅ ${metric.operation} completed in ${duration.toFixed(2)}ms`);
    }
    
    return metric;
  }

  /**
   * Get performance summary
   */
  getSummary() {
    if (!this.isEnabled) return null;
    
    const operations = {};
    
    for (const [id, metric] of this.metrics) {
      if (metric.duration === null) continue; // Skip incomplete operations
      
      if (!operations[metric.operation]) {
        operations[metric.operation] = {
          count: 0,
          totalTime: 0,
          avgTime: 0,
          minTime: Infinity,
          maxTime: 0
        };
      }
      
      const op = operations[metric.operation];
      op.count++;
      op.totalTime += metric.duration;
      op.avgTime = op.totalTime / op.count;
      op.minTime = Math.min(op.minTime, metric.duration);
      op.maxTime = Math.max(op.maxTime, metric.duration);
    }
    
    return operations;
  }

  /**
   * Clear old metrics to prevent memory leaks
   */
  cleanup() {
    if (!this.isEnabled) return;
    
    const cutoffTime = Date.now() - 300000; // 5 minutes ago
    
    for (const [id, metric] of this.metrics) {
      if (metric.startTime < cutoffTime) {
        this.metrics.delete(id);
      }
    }
  }

  /**
   * Log performance summary
   */
  logSummary() {
    if (!this.isEnabled) return;
    
    const summary = this.getSummary();
    if (!summary) return;
    
    console.group('📊 Performance Summary');
    Object.entries(summary).forEach(([operation, stats]) => {
      console.log(`${operation}:`, {
        calls: stats.count,
        avg: `${stats.avgTime.toFixed(2)}ms`,
        min: `${stats.minTime.toFixed(2)}ms`,
        max: `${stats.maxTime.toFixed(2)}ms`,
        total: `${stats.totalTime.toFixed(2)}ms`
      });
    });
    console.groupEnd();
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Auto-cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    performanceMonitor.cleanup();
  }, 300000);
}

export default performanceMonitor;