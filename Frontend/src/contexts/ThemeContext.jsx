import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeTheme } from '../utils/themeInitializer';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // For first-time users or when no preference is saved, default to light mode
    const savedTheme = localStorage.getItem('ks_theme');
    console.log('ThemeProvider - savedTheme:', savedTheme);
    
    // Initialize theme immediately to prevent FOUC
    const initialDarkMode = initializeTheme();
    console.log('ThemeProvider - initialDarkMode:', initialDarkMode);
    
    return initialDarkMode;
  });

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('ks_theme', isDarkMode ? 'dark' : 'light');
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    
    // Update CSS custom properties
    const root = document.documentElement;
    if (isDarkMode) {
      // Dark mode colors
      root.style.setProperty('--bg', '#0F172A');
      root.style.setProperty('--panel', '#1E293B');
      root.style.setProperty('--border', '#334155');
      root.style.setProperty('--text', '#F1F5F9');
      root.style.setProperty('--muted', '#94A3B8');
    } else {
      // Light mode colors (original)
      root.style.setProperty('--bg', '#F4F7FB');
      root.style.setProperty('--panel', '#FFFFFF');
      root.style.setProperty('--border', '#E5E9F2');
      root.style.setProperty('--text', '#0F172A');
      root.style.setProperty('--muted', '#8A94A6');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const value = {
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? 'dark' : 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};