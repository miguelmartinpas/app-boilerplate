# 05 - Theme neo-mirai y pantalla Home

## Header

**Estado:** Implemented
**Dependencias:** `01-design-system-theming` (añade un 4º theme + corrige un color hardcodeado detectado), `02-dashboard-screen` y `03-login-screen` (se verifican/adaptan visualmente al nuevo theme, sin cambios estructurales esperados)
**Fecha:** 2026-09-14

**Objetivo:** Añadir el theme `neo-mirai` (paleta cálida dorado/naranja sobre papel, tipografía Chakra Petch) al sistema de theming como theme activo por defecto, corregir un color hardcodeado que impedía que Login y Dashboard heredaran correctamente el theme, y rediseñar la pantalla Home (`index.tsx`) con datos mock usando Impeccable en ese mismo lenguaje visual.

## Scope

**Incluye:**

- Nuevo theme `src/constants/themes/neo-mirai.ts`: extiende `defaultTheme` por spread, con colores light/dark derivados de la paleta real del sitio de referencia (convertidos de OKLCH a hex) y `fonts.heading`/`fonts.body` = Chakra Petch.
- Registro de `neo-mirai` en `src/constants/themes/index.ts` (junto a `default`/`corporate`/`vibrant`).
- `.env.local`: `EXPO_PUBLIC_THEME=neo-mirai` como nuevo default activo.
- Instalación de `expo-font` + `@expo-google-fonts/chakra-petch`.
- Carga de la fuente Chakra Petch (`useFonts`) integrada con el flujo de splash existente (`SplashScreen.preventAutoHideAsync()`/`AnimatedSplashOverlay`) en `src/app/_layout.tsx` — no se muestra contenido con la fuente equivocada mientras carga.
- Fix en `src/components/themed-text.tsx`: eliminar el color hardcodeado `#3c87f7` de la variante `linkPrimary` (hoy sobreescribe cualquier color de theme) y hacer que use `Colors.primary` del theme activo por defecto.
- Rediseño de `src/app/index.tsx` (Home): estructura tipo landing simple (hero + destacados/features con datos mock + CTA que reutiliza el botón "Iniciar sesión" ya existente de la spec `03`), con la estética neo-mirai (colores + Chakra Petch en headings).
- Paso de revisión final con **Impeccable** sobre Home, y verificación visual de que Login/Dashboard se ven coherentes con neo-mirai (sin necesidad de tocar su código si el theming está bien propagado).

**No incluye:**

- Zen Old Mincho ni Azeret Mono — solo se carga Chakra Petch.
- Contenido literal del sitio de referencia (agenda, speakers, tickets) — es solo inspiración de paleta/tipografía; el contenido de Home sigue siendo genérico de boilerplate.
- Cambios a la lógica de autenticación (specs `03`/`04`) — Home solo reutiliza el botón de login existente.
- Eliminar los themes `default`/`corporate`/`vibrant` — siguen existiendo, solo cambia cuál es el default activo.
- Cambio de theme en vivo desde la UI — sigue fijo por `.env`, igual que en la spec `01`.

## Modelo de datos

**`src/constants/themes/neo-mirai.ts`**

```ts
export const neoMiraiTheme: AppTheme = {
  ...defaultTheme,
  name: 'neo-mirai',
  colors: {
    light: {
      text: '#191001',
      background: '#F8E9D2',
      backgroundElement: '#F2DEC1',
      backgroundSelected: '#E3C5A0',
      textSecondary: '#7B6C54',
      primary: '#CC8800',
      secondary: '#E55900',
      tertiary: '#07251C',
    },
    dark: {
      text: '#FCF4E6',
      background: '#001411',
      backgroundElement: '#07251C',
      backgroundSelected: '#12352B',
      textSecondary: '#A49680',
      primary: '#E7A300',
      secondary: '#E55900',
      tertiary: '#E3C5A0',
    },
  },
  fonts: {
    heading: 'ChakraPetch_600SemiBold',
    body: 'ChakraPetch_400Regular',
  },
};
```

(`AppTheme['name']` en `types.ts` se extiende a `'default' | 'corporate' | 'vibrant' | 'neo-mirai'`.)

**`src/constants/themes/index.ts`** — se añade al registro:

```ts
const themes = { default: defaultTheme, corporate: corporateTheme, vibrant: vibrantTheme, 'neo-mirai': neoMiraiTheme } as const;
```

**`src/app/_layout.tsx`** — carga de fuente antes de renderizar:

```ts
import { useFonts, ChakraPetch_400Regular, ChakraPetch_600SemiBold } from '@expo-google-fonts/chakra-petch';

export default function TabLayout() {
  const [fontsLoaded] = useFonts({ ChakraPetch_400Regular, ChakraPetch_600SemiBold });
  const colorScheme = useColorScheme();

  if (!fontsLoaded) return null; // el splash (preventAutoHideAsync) sigue visible

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
```

**`src/components/themed-text.tsx`** — fix del color hardcodeado:

```ts
const resolvedThemeColor = themeColor ?? (type === 'linkPrimary' ? 'primary' : 'text');
// ...
<Text style={[{ color: theme[resolvedThemeColor] }, /* ...variantes... */]} />

const styles = StyleSheet.create({
  // ...
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    // sin `color` fijo: ahora lo aporta theme.primary
  },
});
```

**`src/app/index.tsx`** (Home) — contenido mock:

```ts
type HeroContent = { eyebrow: string; title: string; subtitle: string };
type FeatureHighlight = { id: string; title: string; description: string; icon: string };

const HERO: HeroContent = {
  eyebrow: 'App Boilerplate',
  title: 'Construye rápido, con estilo propio',
  subtitle: 'Un punto de partida con theming extensible, dashboard y login ya resueltos.',
};

const FEATURES: FeatureHighlight[] = [
  { id: 'theming', title: 'Theming extensible', description: 'Colores y fonts por theme, sobreescribibles sin tocar el core.', icon: 'paintpalette.fill' },
  { id: 'auth', title: 'Auth lista', description: 'Login persistente y protegido, listo para conectar a un backend real.', icon: 'lock.shield.fill' },
  { id: 'dashboard', title: 'Dashboard incluido', description: 'Stat cards y actividad reciente ya armados.', icon: 'chart.bar.fill' },
];
```

## Plan de implementación

1. Instalar `expo-font` y `@expo-google-fonts/chakra-petch`.
2. Extender `src/constants/themes/types.ts`: agregar `'neo-mirai'` al union de `AppTheme['name']`.
3. Crear `src/constants/themes/neo-mirai.ts` con los colores/fonts definidos en el modelo de datos.
4. Registrar `neo-mirai` en `src/constants/themes/index.ts`.
5. Actualizar `.env.local`: `EXPO_PUBLIC_THEME=neo-mirai`.
6. Actualizar `src/app/_layout.tsx` para cargar la fuente Chakra Petch vía `useFonts` antes de renderizar `AppTabs` (el splash se mantiene visible mientras carga).
7. Corregir `src/components/themed-text.tsx`: quitar el color hardcodeado de `linkPrimary` y resolver el color de theme correctamente (`primary` por defecto en esa variante).
8. Rediseñar `src/app/index.tsx`: hero + features (`HERO`, `FEATURES`) + el botón "Iniciar sesión" ya existente, usando `ThemedView`/`ThemedText` con `ThemeFonts` en los headings.
9. Verificación manual: `npm run lint`, `npm start`; confirmar visualmente que Home, Login y Dashboard reflejan la paleta neo-mirai y que los headings usan Chakra Petch; probar temporalmente con otro `EXPO_PUBLIC_THEME` para validar que `linkPrimary` ya no queda hardcodeado en azul.
10. Revisión final con el skill **Impeccable** sobre Home, aplicando los ajustes visuales que sugiera.

## Criterios de aceptación

- [ ] Existe `src/constants/themes/neo-mirai.ts` con los colores light/dark y fonts definidos; `AppTheme['name']` incluye `'neo-mirai'`.
- [ ] `neo-mirai` está registrado en `src/constants/themes/index.ts` junto a `default`/`corporate`/`vibrant`.
- [ ] `.env.local` tiene `EXPO_PUBLIC_THEME=neo-mirai`; al arrancar la app sin cambiar esa variable, `Colors.light.primary` es `#CC8800`.
- [ ] La app no renderiza contenido hasta que `useFonts` resuelve la carga de Chakra Petch (sin flash de fuente de sistema en los headings).
- [ ] `ThemedText` con `type="title"`/`"subtitle"` usa `ChakraPetch_600SemiBold`; `type="default"` usa `ChakraPetch_400Regular` cuando el theme activo es `neo-mirai`.
- [ ] `linkPrimary` ya no tiene un color hardcodeado: con `EXPO_PUBLIC_THEME=neo-mirai` se ve en `#CC8800` (o `#E7A300` en dark), y cambiando a otro theme (ej. `corporate`) cambia de color acorde a ese theme.
- [ ] `src/app/index.tsx` (Home) muestra el hero, las 3 features mock y el botón "Iniciar sesión" existente, con la paleta y tipografía de `neo-mirai`.
- [ ] Login (`login.tsx`) y Dashboard (`dashboard.tsx`, stat cards, avatar) se ven con la paleta neo-mirai sin necesitar cambios de código más allá del fix de `linkPrimary`.
- [ ] `npm run lint` pasa sin errores nuevos.
- [ ] Home fue revisada con el skill Impeccable y los ajustes sugeridos (si los hubo) fueron aplicados.

## Decisiones tomadas y descartadas

1. **Colores convertidos de OKLCH a hex** (fórmula estándar CSS Color 4) en vez de usar `oklch()` directamente en los estilos. *Por qué:* React Native no soporta `oklch()` de forma confiable en todas las plataformas nativas; hex es universalmente soportado.
2. **Solo se carga Chakra Petch**, se descartan Zen Old Mincho y Azeret Mono. *Por qué:* decisión explícita del usuario; son acentos secundarios en el sitio original, no esenciales para un boilerplate genérico.
3. **`neo-mirai` como theme activo por defecto**. *Por qué:* decisión explícita del usuario — "adaptar" Login/Dashboard implica verlos así al abrir la app, no solo tenerlo disponible como opción.
4. **Home = rediseño de `index.tsx` existente**, no una ruta nueva. *Por qué:* decisión explícita del usuario; evita duplicar la pantalla de entrada y reutiliza el botón de login de la spec `03`.
5. **Contenido de Home genérico** (hero + features), no réplica literal del sitio de referencia (agenda/speakers/tickets). *Por qué:* el sitio es una landing de una conferencia ficticia; solo se usa como referencia de paleta y tipografía, no de contenido.
6. **Fix del color hardcodeado en `linkPrimary` incluido en esta spec**, aunque no se pidió explícitamente. *Por qué:* sin este fix, "adaptar Login/Dashboard a los colores" sería falso — el link seguiría en azul fijo sin importar el theme activo.
7. **Se reabre la decisión de la spec `01` de no usar fuentes custom.** *Por qué:* decisión explícita del usuario en esta spec; se acepta el costo de `expo-font`/carga de un asset, acotado a un solo paquete de fuente.

## Riesgos identificados

- **Los hex convertidos de OKLCH son una aproximación matemática**, no una lectura directa de un valor ya en hex — el resultado visual debe compararse contra la referencia durante la implementación y ajustarse si no se percibe igual en pantalla.
- **Doble splash visual.** Cargar una fuente custom antes de renderizar puede alargar el tiempo de splash percibido; si `AnimatedSplashOverlay` tiene su propia animación de tiempo fijo, hay que verificar que no queden dos splashes secuenciales generando un salto visual extraño.
- **Otros colores hardcodeados no detectados.** Si `dashboard.tsx`/`login.tsx` tienen algún otro color fijo fuera de `linkPrimary`, no se verán "adaptados" a neo-mirai — el paso 9 de verificación manual debe revisar visualmente cada pantalla, no asumir que ese era el único caso.
