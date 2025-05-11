import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ColorSchemeName } from 'react-native';

type ThemeContextType = {
  theme: ColorSchemeName;
  setTheme: (theme: ColorSchemeName) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ColorSchemeName>(null);

  useEffect(() => {
    loadStoredTheme();
  }, []);

  const loadStoredTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme) {
        setThemeState(storedTheme as ColorSchemeName);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (newTheme: ColorSchemeName) => {
    try {
      if (newTheme) {
        await AsyncStorage.setItem('theme', newTheme);
      } else {
        await AsyncStorage.removeItem('theme');
      }
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
      throw error;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}