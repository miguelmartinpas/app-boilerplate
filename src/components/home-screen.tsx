import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { SFSymbol } from 'sf-symbols-typescript';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  BottomTabInset,
  getReadableTextColor,
  MaxContentWidth,
  Spacing,
  ThemeFonts,
} from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

type HeroContent = { eyebrow: string; title: string; subtitle: string };
type FeatureHighlight = { id: string; title: string; description: string; icon: string };

const HERO: HeroContent = {
  eyebrow: 'App Boilerplate',
  title: 'Construye rápido, con estilo propio',
  subtitle: 'Un punto de partida con theming extensible, dashboard y login ya resueltos.',
};

const FEATURES: FeatureHighlight[] = [
  {
    id: 'theming',
    title: 'Theming extensible',
    description: 'Colores y fonts por theme, sobreescribibles sin tocar el core.',
    icon: 'paintpalette.fill',
  },
  {
    id: 'auth',
    title: 'Auth lista',
    description: 'Login persistente y protegido, listo para conectar a un backend real.',
    icon: 'lock.shield.fill',
  },
  {
    id: 'dashboard',
    title: 'Dashboard incluido',
    description: 'Stat cards y actividad reciente ya armados.',
    icon: 'chart.bar.fill',
  },
];

export function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const onPrimaryColor = getReadableTextColor(theme.primary);

  // Logged in, Home has no session header, so its CTA doubles as the logout control.
  const cta = isAuthenticated
    ? { label: 'Cerrar sesión', onPress: () => logout() }
    : { label: 'Iniciar sesión', onPress: () => router.push('/login') };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedView style={styles.hero}>
            <ThemedText type="smallBold" themeColor="tertiary" style={styles.eyebrow}>
              {HERO.eyebrow}
            </ThemedText>
            <ThemedText type="title" style={styles.heroTitle}>
              {HERO.title}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.heroSubtitle}>
              {HERO.subtitle}
            </ThemedText>
          </ThemedView>

          <View style={styles.features}>
            {FEATURES.map((feature) => (
              <ThemedView key={feature.id} type="backgroundElement" style={styles.featureCard}>
                <View style={[styles.iconBadge, { backgroundColor: theme.primary }]}>
                  <SymbolView name={feature.icon as SFSymbol} size={20} tintColor={onPrimaryColor} weight="semibold" />
                </View>
                <ThemedText style={styles.featureTitle}>{feature.title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {feature.description}
                </ThemedText>
              </ThemedView>
            ))}
          </View>

          <Pressable
            onPress={cta.onPress}
            style={({ pressed }) => [
              styles.ctaButton,
              { backgroundColor: theme.primary },
              pressed && styles.ctaButtonPressed,
            ]}>
            <ThemedText type="smallBold" style={{ color: onPrimaryColor }}>
              {cta.label}
            </ThemedText>
          </Pressable>
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  safeArea: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.five,
  },
  hero: {
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 36,
    lineHeight: 42,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  features: {
    gap: Spacing.three,
    backgroundColor: 'transparent',
  },
  featureCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  featureTitle: {
    fontFamily: ThemeFonts.heading,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaButton: {
    alignSelf: 'stretch',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonPressed: {
    opacity: 0.7,
  },
});
