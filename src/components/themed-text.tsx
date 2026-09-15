import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor, ThemeFonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontFamily: ThemeFonts.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  smallBold: {
    fontFamily: ThemeFonts.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  default: {
    fontFamily: ThemeFonts.body,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
  },
  title: {
    fontFamily: ThemeFonts.heading,
    fontSize: 48,
    fontWeight: 600,
    lineHeight: 52,
  },
  subtitle: {
    fontFamily: ThemeFonts.heading,
    fontSize: 32,
    lineHeight: 44,
    fontWeight: 600,
  },
  link: {
    fontFamily: ThemeFonts.body,
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    fontFamily: ThemeFonts.body,
    lineHeight: 30,
    fontSize: 14,
    color: '#3c87f7',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
