# 06 - Navegación por sesión: grupos (public) y (app)

## Header

**Estado:** Implemented
**Dependencias:**

- `02-dashboard-screen` (su `DashboardHeader` se promueve a `SessionHeader` compartido y su
  `dashboard-header-skeleton.tsx` se elimina; el resto del Dashboard no cambia)
- `03-login-screen` (reemplaza su guard imperativo `useEffect`+`router.replace` por guards
  declarativos, y añade el botón "Cancelar" que esa spec no tenía)
- `04-supabase-auth` (consume `useAuth()` / `isLoading` tal cual; la lógica de Supabase no se toca)
- `05-neo-mirai-theme-home` (la UI de Home que rediseñó se extrae a un componente reutilizable
  y su CTA pasa a ser condicional según sesión)

**Fecha:** 2026-09-15

**Objetivo:** Reorganizar la navegación en dos grupos de rutas controlados por `Stack.Protected` —
`(public)` con Home como entrada por defecto y una tab bar de una sola entrada, y `(app)` con
Dashboard, Explore y Home más una cabecera de sesión compartida — de modo que iniciar sesión lleve
a Dashboard, "Cancelar" en Login devuelva a Home, y Dashboard/Explore sean inalcanzables sin sesión.

## Scope

**Incluye:**

- **Reestructuración de rutas en dos grupos** bajo `src/app/`:
    - `(public)/` — accesible solo sin sesión (`guard={!isAuthenticated}`).
    - `(app)/` — accesible solo con sesión (`guard={isAuthenticated}`).
    - `login.tsx` se mantiene fuera de ambos grupos, con `guard={!isAuthenticated}`.
- `src/app/_layout.tsx`: declara los `Stack.Protected` con esos guards y muestra un **spinner a
  pantalla completa** (fondo del theme + `ActivityIndicator`) mientras `isLoading` de `useAuth()`
  no haya resuelto, para que nunca se monte la tab bar equivocada.
- `src/app/(public)/_layout.tsx`: tab bar de **una sola entrada [Home]**.
- `src/app/(public)/index.tsx` (URL `/`): renderiza `<HomeScreen />`. Es la pantalla de entrada
  por defecto de la app sin sesión.
- `src/app/(app)/_layout.tsx`: tab bar **[Home][Dashboard][Explore]**, con
  `unstable_settings = { anchor: 'dashboard' }` para que el destino por defecto del grupo siga
  siendo Dashboard, y renderiza `<SessionHeader />` **una sola vez** encima del navegador de tabs,
  excluyéndola cuando la ruta activa es Home.
- `src/app/(app)/dashboard.tsx` (movido desde `(tabs)/dashboard.tsx`): pierde su guard
  (`useEffect` + `router.replace('/login')`), su `ActivityIndicator` de sesión y su bloque de
  cabecera; su contenido empieza directamente en las stat cards.
- `src/app/(app)/explore.tsx` (movido desde `(tabs)/explore.tsx`): **sin cambios de contenido**,
  hereda la cabecera del layout del grupo.
- `src/app/(app)/home.tsx` (URL `/home`): renderiza `<HomeScreen />`, es el destino del tab Home
  estando logado.
- `src/components/home-screen.tsx` (nuevo): la UI de Home de la spec `05` extraída tal cual
  (hero, 3 features mock, CTA), con el **CTA condicional**:
    - sin sesión → "Iniciar sesión", navega a `/login`;
    - con sesión → "Cerrar sesión", llama a `logout()` (la vuelta a Home la hace el guard).
- `src/components/session-header.tsx` (nuevo, **promovido** desde
  `src/components/dashboard/dashboard-header.tsx`): avatar + `displayName` + email + botón
  "Cerrar sesión", sin diálogo de confirmación.
- Dos configuraciones de tab bar, cada una con su variante web (`.web.tsx`) por la resolución de
  plataforma que ya usa el proyecto: la del grupo público con solo Home, y la del grupo logado con
  Home/Dashboard/Explore.
- `src/app/login.tsx`: nuevo botón **"Cancelar"** (secundario, debajo del submit) que hace
  `router.replace('/')` siempre y queda deshabilitado mientras `isSubmitting`. Se eliminan el
  `useEffect` que redirigía a `/dashboard` con sesión ya restaurada y el `router.replace('/dashboard')`
  posterior al login: ambos los cubre el guard.
- **Eliminación** de `src/app/(tabs)/` (layout + index), de
  `src/components/dashboard/dashboard-header.tsx` y de
  `src/components/dashboard/dashboard-header-skeleton.tsx`.
- Ajuste de espaciado en web para que la barra flotante de la tab list no solape la cabecera de
  sesión (misma implementación de cabecera en nativo y web).
- Paso final de revisión con **Impeccable** sobre las superficies que cambian visualmente:
  `SessionHeader`, Login con "Cancelar" y Home en estado logado.

**No incluye:**

- Cualquier cambio en la lógica de autenticación de la spec `04`: `auth-context.tsx`,
  `src/lib/supabase.ts`, sign-up, refresh o expiración de sesión se quedan intactos.
- Cambios de contenido en Dashboard (stat cards, actividad reciente, `useDashboardData`) ni en
  Explore, más allá de mover el archivo y quitar el bloque de cabecera del Dashboard.
- Cambios de paleta o tipografía de la spec `05`: la UI de Home se mueve a un componente, no se
  rediseña.
- Diálogo de confirmación al cerrar sesión.
- Skeleton de la cabecera de sesión: se elimina, no se sustituye.
- Protección por roles o permisos — el único criterio es "hay sesión" / "no hay sesión".
- Redirects o canonicalización entre las dos URLs de Home (`/` y `/home`): conviven tal cual.
- Arreglar el bug preexistente de SSR en web (`ReferenceError: window is not defined` con
  `web.output: "static"`, heredado de la spec `04`) — sigue siendo material para su propia spec.
- Tests automatizados y cambio de theme en vivo desde la UI.

## Modelo de datos

No hay tipos ni persistencia nuevos. Se fijan las estructuras de ruta y de componentes:

**`src/app/_layout.tsx`** — los guards viven en un componente hijo porque `useAuth()` solo
funciona dentro de `AuthProvider`:

```tsx
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

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const theme = useTheme();

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
```

**`src/app/(public)/_layout.tsx`**

```tsx
export default function PublicLayout() {
  return <PublicTabs />;
}
```

**`src/app/(app)/_layout.tsx`** — `anchor` fija Dashboard como destino por defecto del grupo, y
`usePathname()` excluye la cabecera en Home:

```tsx
export const unstable_settings = { anchor: 'dashboard' };

export default function AppLayout() {
  const pathname = usePathname();
  const showSessionHeader = pathname !== '/home';

  return (
    <ThemedView style={styles.container}>
      {showSessionHeader && <SessionHeader />}
      <AppTabs />
    </ThemedView>
  );
}
```

**Rutas hoja** (`(public)/index.tsx` y `(app)/home.tsx`) — archivos finos sobre la UI compartida:

```tsx
import { HomeScreen } from '@/components/home-screen';

export default function Home() {
  return <HomeScreen />;
}
```

**`src/components/home-screen.tsx`** — sin props; el CTA se decide por sesión:

```tsx
export function HomeScreen() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const onPrimaryColor = getReadableTextColor(theme.primary);

  const cta = isAuthenticated
    ? { label: 'Cerrar sesión', onPress: () => logout() }
    : { label: 'Iniciar sesión', onPress: () => router.push('/login') };

  // ...hero (HERO) + features (FEATURES) idénticos a la spec 05, y el Pressable usa `cta`
}
```

**`src/components/session-header.tsx`** — sin props, lee todo de `useAuth()`:

```tsx
export function SessionHeader() {
  const { user, logout } = useAuth();
  const theme = useTheme();

  if (!user) return null;

  // avatar (user.avatarInitials) + user.displayName + user.email +
  // Pressable "Cerrar sesión" → logout()   (sin router.replace: lo hace el guard)
}
```

**Configuraciones de tab bar** — cuatro archivos, misma pareja nativo/web que ya usa el proyecto:

| Archivo | Entradas (en orden) |
| --- | --- |
| `src/components/public-tabs.tsx` | `index` → "Home" |
| `src/components/public-tabs.web.tsx` | `/` → "Home" |
| `src/components/app-tabs.tsx` (adaptado) | `home`, `dashboard`, `explore` |
| `src/components/app-tabs.web.tsx` (adaptado) | `/home`, `/dashboard`, `/explore` |

## Plan de implementación

No hay dependencias nuevas que instalar: `Stack.Protected`, `usePathname` y el `hidden`/anchor de
los tabs ya vienen con `expo-router` del SDK 57.

1. **Extraer la UI de Home a un componente.** Crear `src/components/home-screen.tsx` con el
   contenido actual de `src/app/(tabs)/index.tsx` (hero `HERO`, `FEATURES`, CTA y el helper
   `getReadableTextColor` de la spec `05`), dejando el CTA todavía incondicional
   ("Iniciar sesión" → `/login`), y convertir `(tabs)/index.tsx` en un archivo fino que renderice
   `<HomeScreen />`. La app se ve y se comporta igual que antes.
2. **Promover la cabecera.** Crear `src/components/session-header.tsx` (sin props, lee `user` y
   `logout` de `useAuth()`) a partir de `dashboard-header.tsx`; usarla desde
   `(tabs)/dashboard.tsx` en lugar del par `DashboardHeader`/`DashboardHeaderSkeleton`; eliminar
   `src/components/dashboard/dashboard-header.tsx` y
   `src/components/dashboard/dashboard-header-skeleton.tsx`.
3. **Crear el grupo público.** Añadir `src/app/(public)/_layout.tsx`,
   `src/app/(public)/index.tsx` (renderiza `<HomeScreen />`) y
   `src/components/public-tabs.tsx` + `public-tabs.web.tsx` con una única entrada Home.
   **En el mismo paso**, eliminar `src/app/(tabs)/index.tsx` y quitar la entrada Home de
   `app-tabs.tsx`/`app-tabs.web.tsx`, para que la ruta `/` no quede duplicada en dos grupos.
4. **Renombrar el grupo de tabs a `(app)`.** Mover `dashboard.tsx` y `explore.tsx` de `(tabs)/` a
   `(app)/`, crear `(app)/home.tsx` (renderiza `<HomeScreen />`, URL `/home`), y reconstruir
   `app-tabs.tsx`/`.web.tsx` con el orden **[Home][Dashboard][Explore]** (`home`, `dashboard`,
   `explore` / `/home`, `/dashboard`, `/explore`) — ojo, el orden actual del repo es
   [Dashboard][Home][Explore], así que hay que reordenar los triggers, no solo añadir Home.
   Declarar `export const unstable_settings = { anchor: 'dashboard' }` en `(app)/_layout.tsx`.
   En este punto todavía no hay guards: todas las rutas siguen accesibles y la app funciona.
5. **Mover la cabecera al layout del grupo.** `(app)/_layout.tsx` renderiza `<SessionHeader />`
   encima de `<AppTabs />` salvo cuando `usePathname() === '/home'`; `(app)/dashboard.tsx` deja de
   renderizarla y su contenido empieza en las stat cards.
6. **Activar los guards.** En `src/app/_layout.tsx`, extraer `RootNavigator` (necesario para poder
   llamar `useAuth()` dentro de `AuthProvider`), con el spinner a pantalla completa mientras
   `isLoading` y los dos `Stack.Protected`: `(app)` con `guard={isAuthenticated}`, `(public)` y
   `login` con `guard={!isAuthenticated}`. Eliminar el guard imperativo de `(app)/dashboard.tsx`
   (`useEffect` + `router.replace('/login')` + su `ActivityIndicator`) y, en `login.tsx`, el
   `useEffect` que redirigía a `/dashboard` y el `router.replace('/dashboard')` posterior al login.
7. **CTA condicional en Home.** En `home-screen.tsx`, el botón pasa a "Cerrar sesión" →
   `logout()` cuando `isAuthenticated`, y se mantiene "Iniciar sesión" → `/login` cuando no.
   Quitar también el `router.replace('/')` del logout de `SessionHeader`: la vuelta a Home la hace
   el guard.
8. **Botón "Cancelar" en Login.** Añadir en `src/app/login.tsx` un botón secundario debajo del
   submit que haga `router.replace('/')` siempre, deshabilitado mientras `isSubmitting`.
9. **Ajuste de web.** Compensar el espacio de la tab list flotante (`position: absolute`) para que
   no solape la cabecera de sesión, manteniendo una sola implementación de `SessionHeader`.
10. **Verificación manual** (`npm run lint` + arranque de la app) de los flujos completos:
    - Arranque sin sesión → Home, tab bar con una sola entrada, CTA "Iniciar sesión".
    - `/dashboard` y `/explore` sin sesión (por URL en web o deep link) → no accesibles, cae en Home.
    - Home → "Iniciar sesión" → Login → "Cancelar" → vuelve a Home.
    - Login con credenciales válidas → Dashboard, tab bar [Home][Dashboard][Explore], cabecera
      visible con avatar/`displayName`/email.
    - Tab Home estando logado → `/home`, **sin** cabecera, CTA "Cerrar sesión".
    - "Cerrar sesión" desde la cabecera (en Dashboard y en Explore) y desde el CTA de Home → Home
      pública en los tres casos.
    - Cerrar y reabrir la app con sesión guardada → spinner → Dashboard directo, sin ver Home.
    - `/login` por URL estando logado → no accesible.

    > Nota: verificar en web exige sortear el bug preexistente de SSR de la spec `04`
    > (`window is not defined` con `web.output: "static"`), p. ej. poniendo `web.output` en
    > `"single"` en local y sin commitear, o verificar en nativo.

11. **Revisión con Impeccable** sobre `SessionHeader`, la pantalla de Login con "Cancelar" y Home
    en estado logado, aplicando los ajustes que sugiera.

## Criterios de aceptación

- [x] Existen `src/app/(public)/_layout.tsx`, `(public)/index.tsx`, `src/app/(app)/_layout.tsx`,
      `(app)/home.tsx`, `(app)/dashboard.tsx` y `(app)/explore.tsx`; el directorio
      `src/app/(tabs)/` ya no existe.
- [x] `src/app/_layout.tsx` declara los guards dentro de un `RootNavigator` hijo de `AuthProvider`:
      `Stack.Protected guard={isAuthenticated}` para `(app)` y `guard={!isAuthenticated}` para
      `(public)` y `login`.
- [x] Mientras `isLoading` de `useAuth()` es `true` se muestra un spinner a pantalla completa y no
      se monta ninguna tab bar.
- [x] Sin sesión, la app abre en Home (`/`) con una tab bar de **una sola entrada** ("Home") y el
      CTA dice "Iniciar sesión".
- [x] Sin sesión, pedir `/dashboard` o `/explore` (URL directa o deep link) no muestra esas
      pantallas: el guard deja al usuario en Home.
- [x] El CTA "Iniciar sesión" de Home navega a `/login`.
- [x] En `/login`, "Cancelar" devuelve a Home (`/`) y está deshabilitado mientras `isSubmitting`
      es `true`.
- [x] Login con credenciales válidas de Supabase deja al usuario en Dashboard **sin** que
      `login.tsx` ejecute `router.replace('/dashboard')` (la navegación la hace el guard).
- [x] Con sesión, la tab bar tiene exactamente `[Home][Dashboard][Explore]` en ese orden, y el tab
      seleccionado al entrar es **Dashboard** (`unstable_settings.anchor`).
- [x] Con sesión, Dashboard y Explore muestran `SessionHeader` (avatar + `displayName` + email +
      "Cerrar sesión"), renderizada una sola vez desde `(app)/_layout.tsx`.
- [x] Con sesión, el tab Home abre `/home`, **no** muestra `SessionHeader`, y su CTA dice
      "Cerrar sesión".
- [x] "Cerrar sesión" desde los tres puntos posibles (cabecera en Dashboard, cabecera en Explore,
      CTA de Home) cierra la sesión de Supabase y deja al usuario en Home pública, sin diálogo de
      confirmación y sin ningún `router.replace` explícito en el código.
- [x] Con sesión, `/login` no es accesible por URL.
- [x] Cerrar y reabrir la app con sesión guardada lleva directo a Dashboard, sin que Home ni la tab
      bar pública aparezcan en ningún instante.
- [x] `src/components/home-screen.tsx` es el único lugar donde vive la UI de Home;
      `(public)/index.tsx` y `(app)/home.tsx` se limitan a renderizarla.
- [x] `src/components/dashboard/dashboard-header.tsx` y
      `src/components/dashboard/dashboard-header-skeleton.tsx` ya no existen; los skeletons de
      stat cards y de actividad reciente siguen intactos.
- [x] `src/app/(app)/dashboard.tsx` no contiene guard de sesión ni `ActivityIndicator` de auth; su
      contenido empieza en las stat cards.
- [x] En web, la barra flotante de tabs no solapa la `SessionHeader`.
- [x] `npm run lint` pasa sin errores nuevos.
- [x] `SessionHeader`, Login con "Cancelar" y Home en estado logado fueron revisadas con el skill
      Impeccable y los ajustes sugeridos (si los hubo) fueron aplicados.

## Decisiones tomadas y descartadas

1. **Dos grupos de rutas (`(public)`/`(app)`) con `Stack.Protected`**, descartando un único grupo
   `(tabs)` con triggers `hidden`. *Por qué:* decisión explícita del usuario; la protección queda
   declarativa y las rutas logadas no existen sin sesión. La documentación de Expo Router avisa de
   que `hidden`/`disabled` no son mecanismos de autorización — con ellos la ruta sigue existiendo y
   `router.push` sigue navegando.
2. **Home existe en los dos estados de sesión**, con tab bar logada `[Home][Dashboard][Explore]`.
   *Por qué:* decisión explícita del usuario, que reabre lo que decía el enunciado inicial ("en el
   tab solo saldrá dashboard y explore"); Home es la landing de la app y estando logado su CTA pasa
   a ser "Cerrar sesión".
3. **UI de Home en un componente compartido (`home-screen.tsx`) + dos rutas finas** (`/` y
   `/home`), descartando las rutas compartidas con sintaxis de array `(public,app)/index.tsx`.
   *Por qué:* la documentación de Expo Router recomienda explícitamente no usar rutas compartidas
   para control de acceso y resuelve los enlaces en frío por "primera coincidencia alfabética", con
   lo que `/` intentaría resolverse antes contra `(app)` que contra `(public)`. Se acepta el coste
   de que Home responda en dos URLs.
4. **Home es el primer tab, pero el anchor del grupo logado es `dashboard`.** *Por qué:* decisión
   explícita del usuario; quiere Home a la izquierda en la barra y, al entrar con sesión, abrir
   directamente Dashboard.
5. **Arranque con sesión guardada → Dashboard directo**, sin pasar por Home. *Por qué:* decisión
   explícita del usuario.
6. **`DashboardHeader` promovido a `SessionHeader` compartido** (avatar + `displayName` + email +
   logout), descartando crear una cabecera mínima nueva al lado. *Por qué:* decisión explícita del
   usuario; el componente ya existente cubre el requisito y duplicarlo habría dejado dos bloques
   con datos de usuario en Dashboard.
7. **`dashboard-header-skeleton.tsx` se elimina**, no se conserva renombrado. *Por qué:* decisión
   explícita del usuario; con el spinner de restauración de sesión, cuando `(app)` monta ya existe
   `user`, así que la cabecera no tiene estado de carga y el skeleton quedaría sin llamador.
8. **La cabecera se renderiza en `(app)/_layout.tsx`** (una sola vez, excluyendo Home con
   `usePathname()`), descartando renderizarla desde cada pantalla. *Por qué:* decisión explícita
   del usuario; garantiza la cabecera en cualquier pantalla logada futura sin depender de que
   alguien se acuerde de añadirla.
9. **Home logada no muestra la cabecera**: su CTA es el único control de logout de esa pantalla.
   *Por qué:* decisión explícita del usuario; evita dos botones "Cerrar sesión" en la misma
   pantalla. Es una excepción consciente al "en toda página logada hay cabecera" del enunciado.
10. **"Cancelar" hace `router.replace('/')` siempre** (no `router.back()`) y queda deshabilitado
    mientras `isSubmitting`. *Por qué:* decisión explícita del usuario; cumple literalmente "volver
    a Home" incluso llegando a `/login` por deep link o recarga en web, donde no hay historial, y
    evita abandonar la pantalla con una petición a Supabase en vuelo.
11. **Spinner a pantalla completa mientras `isLoading`**, descartando dejar el splash (`return
    null`) o aceptar el flash de Home. *Por qué:* decisión explícita del usuario.
12. **Sin diálogo de confirmación al cerrar sesión.** *Por qué:* decisión explícita del usuario;
    es una acción poco destructiva y volver a entrar solo cuesta escribir credenciales.
13. **Misma `SessionHeader` en nativo y web, ajustando el espaciado** de la barra flotante,
    descartando integrar el logout en la tab list de web. *Por qué:* decisión explícita del
    usuario; una sola implementación de la cabecera en vez de dos caminos por plataforma.
14. **La navegación pasa a ser responsabilidad exclusiva de los guards**: se eliminan el
    `router.replace('/dashboard')` posterior al login, el `useEffect` de redirect de `login.tsx`,
    el guard imperativo de `dashboard.tsx` y el `router.replace('/')` del logout. *Por qué:* con
    `Stack.Protected` los dos mecanismos se pisarían, provocando saltos dobles y estados
    intermedios visibles.
15. **Se descarta arreglar el bug de SSR en web** (`window is not defined` con
    `web.output: "static"`) heredado de la spec `04`. *Por qué:* es independiente de esta
    reestructuración y merece su propia spec; aquí solo se documenta cómo sortearlo en local para
    poder verificar en web.

## Riesgos identificados

- **El destino exacto al desmontarse un grupo no está garantizado.** La documentación de Expo
  Router dice que cuando un guard pasa a `false` el usuario va "al anchor route o a la primera
  pantalla disponible", sin precisar el caso de dos grupos con navegadores de tabs anidados. Hay
  que verificar los **tres** puntos de logout (cabecera en Dashboard, cabecera en Explore, CTA en
  `/home`) por separado: es posible que desde `/home` el destino no sea exactamente `/`.
- **`usePathname() !== '/home'` es una condición frágil.** Si mañana se renombra `(app)/home.tsx`,
  la cabecera empezará a aparecer en Home sin que nada falle de forma ruidosa. No hay test que lo
  cubra y el síntoma es puramente visual.
- **`NativeTabs` sigue siendo API `unstable_`** (`expo-router/unstable-native-tabs`). Esta spec
  duplica su configuración en dos layouts y además monta una vista hermana (`SessionHeader`) encima
  del navegador nativo de tabs. Si en iOS/Android esa composición no se comporta como en web, el
  paso 5 del plan es el que habrá que replantear (p. ej. moviendo la cabecera a las pantallas) —
  es el punto del plan con más probabilidad de necesitar ajuste.
- **`anchor: 'dashboard'` con Home como primer trigger** es una combinación que solo se puede
  confirmar en ejecución. Si el anchor no se respeta, entrar con sesión dejaría al usuario en Home
  (primer tab) en lugar de en Dashboard, incumpliendo el criterio correspondiente.
- **Tab bar nativa de una sola entrada.** El grupo público muestra un único tab; en algunas
  plataformas una tab bar de una entrada puede verse extraña o comportarse de forma inesperada. Si
  se decidiera ocultarla, habría que reescribir el criterio de aceptación que exige "una sola
  entrada".
- **Las dos URLs de Home no se canonicalizan.** En web, un enlace guardado a `/home` solo funciona
  con sesión y `/` solo sin ella; el guard redirige en ambos casos, pero el enlace compartido entre
  estados puede sorprender a quien lo abra.
- **La verificación en web depende del workaround del bug de SSR** de la spec `04`: sin poner
  `web.output` en `"single"` en local, `expo start --web` no arranca, así que el criterio de "en web
  la barra flotante no solapa la cabecera" no se puede comprobar de otra forma.
