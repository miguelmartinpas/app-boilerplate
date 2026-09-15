import { StyleSheet, View } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const PLACEHOLDER_ROWS = 3;

export function ActivityListSkeleton() {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      {Array.from({ length: PLACEHOLDER_ROWS }).map((_, index) => (
        <View
          key={index}
          style={[styles.row, index > 0 && [styles.rowDivider, { borderTopColor: theme.backgroundSelected }]]}>
          <ThemedView type="backgroundSelected" style={styles.iconBadge} />
          <View style={styles.textContainer}>
            <ThemedView type="backgroundSelected" style={styles.lineWide} />
            <ThemedView type="backgroundSelected" style={styles.lineNarrow} />
          </View>
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
  },
  textContainer: {
    flex: 1,
    gap: Spacing.two,
  },
  lineWide: {
    width: '70%',
    height: 14,
    borderRadius: Spacing.one,
  },
  lineNarrow: {
    width: '45%',
    height: 12,
    borderRadius: Spacing.one,
  },
});
