export type ThemeColorTokens = {
  text: string;
  background: string;
  backgroundElement: string;
  backgroundSelected: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  tertiary: string;
};

export type ThemeFontTokens = {
  heading: string;
  body: string;
};

export type AppTheme = {
  name: 'default' | 'corporate' | 'vibrant' | 'neo-mirai';
  colors: {
    light: ThemeColorTokens;
    dark: ThemeColorTokens;
  };
  fonts: ThemeFontTokens;
};
