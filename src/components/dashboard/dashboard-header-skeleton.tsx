import { StyleSheet, View } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export function DashboardHeaderSkeleton() {
  return (
    <View style={styles.container}>
      <ThemedView type="backgroundElement" style={styles.avatar} />
      <View style={styles.textContainer}>
        <ThemedView type="backgroundElement" style={styles.lineWide} />
        <ThemedView type="backgroundElement" style={styles.lineNarrow} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  textContainer: {
    flex: 1,
    gap: Spacing.two,
  },
  lineWide: {
    width: '60%',
    height: 20,
    borderRadius: Spacing.one,
  },
  lineNarrow: {
    width: '40%',
    height: 14,
    borderRadius: Spacing.one,
  },
});
