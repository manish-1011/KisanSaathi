import performanceMonitor from './utils/performanceMonitor';

export const API_BASE = "http://3.109.121.197:8000";

// Request cancellation tokens
const requestTokens = new Map();

// Helper to create cache key (kept for compatibility but not used for caching)
const createCacheKey = (url, body) => {
  return `${url}:${JSON.stringify(body)}`;
};

// Cache validation disabled - always treat as invalid
const isCacheValid = (timestamp) => {
  return false; // Always return false to disable caching
};

// Request handling without deduplication - each request is treated as new
const handleRequest = async (key, requestFn) => {
  // Cancel previous request if exists
  if (requestTokens.has(key)) {
    requestTokens.get(key).cancel();
  }

  // Create cancellation token
  const token = { cancelled: false, cancel: () => { token.cancelled = true; } };
  requestTokens.set(key, token);

  try {
    const result = await requestFn(token);
    if (token.cancelled) {
      throw new Error('Request cancelled');
    }
    return result;
  } finally {
    // Clean up after request completes
    requestTokens.delete(key);
  }
};

// Optimized fetch with better headers and timeout
const optimizedFetch = async (url, options = {}, token = null) => {
  const controller = new AbortController();
  
  // Set timeout for requests
  const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout
  
  const defaultOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
    signal: controller.signal,
    ...options,
  };

  try {
    // Check if request was cancelled before starting
    if (token?.cancelled) {
      throw new Error('Request cancelled');
    }
    
    const response = await fetch(url, defaultOptions);
    clearTimeout(timeoutId);
    
    // Check if request was cancelled after fetch
    if (token?.cancelled) {
      throw new Error('Request cancelled');
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

export const api = {
  async createSession({ user_email }) {
    const requestKey = `createSession:${user_email}:${Date.now()}:${Math.random()}`; // Make each request unique
    const timerId = performanceMonitor.startTimer('createSession');
    
    try {
      const result = await handleRequest(requestKey, async (token) => {
        const res = await optimizedFetch(`${API_BASE}/session`, {
          body: JSON.stringify({ user_email }),
        }, token);
        if (!res.ok) throw new Error(`createSession failed: ${res.status}`);
        return res.json();
      });
      return result;
    } finally {
      performanceMonitor.endTimer(timerId);
    }
  },

  async getUserInfo({ user_email }) {
    const requestKey = `getUserInfo:${user_email}:${Date.now()}:${Math.random()}`; // Make each request unique
    
    // Cache disabled - always make fresh request
    return handleRequest(requestKey, async () => {
      const res = await optimizedFetch(`${API_BASE}/user-info/get`, {
        body: JSON.stringify({ user_email }),
      });
      if (!res.ok) throw new Error(`getUserInfo failed: ${res.status}`);
      
      const data = await res.json();
      
      // No caching - return data directly
      return data;
    });
  },

  async updateUserInfo({ user_email, language, mode, pincode }) {
    const payload = { user_email };
    if (language) payload.language = language;
    if (mode) payload.mode = mode;
    if (pincode) payload.pincode = pincode;
    
    const res = await optimizedFetch(`${API_BASE}/user-info/update`, {
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`updateUserInfo failed: ${res.status}`);
    
    // No cache to clear since caching is disabled
    return res.json();
  },

  async manageSession({ domain, user_email, session_id, session_name }) {
    const payload = { domain, user_email, session_id };
    if (session_name !== undefined) payload.session_name = session_name;
    
    const res = await optimizedFetch(`${API_BASE}/session/manage`, {
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`manageSession failed: ${res.status}`);
    
    // No cache to clear since caching is disabled
    return res.json();
  },

  // Helper to clear session list cache (no-op since caching is disabled)
  clearSessionListCache() {
    // No-op since caching is disabled
    console.log('Cache clearing skipped - caching is disabled');
  },

  // Helper to generate session name from user query
  generateSessionNameFromQuery(userQuery) {
    if (!userQuery || typeof userQuery !== 'string') return null;
    
    // Clean and truncate the query for session name
    const cleaned = userQuery.trim();
    if (cleaned.length < 5) return null; // Too short to be meaningful
    
    // Truncate to reasonable length for session name
    const maxLength = 50;
    if (cleaned.length <= maxLength) return cleaned;
    
    // Find a good break point (word boundary)
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.7) { // If we can break at a word boundary
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  },

  async chat({ session_id, user_email, user_msg }) {
    const timerId = performanceMonitor.startTimer('chat');
    
    try {
      const res = await optimizedFetch(`${API_BASE}/chat`, {
        body: JSON.stringify({ session_id, user_email, user_msg }),
      });
      if (!res.ok) throw new Error(`chat failed: ${res.status}`);
      return res.json();
    } finally {
      performanceMonitor.endTimer(timerId);
    }
  },

  async history({ domain, user_email, session_id, limit, offset, language }) {
    const payload = { domain, user_email, language };
    if (domain === "session-chat" && session_id) payload.session_id = session_id;
    if (typeof limit === "number") payload.limit = limit;
    if (typeof offset === "number") payload.offset = offset;
    
    // Create unique cache key for each request (no caching)
    const cacheKey = createCacheKey(`${API_BASE}/history`, payload) + `:${Date.now()}:${Math.random()}`;
    
    // No cache check - always make fresh request
    return handleRequest(cacheKey, async (token) => {
      const timerId = performanceMonitor.startTimer(`history-${domain}`);
      
      try {
        const res = await optimizedFetch(`${API_BASE}/history`, {
          body: JSON.stringify(payload),
        }, token);
        if (!res.ok) throw new Error(`history failed: ${res.status}`);
        
        const data = await res.json();
        
        // No caching - return data directly
        return data;
      } finally {
        performanceMonitor.endTimer(timerId);
      }
    });
  },

  async feedback({ user_email, session_id, thumb, text }) {
    const action = thumb === "up" ? "up" : "down";
    const comment = text || null;
    const res = await optimizedFetch(`${API_BASE}/feedback`, {
      body: JSON.stringify({ user_email, session_id, action, comment }),
    });
    if (!res.ok) throw new Error(`feedback failed: ${res.status}`);
    return res.json();
  },

  // Batch API calls - each request treated as new
  async batchHistoryRequests({ user_email, language, session_id }) {
    const requests = [
      {
        key: 'sessions',
        request: () => this.history({ 
          domain: "list-session", 
          user_email, 
          language 
        })
      }
    ];

    if (session_id) {
      requests.push({
        key: 'chat',
        request: () => this.history({
          domain: "session-chat",
          user_email,
          session_id,
          language,
        })
      });
    }

    const results = await Promise.allSettled(
      requests.map(({ request }) => request())
    );

    const response = {};
    requests.forEach(({ key }, index) => {
      const result = results[index];
      if (result.status === 'fulfilled') {
        response[key] = result.value;
      } else {
        console.error(`Batch request ${key} failed:`, result.reason);
        response[key] = null;
      }
    });

    return response;
  },

  // Clear all caches (no-op since caching is disabled)
  clearAllCaches() {
    // No-op since caching is disabled
    console.log('Cache clearing skipped - caching is disabled');
  }
};

export default api;



