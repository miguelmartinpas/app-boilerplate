import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityList } from '@/components/dashboard/activity-list';
import { ActivityListSkeleton } from '@/components/dashboard/activity-list-skeleton';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardHeaderSkeleton } from '@/components/dashboard/dashboard-header-skeleton';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatCardSkeleton } from '@/components/dashboard/stat-card-skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing, ThemeFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useTheme } from '@/hooks/use-theme';

const STAT_SKELETON_KEYS = ['a', 'b', 'c'];

export default function DashboardScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { isLoading, stats, activity } = useDashboardData();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  if (isAuthLoading || !isAuthenticated || !user) {
    return (
      <ThemedView style={[styles.scrollView, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} size="large" />
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={styles.contentContainer}>
      <ThemedView style={styles.container}>
        {isLoading ? <DashboardHeaderSkeleton /> : <DashboardHeader user={user} />}

        <View style={styles.statsRow}>
          {isLoading
            ? STAT_SKELETON_KEYS.map((key) => <StatCardSkeleton key={key} />)
            : stats.map((stat) => <StatCard key={stat.id} data={stat} />)}
        </View>

        <View style={styles.activitySection}>
          <ThemedText style={styles.sectionTitle}>Actividad reciente</ThemedText>
          {isLoading ? <ActivityListSkeleton /> : <ActivityList items={activity} />}
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    width: '100%',
    flexGrow: 1,
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  activitySection: {
    gap: Spacing.three,
  },
  sectionTitle: {
    fontFamily: ThemeFonts.heading,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
});
