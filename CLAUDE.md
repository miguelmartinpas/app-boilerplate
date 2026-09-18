# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm install          # install dependencies
npm start             # expo start — launches the dev server / Metro bundler
npm run android        # expo start --android
npm run ios            # expo start --ios
npm run web             # expo start --web
npm run lint             # expo lint (ESLint)
npm run reset-project     # moves current app/ to app-example/ and scaffolds a blank app/
```

There is no test runner configured in `package.json` (no `test` script, no Jest config). If asked to add tests, follow Expo's own guide rather than assuming a setup already exists.

## Architecture

This is an Expo (SDK 57) + Expo Router app using the **file-based routing** convention: every file under `src/app/` becomes a route, and `src/app/_layout.tsx` is the root layout for the whole tree.

### Routing and auth guard

- `src/app/_layout.tsx` — root layout. Wraps the tree in `AuthProvider` (see below) and Expo Router's `ThemeProvider` (light/dark based on `useColorScheme`), renders `AnimatedSplashOverlay`, then a `RootNavigator` that reads `useAuth()` and shows a full-screen spinner while the session is resolving. Once resolved, a `Stack` with two `Stack.Protected` branches shows either the `(app)` group (authenticated) or the `(public)` group + `login` (unauthenticated) — never mounts the wrong tab bar.
- `src/app/(app)/` — authenticated group. `_layout.tsx` renders a shared `SessionHeader` above `AppTabs`. Screens: `dashboard.tsx`, `home.tsx`, `explore.tsx`.
- `src/app/(public)/` — unauthenticated group (`_layout.tsx` renders `PublicTabs`), plus `src/app/login.tsx` as a sibling stack screen outside the group.
- `src/contexts/auth-context.tsx` — `AuthProvider`/`useAuth()`. Wraps Supabase Auth (`src/lib/supabase.ts`): tracks `isAuthenticated`/`isLoading`/`user`, exposes `login(email, password)`/`logout()`, and maps the Supabase user into `AuthUser` (`displayName` normalized from `user_metadata.display_name` → `full_name` → `name` → email; `avatarInitials` derived from it).
- `src/lib/supabase.ts` — Supabase client, using `AsyncStorage` for session persistence. Requires `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`, actual values in `.env.local`). **Known issue:** `expo start --web` crashes with "window is not defined" due to this client initializing during SSR — pre-existing since spec 04, needs its own fix.
- `src/components/app-tabs.tsx` / `public-tabs.tsx` — tab navigators using `expo-router/unstable-native-tabs` (native platform tab bar, not JS-rendered). Each has a `.web.tsx` counterpart (native tabs aren't available on web, so the web version uses `expo-router/ui`'s `Tabs`/`TabList`/`TabTrigger` instead) — check both when changing tab structure.
- Platform-specific files use Expo/Metro's `.web.tsx` extension resolution (e.g. `animated-icon.tsx` vs `animated-icon.web.tsx`, `use-color-scheme.ts` vs `use-color-scheme.web.ts`). When editing behavior that differs between native and web, check for a sibling platform file before assuming one implementation covers everything.

### Theming

- `src/constants/themes/` holds the actual theme definitions: `default.ts`, `corporate.ts`, `vibrant.ts`, `neo-mirai.ts`, each implementing the `AppTheme` shape from `types.ts` (`colors` + `fonts`). `index.ts` picks the active one via the `EXPO_PUBLIC_THEME` env var (`ThemeName`), falling back to `default`, and exports `Colors`/`ThemeFonts`.
- `src/constants/theme.ts` re-exports `Colors`/`ThemeFonts` from `themes/`, adds `Fonts` (platform-select, with `Fonts.web` reading CSS vars from `src/global.css`), `Spacing`, layout constants (`BottomTabInset`, `MaxContentWidth`), and a WCAG contrast helper (`getReadableTextColor`).
- Consumed through `src/hooks/use-theme.ts` (returns the resolved `Colors[light|dark]` object) and `src/hooks/use-color-scheme.ts`. `ThemedView`/`ThemedText` (`src/components/`) are the standard building blocks — they take a `type` prop keyed off `ThemeColor`/text variants rather than hardcoded colors, so new UI should extend those enums instead of inlining colors.

### Other conventions

- Path aliases (`tsconfig.json`): `@/*` → `src/*`, `@/assets/*` → `assets/*`.
- `experiments.typedRoutes` and `experiments.reactCompiler` are enabled in `app.json` — routes are typed (autocompleted/checked by `expo-router`) and the React Compiler is active, so avoid patterns that fight the compiler's assumptions (e.g. manual memoization workarounds) unless there's a proven need.
- Global CSS (`src/global.css`, imported from `theme.ts`) supplies web font variables referenced by `Fonts.web`.
- Work is done **spec-driven**: `specs/NN-slug.md` files (currently 01–07) are the contract for each feature, each built on its own `spec-NN-slug` branch. Use the `/spec` skill to draft a new one and `/spec-impl` to implement one — both read this file for project context, so keep it in sync with reality.

## Critical constraint

Per `AGENTS.md`, Expo's APIs have changed significantly. **Before writing or modifying any Expo-related code, consult the versioned docs at https://docs.expo.dev/versions/v57.0.0/** rather than relying on prior training knowledge of Expo — this repo pins `expo ~57.0.22` and related packages at matching `~57.x` versions.
