/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#1D9BF0';
const tintColorDark = '#1D9BF0';

export const Colors = {
  light: {
    text: '#0F1419',
    background: '#FFFFFF',
    tint: tintColorLight,
    tabIconDefault: '#536471',
    tabIconSelected: tintColorLight,
    icon: '#536471',
    cardBackground: '#F7F9F9',
    border: '#EFF3F4',
  },
  dark: {
    text: '#E7E9EA',
    background: '#000000',
    tint: tintColorDark,
    tabIconDefault: '#71767B',
    tabIconSelected: tintColorDark,
    icon: '#71767B',
    cardBackground: '#16181C',
    border: '#2F3336',
  },
} as const;
