import { StyleSheet, View } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export function StatCardSkeleton() {
  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedView type="backgroundSelected" style={styles.iconBadge} />
      <View style={styles.labelPlaceholder}>
        <ThemedView type="backgroundSelected" style={styles.lineNarrow} />
      </View>
      <View style={styles.valuePlaceholder}>
        <ThemedView type="backgroundSelected" style={styles.lineWide} />
      </View>
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
  },
  labelPlaceholder: {
    minHeight: 40,
    justifyContent: 'center',
  },
  lineNarrow: {
    width: '70%',
    height: 14,
    borderRadius: Spacing.one,
  },
  valuePlaceholder: {
    minHeight: 26,
    justifyContent: 'center',
  },
  lineWide: {
    width: '50%',
    height: 18,
    borderRadius: Spacing.one,
  },
});
