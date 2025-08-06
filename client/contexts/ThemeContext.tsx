import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ColorScheme = 'light' | 'dark';

export interface Colors {
  primary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  tabBarBackground: string;
  tabBarActiveTint: string;
  tabBarInactiveTint: string;
  statusBar: 'light-content' | 'dark-content';
  success: string;
  error: string;
  shadow: string;
}

const lightColors: Colors = {
  primary: '#323232ff',
  background: '#ffffff',
  surface: '#f8f8f8ff',
  text: '#000000',
  textSecondary: '#747474',
  border: '#ebebebff',
  tabBarBackground: '#ffffff',
  tabBarActiveTint: '#000000',
  tabBarInactiveTint: '#8E8E93',
  statusBar: 'dark-content',
  success: '#149f37ff',
  error: '#ff2f24ff',
  shadow: '#000000',
};

const darkColors: Colors = {
  primary: '#d6d6d6ff',
  background: '#000000',
  surface: '#1C1C1E',
  text: '#ffffff',
  textSecondary: '#8E8E93',
  border: '#3A3A3C',
  tabBarBackground: '#1C1C1E',
  tabBarActiveTint: '#ffffff',
  tabBarInactiveTint: '#8E8E93',
  statusBar: 'light-content',
  success: '#30D158',
  error: '#FF453A',
  shadow: '#ffffff',
};

interface ThemeContextType {
  colors: Colors;
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = 'app_theme_mode';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    Appearance.getColorScheme() || 'light'
  );

  // Load saved theme mode from storage
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'auto')) {
          setThemeModeState(savedMode as ThemeMode);
        }
      } catch (error) {
        console.error('Error loading theme mode:', error);
      }
    };

    loadThemeMode();
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme || 'light');
    });

    return () => subscription?.remove();
  }, []);

  // Determine effective color scheme based on theme mode
  useEffect(() => {
    if (themeMode === 'auto') {
      const systemScheme = Appearance.getColorScheme();
      setColorScheme(systemScheme || 'light');
    } else {
      setColorScheme(themeMode as ColorScheme);
    }
  }, [themeMode]);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };

  const colors = colorScheme === 'dark' ? darkColors : lightColors;

  const value: ThemeContextType = {
    colors,
    themeMode,
    colorScheme,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
