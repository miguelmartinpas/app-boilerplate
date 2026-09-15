import { Platform } from 'react-native';

import { defaultTheme } from './default';
import type { AppTheme } from './types';

export const corporateTheme: AppTheme = {
  ...defaultTheme,
  name: 'corporate',
  colors: {
    light: { ...defaultTheme.colors.light, primary: '#0B5FFF', secondary: '#1B3B6F', tertiary: '#C9A227' },
    dark: { ...defaultTheme.colors.dark, primary: '#3D82FF', secondary: '#5577AA', tertiary: '#E0BB4A' },
  },
  fonts: {
    heading: Platform.select({ ios: 'ui-serif', default: 'serif', web: 'var(--font-serif)' }),
    body: defaultTheme.fonts.body,
  },
};
