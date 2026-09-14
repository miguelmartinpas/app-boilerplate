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

- `src/app/_layout.tsx` — root layout. Wraps the app in Expo Router's `ThemeProvider` (light/dark based on `useColorScheme`) and renders `AnimatedSplashOverlay` + `AppTabs`.
- `src/components/app-tabs.tsx` — defines the tab navigator using `expo-router/unstable-native-tabs` (native platform tab bar, not a JS-rendered one). It has a `.web.tsx` counterpart (`app-tabs.web.tsx`) since native tabs aren't available on web — check both when changing tab structure.
- `src/app/index.tsx`, `src/app/explore.tsx` — the two tab screens.
- Platform-specific files use Expo/Metro's `.web.tsx` extension resolution (e.g. `animated-icon.tsx` vs `animated-icon.web.tsx`, `use-color-scheme.ts` vs `use-color-scheme.web.ts`). When editing behavior that differs between native and web, check for a sibling platform file before assuming one implementation covers everything.
- Theming is centralized in `src/constants/theme.ts` (`Colors`, `Fonts`, `Spacing`, layout constants) and consumed through `src/hooks/use-theme.ts` (returns the resolved `Colors[light|dark]` object) and `src/hooks/use-color-scheme.ts`. `ThemedView`/`ThemedText` (`src/components/`) are the standard building blocks — they take a `type` prop keyed off `ThemeColor`/text variants rather than hardcoded colors, so new UI should extend those enums instead of inlining colors.
- Path aliases (`tsconfig.json`): `@/*` → `src/*`, `@/assets/*` → `assets/*`.
- `experiments.typedRoutes` and `experiments.reactCompiler` are enabled in `app.json` — routes are typed (autocompleted/checked by `expo-router`) and the React Compiler is active, so avoid patterns that fight the compiler's assumptions (e.g. manual memoization workarounds) unless there's a proven need.
- Global CSS (`src/global.css`, imported from `theme.ts`) supplies web font variables referenced by `Fonts.web`.

## Critical constraint

Per `AGENTS.md`, Expo's APIs have changed significantly. **Before writing or modifying any Expo-related code, consult the versioned docs at https://docs.expo.dev/versions/v57.0.0/** rather than relying on prior training knowledge of Expo — this repo pins `expo ~57.0.22` and related packages at matching `~57.x` versions.
