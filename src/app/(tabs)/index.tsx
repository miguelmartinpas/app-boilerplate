import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { SFSymbol } from 'sf-symbols-typescript';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing, ThemeFonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type HeroContent = { eyebrow: string; title: string; subtitle: string };
type FeatureHighlight = { id: string; title: string; description: string; icon: string };

function relativeLuminance(hex: string): number {
  const channels = [0, 2, 4].map((i) => parseInt(hex.slice(i + 1, i + 3), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(luminanceA: number, luminanceB: number): number {
  const [lighter, darker] = luminanceA > luminanceB ? [luminanceA, luminanceB] : [luminanceB, luminanceA];
  return (lighter + 0.05) / (darker + 0.05);
}

// Some theme `primary` colors are too light for white text to hit WCAG contrast; pick whichever of black/white contrasts more against it.
function getReadableTextColor(backgroundHex: string): string {
  const backgroundLuminance = relativeLuminance(backgroundHex);
  const contrastWithBlack = contrastRatio(backgroundLuminance, 0);
  const contrastWithWhite = contrastRatio(backgroundLuminance, 1);
  return contrastWithBlack > contrastWithWhite ? '#000000' : '#ffffff';
}

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

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const onPrimaryColor = getReadableTextColor(theme.primary);

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
            onPress={() => router.push('/login')}
            style={({ pressed }) => [
              styles.loginButton,
              { backgroundColor: theme.primary },
              pressed && styles.loginButtonPressed,
            ]}>
            <ThemedText type="smallBold" style={{ color: onPrimaryColor }}>
              Iniciar sesión
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
  loginButton: {
    alignSelf: 'stretch',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonPressed: {
    opacity: 0.7,
  },
});
