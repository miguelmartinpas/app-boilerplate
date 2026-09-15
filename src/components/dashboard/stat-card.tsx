import { SymbolView } from 'expo-symbols';
import type { SFSymbol } from 'sf-symbols-typescript';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, ThemeFonts } from '@/constants/theme';
import type { StatCardData } from '@/hooks/use-dashboard-data';
import { useTheme } from '@/hooks/use-theme';

type StatCardProps = {
  data: StatCardData;
};

export function StatCard({ data }: StatCardProps) {
  const theme = useTheme();
  const accentColor = theme[data.colorToken];

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <View style={[styles.iconBadge, { backgroundColor: accentColor }]}>
        <SymbolView name={data.icon as SFSymbol} size={18} tintColor="#ffffff" weight="semibold" />
      </View>
      <ThemedText type="small" themeColor="textSecondary" numberOfLines={2} style={styles.label}>
        {data.label}
      </ThemedText>
      <ThemedText numberOfLines={1} style={styles.value}>
        {data.value}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    gap: Spacing.two,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    minHeight: 40,
  },
  value: {
    fontFamily: ThemeFonts.heading,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
});
