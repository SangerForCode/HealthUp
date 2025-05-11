import { useThemeColor } from '@/hooks/useThemeColor';
import { View, ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'card';
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  variant = 'default',
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    variant === 'default' ? 'background' : 'cardBackground'
  );

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
