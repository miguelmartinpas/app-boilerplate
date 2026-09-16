import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { getReadableTextColor, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

export function SessionHeader() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const onPrimaryColor = getReadableTextColor(theme.primary);

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
        <ThemedText type="smallBold" style={{ color: onPrimaryColor }}>
          {user.avatarInitials}
        </ThemedText>
      </View>
      <View style={styles.textContainer}>
        <ThemedText type="subtitle">{user.displayName}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {user.email}
        </ThemedText>
      </View>
      {/* No navigation here: signing out flips the `(app)` guard, which sends the user back to Home. */}
      <Pressable
        onPress={() => logout()}
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
        hitSlop={Spacing.two}
        style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}>
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
  textContainer: {
    flex: 1,
    gap: Spacing.half,
  },
  // Padding plus hitSlop lift a link-sized label to a comfortable touch target.
  logoutButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
});
