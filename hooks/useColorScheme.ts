import { useTheme } from '@/contexts/ThemeContext';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export function useColorScheme() {
  const systemColorScheme = useSystemColorScheme();
  const { theme } = useTheme();
  
  // Return user's preferred theme if set, otherwise use system theme
  return theme ?? systemColorScheme;
}
