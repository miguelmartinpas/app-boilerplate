import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppTabs from '@/components/app-tabs';
import { SessionHeader } from '@/components/session-header';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function AppLayout() {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.headerRow, { paddingTop: insets.top + Spacing.four }]}>
        <View style={styles.headerContent}>
          <SessionHeader />
        </View>
      </View>
      <AppTabs />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  headerContent: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
});
