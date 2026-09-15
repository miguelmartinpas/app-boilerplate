import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

type LoginFormState = {
  email: string;
  password: string;
  error: string | null;
  isSubmitting: boolean;
};

const INITIAL_FORM_STATE: LoginFormState = {
  email: '',
  password: '',
  error: null,
  isSubmitting: false,
};

type FocusedField = 'email' | 'password' | null;

export default function LoginScreen() {
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const { isAuthenticated, isLoading, login } = useAuth();
  const [form, setForm] = useState<LoginFormState>(INITIAL_FORM_STATE);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  async function handleSubmit() {
    setForm((prev) => ({ ...prev, isSubmitting: true, error: null }));
    const result = await login(form.email, form.password);
    if (!result.success) {
      setForm((prev) => ({ ...prev, isSubmitting: false, error: result.error ?? null }));
      return;
    }
    router.replace('/dashboard');
  }

  if (isLoading || isAuthenticated) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator color={theme.primary} size="large" />
      </ThemedView>
    );
  }

  const errorColor = isDark ? '#FF8080' : '#C42B2B';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedView style={styles.header}>
            <ThemedText type="subtitle">Iniciar sesión</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Ingresa tus credenciales para continuar
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.field}>
            <ThemedText type="smallBold">Email</ThemedText>
            <TextInput
              value={form.email}
              onChangeText={(email) => setForm((prev) => ({ ...prev, email }))}
              placeholder="tu@email.com"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              submitBehavior="submit"
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.background,
                  borderColor: focusedField === 'email' ? theme.primary : 'transparent',
                },
              ]}
            />
          </ThemedView>

          <ThemedView style={styles.field}>
            <ThemedText type="smallBold">Contraseña</ThemedText>
            <TextInput
              ref={passwordRef}
              value={form.password}
              onChangeText={(password) => setForm((prev) => ({ ...prev, password }))}
              placeholder="••••••••"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.background,
                  borderColor: focusedField === 'password' ? theme.primary : 'transparent',
                },
              ]}
            />
          </ThemedView>

          {form.error && (
            <ThemedText type="small" style={[styles.errorText, { color: errorColor }]}>
              {form.error}
            </ThemedText>
          )}

          <Pressable
            onPress={handleSubmit}
            disabled={form.isSubmitting}
            style={({ pressed }) => [
              styles.submitButton,
              { backgroundColor: theme.primary },
              (pressed || form.isSubmitting) && styles.submitButtonPressed,
            ]}>
            {form.isSubmitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <ThemedText type="smallBold" style={styles.submitButtonText}>
                Iniciar sesión
              </ThemedText>
            )}
          </Pressable>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  card: {
    width: '100%',
    maxWidth: MaxContentWidth / 2,
    borderRadius: Spacing.four,
    padding: Spacing.five,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  field: {
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  input: {
    borderRadius: Spacing.three,
    borderWidth: 2,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  errorText: {
    marginTop: -Spacing.two,
  },
  submitButton: {
    borderRadius: Spacing.five,
    paddingVertical: Spacing.three,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonPressed: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
  },
});
