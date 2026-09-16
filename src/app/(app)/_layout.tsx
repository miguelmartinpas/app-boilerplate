import { usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppTabs from '@/components/app-tabs';
import { SessionHeader } from '@/components/session-header';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export const unstable_settings = { anchor: 'dashboard' };

export default function AppLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  // Home is the one logged-in screen without the header: its CTA is already the logout control.
  const showSessionHeader = pathname !== '/home';

  return (
    <ThemedView style={styles.container}>
      {showSessionHeader && (
        <View style={[styles.headerRow, { paddingTop: insets.top + Spacing.four }]}>
          <View style={styles.headerContent}>
            <SessionHeader />
          </View>
        </View>
      )}
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
