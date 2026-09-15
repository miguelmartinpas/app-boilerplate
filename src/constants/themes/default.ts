import { Platform } from 'react-native';

import type { AppTheme } from './types';

export const defaultTheme: AppTheme = {
  name: 'default',
  colors: {
    light: {
      text: '#000000',
      background: '#ffffff',
      backgroundElement: '#F0F0F3',
      backgroundSelected: '#E0E1E6',
      textSecondary: '#60646C',
      primary: '#3c87f7',
      secondary: '#6C63FF',
      tertiary: '#00BFA6',
    },
    dark: {
      text: '#ffffff',
      background: '#000000',
      backgroundElement: '#212225',
      backgroundSelected: '#2E3135',
      textSecondary: '#B0B4BA',
      primary: '#5B9DFF',
      secondary: '#8A82FF',
      tertiary: '#33D9C1',
    },
  },
  fonts: {
    heading: Platform.select({ ios: 'system-ui', default: 'normal', web: 'var(--font-display)' }),
    body: Platform.select({ ios: 'system-ui', default: 'normal', web: 'var(--font-display)' }),
  },
};
