import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAuth, type AuthUser } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

type DashboardHeaderProps = {
  user: AuthUser;
};

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace('/');
  }

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
        <ThemedText type="smallBold" style={styles.avatarText}>
          {user.avatarInitials}
        </ThemedText>
      </View>
      <View style={styles.textContainer}>
        <ThemedText type="subtitle">{user.displayName}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {user.email}
        </ThemedText>
      </View>
      <Pressable onPress={handleLogout} style={({ pressed }) => pressed && styles.pressed}>
        <ThemedText type="link" themeColor="textSecondary">
          Cerrar sesión
        </ThemedText>
      </Pressable>
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
  pressed: {
    opacity: 0.7,
  },
});
