import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';
import { ThemeMode } from '@/constants/types';


interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  colors: typeof Colors.light | typeof Colors.dark;
}


const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted theme
  useEffect(() => {
    async function loadTheme() {
      try {
        const savedTheme = await AsyncStorage.getItem('@zapmart_theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setThemeMode(savedTheme);
        } else {
          setThemeMode(systemScheme === 'dark' ? 'dark' : 'light');
        }
      } catch (e) {
        console.error('Failed to load theme', e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadTheme();
  }, [systemScheme]);

  // Synchronize state if system theme changes and user hasn't overridden
  useEffect(() => {
    async function checkSystemChange() {
      const savedTheme = await AsyncStorage.getItem('@zapmart_theme');
      if (!savedTheme) {
        setThemeMode(systemScheme === 'dark' ? 'dark' : 'light');
      }
    }
    if (isLoaded) {
      checkSystemChange();
    }
  }, [systemScheme, isLoaded]);

  const toggleTheme = useCallback(async () => {
    setThemeMode((prevMode) => {
      const nextTheme = prevMode === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem('@zapmart_theme', nextTheme).catch((e) => {
        console.error('Failed to save theme', e);
      });
      return nextTheme;
    });
  }, []);

  const colors = Colors[themeMode];

  const contextValue = useMemo(() => ({
    themeMode,
    toggleTheme,
    colors,
  }), [themeMode, toggleTheme, colors]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
}

