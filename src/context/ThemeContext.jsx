import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * ============================================
 * BREACHBUDDY THEME CONTEXT
 * Dynamic Theme Engine for Multi-Theme Support
 * ============================================
 * 
 * This context provides:
 * - Theme switching between 'light' and 'dark'
 * - Persistence to localStorage
 * - Backend sync for authenticated users
 * - Smooth theme transition animations
 * - GSAP/Framer Motion animation duration sync
 */

// Available themes configuration
export const THEMES = {
  'light': {
    id: 'light',
    name: 'Light',
    description: 'Clean, modern light theme',
    icon: '☀️',
    preview: {
      primary: '#2563eb',
      secondary: '#0ea5e9',
      bg: '#ffffff'
    }
  },
  'dark': {
    id: 'dark',
    name: 'Dark',
    description: 'Sleek dark theme',
    icon: '🌙',
    preview: {
      primary: '#00d4ff',
      secondary: '#6b73ff',
      bg: '#0a0a0a'
    }
  }
};

// Animation duration constants (in seconds) - synced with CSS variables
export const ANIMATION_DURATIONS = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
  verySlow: 1.0
};

// Storage key for theme preference
const THEME_STORAGE_KEY = 'breachbuddy-theme';

// Theme context
const ThemeContext = createContext(undefined);

/**
 * Theme Provider Component
 * Wraps the application to provide theme state and controls
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('light');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  // Get initial theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    
    if (savedTheme && THEMES[savedTheme]) {
      // Use saved theme
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      console.log('✅ Loaded saved theme:', savedTheme);
    } else {
      // No saved theme - use light as default
      const defaultTheme = 'light';
      setThemeState(defaultTheme);
      document.documentElement.setAttribute('data-theme', defaultTheme);
      localStorage.setItem(THEME_STORAGE_KEY, defaultTheme);
      console.log('🆕 Set default theme:', defaultTheme);
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setSystemPrefersDark(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  /**
   * Set theme with smooth transition animation
   * @param {string} newTheme - Theme ID to switch to
   * @param {boolean} persist - Whether to save to localStorage (default: true)
   */
  const setTheme = useCallback(async (newTheme, persist = true) => {
    if (!THEMES[newTheme]) return;

    // Start transition
    setIsTransitioning(true);
    document.documentElement.classList.add('theme-transitioning');

    // Wait for next frame to ensure class is applied
    await new Promise(resolve => requestAnimationFrame(resolve));

    // Apply new theme
    document.documentElement.setAttribute('data-theme', newTheme);
    setThemeState(newTheme);

    // Persist to localStorage
    if (persist) {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    }
    
    console.log('Theme changed to:', newTheme);

    // End transition after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
      document.documentElement.classList.remove('theme-transitioning');
    }, 400); // Match CSS transition duration
  }, []);

  /**
   * Cycle to next theme
   */
  const cycleTheme = useCallback(() => {
    const themeKeys = Object.keys(THEMES);
    const currentIndex = themeKeys.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);
  }, [theme, setTheme]);

  /**
   * Reset to default theme
   */
  const resetTheme = useCallback(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    setTheme('light');
  }, [setTheme]);

  /**
   * Get CSS variable value for current theme
   * Useful for GSAP/Framer Motion animations
   * @param {string} variableName - CSS variable name (without --)
   */
  const getThemeVariable = useCallback((variableName) => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(`--theme-${variableName}`)
      .trim();
  }, []);

  /**
   * Get animation duration in seconds
   * @param {'fast' | 'normal' | 'slow' | 'verySlow'} speed - Animation speed
   */
  const getAnimationDuration = useCallback((speed = 'normal') => {
    return ANIMATION_DURATIONS[speed] || ANIMATION_DURATIONS.normal;
  }, []);

  /**
   * Get theme-aware animation config for Framer Motion
   */
  const getMotionConfig = useCallback((speed = 'normal') => {
    return {
      duration: getAnimationDuration(speed),
      ease: [0.4, 0, 0.2, 1] // Smooth easing
    };
  }, [getAnimationDuration]);

  /**
   * Get current theme's primary color
   */
  const getPrimaryColor = useCallback(() => {
    return THEMES[theme]?.preview?.primary || '#00d4ff';
  }, [theme]);

  /**
   * Get current theme's secondary color
   */
  const getSecondaryColor = useCallback(() => {
    return THEMES[theme]?.preview?.secondary || '#6b73ff';
  }, [theme]);

  // Context value
  const value = {
    // Current state
    theme,
    themeConfig: THEMES[theme],
    availableThemes: THEMES,
    isTransitioning,
    systemPrefersDark,
    
    // Actions
    setTheme,
    cycleTheme,
    resetTheme,
    
    // Utilities
    getThemeVariable,
    getAnimationDuration,
    getMotionConfig,
    getPrimaryColor,
    getSecondaryColor,
    
    // Constants
    ANIMATION_DURATIONS
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme context
 * @throws {Error} If used outside ThemeProvider
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

/**
 * Hook to get theme-aware animation parameters for GSAP
 * @param {gsap} gsap - GSAP instance
 */
export const useGsapTheme = (gsap) => {
  const { getThemeVariable, getAnimationDuration, theme } = useTheme();
  
  // Update GSAP defaults when theme changes
  useEffect(() => {
    if (gsap) {
      gsap.defaults({
        duration: getAnimationDuration('normal'),
        ease: 'power2.out'
      });
    }
  }, [gsap, theme, getAnimationDuration]);
  
  return {
    duration: {
      fast: getAnimationDuration('fast'),
      normal: getAnimationDuration('normal'),
      slow: getAnimationDuration('slow')
    },
    colors: {
      primary: getThemeVariable('primary'),
      secondary: getThemeVariable('secondary'),
      accent: getThemeVariable('accent')
    },
    getVar: getThemeVariable
  };
};

export default ThemeContext;
