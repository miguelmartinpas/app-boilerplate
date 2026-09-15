import { corporateTheme } from './corporate';
import { defaultTheme } from './default';
import { neoMiraiTheme } from './neo-mirai';
import type { AppTheme } from './types';
import { vibrantTheme } from './vibrant';

const themes = { default: defaultTheme, corporate: corporateTheme, vibrant: vibrantTheme, 'neo-mirai': neoMiraiTheme } as const;

export type ThemeName = keyof typeof themes;

const envTheme = process.env.EXPO_PUBLIC_THEME as ThemeName | undefined;
export const activeTheme: AppTheme = themes[envTheme ?? 'default'] ?? themes.default;

export const Colors = activeTheme.colors;
export const ThemeFonts = activeTheme.fonts;
