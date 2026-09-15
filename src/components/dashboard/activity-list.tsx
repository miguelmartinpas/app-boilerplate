import { SymbolView } from 'expo-symbols';
import type { SFSymbol } from 'sf-symbols-typescript';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { ActivityItem } from '@/hooks/use-dashboard-data';
import { useTheme } from '@/hooks/use-theme';

type ActivityListProps = {
  items: ActivityItem[];
};

export function ActivityList({ items }: ActivityListProps) {
  const theme = useTheme();

  if (items.length === 0) {
    return (
      <ThemedView type="backgroundElement" style={styles.emptyContainer}>
        <ThemedText type="small" themeColor="textSecondary">
          Sin actividad reciente todavía.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      {items.map((item, index) => (
        <View
          key={item.id}
          style={[styles.row, index > 0 && [styles.rowDivider, { borderTopColor: theme.backgroundSelected }]]}>
          <ThemedView type="backgroundSelected" style={styles.iconBadge}>
            <SymbolView name={item.icon as SFSymbol} size={16} tintColor={theme.text} />
          </ThemedView>
          <View style={styles.textContainer}>
            <ThemedText type="smallBold">{item.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {item.description}
            </ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary" style={styles.timestamp}>
            {item.timestamp}
          </ThemedText>
        </View>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: Spacing.half,
  },
  timestamp: {
    textAlign: 'right',
  },
  emptyContainer: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
