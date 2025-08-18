// Theme initializer to prevent FOUC (Flash of Unstyled Content)
export const initializeTheme = () => {
  // Get saved theme preference or default to light
  const savedTheme = localStorage.getItem('ks_theme');
  
  // For debugging - let's see what's in localStorage
  console.log('Saved theme from localStorage:', savedTheme);
  
  // If no saved theme exists, default to light mode (false)
  // If saved theme exists, use it
  const isDarkMode = savedTheme === 'dark';
  
  console.log('Initializing theme - isDarkMode:', isDarkMode);
  
  // Immediately apply theme to document
  document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  
  // Immediately update CSS custom properties
  const root = document.documentElement;
  if (isDarkMode) {
    // Dark mode colors
    root.style.setProperty('--bg', '#0F172A');
    root.style.setProperty('--panel', '#1E293B');
    root.style.setProperty('--border', '#334155');
    root.style.setProperty('--text', '#F1F5F9');
    root.style.setProperty('--muted', '#94A3B8');
  } else {
    // Light mode colors
    root.style.setProperty('--bg', '#F4F7FB');
    root.style.setProperty('--panel', '#FFFFFF');
    root.style.setProperty('--border', '#E5E9F2');
    root.style.setProperty('--text', '#0F172A');
    root.style.setProperty('--muted', '#8A94A6');
  }
  
  return isDarkMode;
};

// Call this immediately when the script loads
if (typeof window !== 'undefined') {
  initializeTheme();
}