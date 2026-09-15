# 01 - Sistema de diseño / theming

## Header

**Estado:** Draft
**Dependencias:** Ninguna (primera spec del repo)
**Fecha:** 2026-09-14

**Objetivo:** Crear un sistema de theming extensible y sobreescribible (colores primario/secundario/terciario + fonts) que conviva con la estructura actual de `Colors`/`Fonts` del boilerplate, con el theme activo seleccionado por variable de entorno y 3 themes de ejemplo (`default`, `corporate`, `vibrant`) que demuestren el mecanismo de extensión por spread/merge.

## Scope

**Incluye:**

- Tipos `AppTheme`, `ThemeColorTokens` (con las claves actuales `text`, `background`, `backgroundElement`, `backgroundSelected`, `textSecondary` + nuevas `primary`, `secondary`, `tertiary`) y `ThemeFontTokens` (`heading`, `body`).
- 3 themes de ejemplo en `src/constants/themes/`: `default` (theme base, con los colores actuales del boilerplate + valores placeholder para primary/secondary/tertiary), `corporate` y `vibrant` (cada uno extiende `default` por spread, sobreescribiendo solo `primary`/`secondary`/`tertiary` en light y dark, y sus propias `fonts.heading`/`fonts.body`).
- Mecanismo de selección: variable de entorno `EXPO_PUBLIC_THEME` (`default` | `corporate` | `vibrant`), con fallback a `default` si no está definida o no coincide con ningún theme registrado.
- `src/constants/theme.ts` actualizado como fachada: sigue exportando `Colors`, `Fonts` (fuentes de sistema sin cambios, usadas para `code`), `Spacing`, `BottomTabInset`, `MaxContentWidth`, `ThemeColor`, y añade `ThemeFonts` (heading/body del theme activo) — sin romper ningún import existente (`@/constants/theme`).
- `ThemedText` actualizado para aplicar `ThemeFonts.heading` en `title`/`subtitle` y `ThemeFonts.body` en `default`/`small`/`smallBold`/`link`/`linkPrimary`. La variante `code` sigue usando `Fonts.mono` (fuente de sistema fija, no theming).
- Documentación de la env var (`.env.example` con `EXPO_PUBLIC_THEME=default`).

**No incluye:**

- Selector de theme visible al usuario ni cambio de theme en runtime — el theme activo es fijo por `.env`/build.
- Persistencia de preferencia de usuario (AsyncStorage u otro storage).
- Fuentes custom vía `expo-font`/archivos `.ttf` — los themes solo varían entre fuentes de sistema (`Platform.select`).
- Pantallas de Login y Dashboard — van en specs separadas que consumirán este sistema.
- Cambios al mecanismo de light/dark (`useColorScheme`/`use-color-scheme.ts`) — se mantiene igual; cada theme simplemente define su propio par light/dark.
- Rediseño visual de `app-tabs`, `collapsible.tsx` u otros componentes — solo deben seguir funcionando con las claves de color existentes, sin cambios de comportamiento.

## Modelo de datos

**`src/constants/themes/types.ts`**

```ts
export type ThemeColorTokens = {
  text: string;
  background: string;
  backgroundElement: string;
  backgroundSelected: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  tertiary: string;
};

export type ThemeFontTokens = {
  heading: string;
  body: string;
};

export type AppTheme = {
  name: 'default' | 'corporate' | 'vibrant';
  colors: {
    light: ThemeColorTokens;
    dark: ThemeColorTokens;
  };
  fonts: ThemeFontTokens;
};
```

**`src/constants/themes/default.ts`** — theme base completo (única fuente de los valores heredados por los demás):

```ts
export const defaultTheme: AppTheme = {
  name: 'default',
  colors: {
    light: { text: '#000000', background: '#ffffff', backgroundElement: '#F0F0F3', backgroundSelected: '#E0E1E6', textSecondary: '#60646C', primary: '#3c87f7', secondary: '#6C63FF', tertiary: '#00BFA6' },
    dark:  { text: '#ffffff', background: '#000000', backgroundElement: '#212225', backgroundSelected: '#2E3135', textSecondary: '#B0B4BA', primary: '#5B9DFF', secondary: '#8A82FF', tertiary: '#33D9C1' },
  },
  fonts: {
    heading: Platform.select({ ios: 'system-ui', default: 'normal', web: 'var(--font-display)' }),
    body: Platform.select({ ios: 'system-ui', default: 'normal', web: 'var(--font-display)' }),
  },
};
```

**`src/constants/themes/corporate.ts`** y **`vibrant.ts`** — mismo patrón, extienden `defaultTheme` por spread y solo sobreescriben `primary`/`secondary`/`tertiary` (light y dark) y `fonts`:

```ts
export const corporateTheme: AppTheme = {
  ...defaultTheme,
  name: 'corporate',
  colors: {
    light: { ...defaultTheme.colors.light, primary: '#0B5FFF', secondary: '#1B3B6F', tertiary: '#C9A227' },
    dark:  { ...defaultTheme.colors.dark,  primary: '#3D82FF', secondary: '#5577AA', tertiary: '#E0BB4A' },
  },
  fonts: {
    heading: Platform.select({ ios: 'ui-serif', default: 'serif', web: 'var(--font-serif)' }),
    body: defaultTheme.fonts.body,
  },
};
```

(`vibrant.ts` sigue el mismo patrón con su propia paleta y `fonts.heading` en `ui-rounded`/`rounded`.)

**`src/constants/themes/index.ts`** — registro y resolución del theme activo:

```ts
const themes = { default: defaultTheme, corporate: corporateTheme, vibrant: vibrantTheme } as const;
export type ThemeName = keyof typeof themes;

const envTheme = process.env.EXPO_PUBLIC_THEME as ThemeName | undefined;
export const activeTheme: AppTheme = themes[envTheme ?? 'default'] ?? themes.default;

export const Colors = activeTheme.colors;
export const ThemeFonts = activeTheme.fonts;
```

**`src/constants/theme.ts`** (fachada, sin romper imports existentes): re-exporta `Colors` y `ThemeFonts` desde `./themes`, mantiene `Fonts` (system fonts para `code`), `Spacing`, `BottomTabInset`, `MaxContentWidth` y `ThemeColor` tal cual están hoy.

## Plan de implementación

1. Crear `src/constants/themes/types.ts` con los tipos `AppTheme`, `ThemeColorTokens` y `ThemeFontTokens`.
2. Crear `src/constants/themes/default.ts` con `defaultTheme`: mismos valores de color que hoy tiene `Colors.light`/`Colors.dark`, más los nuevos `primary`/`secondary`/`tertiary`, y `fonts.heading`/`fonts.body` basados en las fuentes de sistema actuales.
3. Crear `src/constants/themes/corporate.ts` y `src/constants/themes/vibrant.ts`, cada uno extendiendo `defaultTheme` por spread y sobreescribiendo solo `primary`/`secondary`/`tertiary` (light y dark) y `fonts`.
4. Crear `src/constants/themes/index.ts`: registro `themes` (`default`/`corporate`/`vibrant`), resolución de `activeTheme` según `process.env.EXPO_PUBLIC_THEME` con fallback a `default`, y export de `Colors`/`ThemeFonts` del theme activo.
5. Actualizar `src/constants/theme.ts` para re-exportar `Colors` y `ThemeFonts` desde `./themes/index.ts`, dejando `Fonts`, `Spacing`, `BottomTabInset`, `MaxContentWidth` y `ThemeColor` intactos. El sistema sigue funcionando igual que antes en este punto (mismas rutas de import, mismas claves).
6. Actualizar `src/components/themed-text.tsx` para aplicar `ThemeFonts.heading` en las variantes `title`/`subtitle` y `ThemeFonts.body` en `default`/`small`/`smallBold`/`link`/`linkPrimary`, dejando `code` con `Fonts.mono` sin cambios.
7. Crear `.env.example` en la raíz con `EXPO_PUBLIC_THEME=default` y un comentario indicando los valores válidos (`default` | `corporate` | `vibrant`).
8. Verificación manual: correr `npm run lint`, y arrancar la app (`npm start`) tres veces cambiando `EXPO_PUBLIC_THEME` en `.env` a `default`, `corporate` y `vibrant`, confirmando visualmente que los colores `primary`/`secondary`/`tertiary` y las fonts de título cambian, y que las claves existentes (`text`, `background`, etc.) y las pantallas actuales (`index.tsx`, `explore.tsx`) siguen funcionando sin errores.

## Criterios de aceptación

- [ ] Existen los archivos `src/constants/themes/types.ts`, `default.ts`, `corporate.ts`, `vibrant.ts` e `index.ts`.
- [ ] `AppTheme` define `name`, `colors.light`, `colors.dark` (con `text`, `background`, `backgroundElement`, `backgroundSelected`, `textSecondary`, `primary`, `secondary`, `tertiary`) y `fonts.heading`/`fonts.body`.
- [ ] `corporateTheme` y `vibrantTheme` reutilizan `defaultTheme` por spread y solo redefinen `primary`/`secondary`/`tertiary` y `fonts` — no duplican `text`/`background`/`backgroundElement`/`backgroundSelected`/`textSecondary`.
- [ ] Con `EXPO_PUBLIC_THEME` sin definir, o con un valor no reconocido, la app usa `defaultTheme` sin lanzar error.
- [ ] Con `EXPO_PUBLIC_THEME=corporate` y `EXPO_PUBLIC_THEME=vibrant`, `Colors.light.primary`/`secondary`/`tertiary` y `ThemeFonts.heading`/`body` reflejan los valores del theme correspondiente.
- [ ] `src/constants/theme.ts` sigue exportando `Colors`, `Fonts`, `Spacing`, `BottomTabInset`, `MaxContentWidth`, `ThemeColor` sin cambiar su forma; ningún import existente (`use-theme.ts`, `themed-view.tsx`, `themed-text.tsx`, `collapsible.tsx`, `explore.tsx`) se modifica en su ruta.
- [ ] `ThemedText` con `type="title"` o `type="subtitle"` usa `ThemeFonts.heading`; con `type="default"`, `"small"`, `"smallBold"`, `"link"` o `"linkPrimary"` usa `ThemeFonts.body`; con `type="code"` sigue usando `Fonts.mono` sin cambios.
- [ ] `npm run lint` pasa sin errores nuevos.
- [ ] La app arranca (`npm start`) y renderiza `index.tsx`/`explore.tsx` sin errores con cada uno de los 3 valores de `EXPO_PUBLIC_THEME`.
- [ ] Existe `.env.example` con `EXPO_PUBLIC_THEME=default` y comentario de valores válidos.

## Decisiones tomadas y descartadas

1. **Extender el sistema `Colors`/`Fonts` existente** en vez de reemplazarlo. *Por qué:* `ThemedView`, `ThemedText`, `collapsible.tsx` y `explore.tsx` ya dependen de esa forma; reemplazarla obligaría a tocar código fuera de esta spec.
2. **Theme (marca) independiente de light/dark**, cada theme define su propio par `light`/`dark`, en vez de fusionar ambos conceptos en uno. *Por qué:* permite combinar cualquier marca con cualquier modo de color sin acoplarlos.
3. **Extensión por spread/merge de objetos planos** (opción a) en vez de un sistema de tokens en capas o un `Context Provider` para override local. *Por qué:* es suficiente para 3 themes de ejemplo y no añade dependencias ni complejidad de runtime.
4. **Selección fija por variable de entorno (`EXPO_PUBLIC_THEME`)** en vez de selector visible al usuario. *Por qué:* decisión explícita del usuario — no se necesita UI de cambio de theme en runtime ni persistencia en esta spec.
5. **Fonts limitadas a fuentes de sistema (`Platform.select`)**, se descarta usar fuentes custom vía `expo-font`. *Por qué:* evita expandir el alcance con carga de assets `.ttf`; queda abierto para una spec futura si se necesitan fuentes de marca reales.
6. **`useTheme()` mantiene su forma actual** (objeto plano de colores); se descarta cambiarla a `{colors, fonts}`. *Por qué:* no romper los consumidores actuales. Los fonts del theme se exponen como constante aparte (`ThemeFonts`) porque no dependen del color scheme y no son reactivos (el theme es fijo en build-time).
7. **`theme.ts` se mantiene como fachada de re-exports**, no se elimina ni se mueve. *Por qué:* ninguna ruta de import existente en el repo debe romperse.

## Riesgos identificados

- **`EXPO_PUBLIC_THEME` se resuelve en build-time** (Metro la inlinea), no es reactiva en runtime. Si en el futuro se quiere un selector de theme en vivo, este mecanismo de resolución deberá rehacerse (ej. moverlo a un Context/estado) — no es una extensión trivial del diseño actual.
- **Los colores `primary`/`secondary`/`tertiary` de los 3 themes son valores placeholder** inventados para probar el mecanismo, no son una paleta de marca real — deberán reemplazarse cuando exista una guía de marca definitiva.
