import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...otherProps
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  let textStyle = {};
  switch (type) {
    case 'title':
      textStyle = {
        fontSize: 24,
        fontWeight: 'bold',
      };
      break;
    case 'subtitle':
      textStyle = {
        fontSize: 18,
        fontWeight: 'bold',
      };
      break;
    case 'defaultSemiBold':
      textStyle = {
        fontWeight: '600',
      };
      break;
    case 'link':
      textStyle = {
        color: useThemeColor({}, 'tint'),
        textDecorationLine: 'underline',
      };
      break;
  }

  return <Text style={[{ color }, textStyle, style]} {...otherProps} />;
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
