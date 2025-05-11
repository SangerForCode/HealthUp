import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { ThemedView } from '../ThemedView';

export default function TabBarBackground() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ThemedView
      style={[
        styles.background,
        {
          backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground,
          borderTopColor: isDark ? Colors.dark.border : Colors.light.border,
        },
      ]}
    />
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
  },
});
