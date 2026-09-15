import { Platform } from 'react-native';

import { defaultTheme } from './default';
import type { AppTheme } from './types';

export const vibrantTheme: AppTheme = {
  ...defaultTheme,
  name: 'vibrant',
  colors: {
    light: { ...defaultTheme.colors.light, primary: '#FF3D71', secondary: '#FFB800', tertiary: '#00E5FF' },
    dark: { ...defaultTheme.colors.dark, primary: '#FF6B9D', secondary: '#FFD60A', tertiary: '#5CF4FF' },
  },
  fonts: {
    heading: Platform.select({ ios: 'ui-rounded', default: 'normal', web: 'var(--font-rounded)' }),
    body: defaultTheme.fonts.body,
  },
};
