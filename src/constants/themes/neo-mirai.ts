import { defaultTheme } from './default';
import type { AppTheme } from './types';

export const neoMiraiTheme: AppTheme = {
  ...defaultTheme,
  name: 'neo-mirai',
  colors: {
    light: {
      text: '#191001',
      background: '#F8E9D2',
      backgroundElement: '#F2DEC1',
      backgroundSelected: '#E3C5A0',
      textSecondary: '#6B5E49',
      primary: '#CC8800',
      secondary: '#E55900',
      tertiary: '#07251C',
    },
    dark: {
      text: '#FCF4E6',
      background: '#001411',
      backgroundElement: '#07251C',
      backgroundSelected: '#12352B',
      textSecondary: '#A49680',
      primary: '#E7A300',
      secondary: '#E55900',
      tertiary: '#E3C5A0',
    },
  },
  fonts: {
    heading: 'ChakraPetch_600SemiBold',
    body: 'ChakraPetch_400Regular',
  },
};
