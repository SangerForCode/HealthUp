import { LoadingOverlay } from '@/components/LoadingOverlay';
import { Colors } from '@/constants/Colors';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

function AppContent() {
  const { isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (isLoading) {
    return <LoadingOverlay message="Starting app..." />;
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const isDark = colorScheme === 'dark';

  const paperTheme = isDark
    ? {
        ...MD3DarkTheme,
        colors: {
          ...MD3DarkTheme.colors,
          primary: Colors.dark.tint,
          surface: Colors.dark.cardBackground,
          background: Colors.dark.background,
        },
      }
    : {
        ...MD3LightTheme,
        colors: {
          ...MD3LightTheme.colors,
          primary: Colors.light.tint,
          surface: Colors.light.cardBackground,
          background: Colors.light.background,
        },
      };

  if (!loaded) {
    return <LoadingOverlay message="Loading fonts..." />;
  }

  return (
    <ThemeProvider>
      <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <PaperProvider theme={paperTheme}>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </PaperProvider>
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}
