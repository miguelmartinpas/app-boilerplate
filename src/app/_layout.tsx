import 'react-native-url-polyfill/auto';

import { ChakraPetch_400Regular, ChakraPetch_600SemiBold, useFonts } from '@expo-google-fonts/chakra-petch';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ThemedView } from '@/components/themed-view';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({ ChakraPetch_400Regular, ChakraPetch_600SemiBold });

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <RootNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}

// The guards live in a child component because `useAuth()` only works inside `AuthProvider`.
function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const theme = useTheme();

  // Hold a full-screen spinner until the session resolves, so the wrong tab bar never mounts.
  if (isLoading) {
    return (
      <ThemedView style={styles.loader}>
        <ActivityIndicator color={theme.primary} size="large" />
      </ThemedView>
    );
  }

  return (
    <Stack>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(public)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
