import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { AuthUser } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

type DashboardHeaderProps = {
  user: AuthUser;
};

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
        <ThemedText type="smallBold" style={styles.avatarText}>
          {user.avatarInitials}
        </ThemedText>
      </View>
      <View style={styles.textContainer}>
        <ThemedText type="subtitle">{user.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {user.email}
        </ThemedText>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
  },
  textContainer: {
    flex: 1,
    gap: Spacing.half,
  },
});
