# 04 - Autenticación real con Supabase

## Header

**Estado:** Implemented
**Dependencias:** `01-design-system-theming` (theming, sin cambios), `03-login-screen` (**reemplaza** la lógica mock de `AuthProvider`/`login()` por Supabase real; la UI — formulario, rutas, guard del Dashboard, botón de logout — se mantiene igual, solo cambia lo que hay detrás)
**Fecha:** 2026-09-14

**Objetivo:** Integrar autenticación real con Supabase (email + password, contra cuentas ya existentes) reemplazando la lógica mock de la spec `03`, persistiendo la sesión con `AsyncStorage` según la recomendación oficial de Supabase para React Native, sin añadir registro de usuarios ni timeout de inactividad.

## Scope

**Incluye:**

- Instalación de `@supabase/supabase-js`, `@react-native-async-storage/async-storage` y `react-native-url-polyfill`.
- `.env.local`: **renombrar** `NEXT_PUBLIC_SUPABASE_URL` → `EXPO_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → `EXPO_PUBLIC_SUPABASE_ANON_KEY` (mismos valores, se eliminan las claves con prefijo `NEXT_PUBLIC_`).
- `src/lib/supabase.ts`: cliente de Supabase configurado con `storage: AsyncStorage`, `autoRefreshToken: true`, `persistSession: true`, `detectSessionInUrl: false`.
- `src/contexts/auth-context.tsx` reescrito: `supabase.auth.getSession()` para restaurar sesión al montar, `supabase.auth.onAuthStateChange` para mantener el estado sincronizado, `supabase.auth.signInWithPassword` para login, `supabase.auth.signOut` para logout. Elimina toda la lógica de `expo-secure-store`/token simulado de la spec `03`.
- `AuthUser` actualizado: `id` (uuid de Supabase), `email`, `displayName` (de `user_metadata.full_name`/`user_metadata.name`, con fallback al email) y `avatarInitials` derivado de `displayName`.
- `src/app/login.tsx`: mensajes de error mostrados **tal cual** los devuelve Supabase (`error.message`); validación local mínima (email y password no vacíos, sin regex de formato) solo para evitar llamadas de red innecesarias.
- `react-native-url-polyfill/auto` importado al inicio del entry point de la app (requerido por el SDK de Supabase en React Native).
- Ajuste mínimo en `dashboard.tsx`/`dashboard-header.tsx` para usar `displayName` en vez del `name` mock — el guard y la posición del botón de logout no cambian.
- Documentación explícita de que `SUPABASE_SERVICE_ROLE_KEY` no se toca ni se referencia en ningún código de la app.

**No incluye:**

- Registro de nuevas cuentas (sign-up) — las cuentas ya existen, se crean manualmente desde el dashboard de Supabase.
- Recuperación de contraseña, magic link, OAuth social u otro método — solo email + password.
- Timeout de inactividad ni countdown de expiración de sesión — descartado en esta ronda de preguntas.
- Cualquier uso de `SUPABASE_SERVICE_ROLE_KEY` o de la API de administración de Supabase.
- Tabla `profiles` o cualquier esquema de base de datos nuevo — el nombre a mostrar viene solo de `user_metadata` ya existente en Supabase Auth.
- Manejo especial de "email not confirmed" — se muestra igual que cualquier otro error de Supabase, tal cual.

## Modelo de datos

**`src/lib/supabase.ts`**

```ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

**`src/contexts/auth-context.tsx`** (reescribe la versión de la spec `03`)

```ts
export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  avatarInitials: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
};

function mapSupabaseUser(supabaseUser: SupabaseAuthUser): AuthUser {
  const displayName = supabaseUser.user_metadata?.full_name ?? supabaseUser.user_metadata?.name ?? supabaseUser.email!;
  const avatarInitials = displayName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return { id: supabaseUser.id, email: supabaseUser.email!, displayName, avatarInitials };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function login(email: string, password: string) {
    if (email.trim().length === 0) return { success: false, error: 'Ingresa tu email.' };
    if (password.length === 0) return { success: false, error: 'Ingresa tu contraseña.' };

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  // value = { isAuthenticated, isLoading, user, login, logout }
}

export function useAuth() {
  return useContext(AuthContext);
}
```

`src/app/login.tsx` no cambia su `LoginFormState`, solo el origen del mensaje de `error` (ahora viene de `error.message` de Supabase en vez de un string fijo).

## Plan de implementación

1. Instalar dependencias: `npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill`.
2. Actualizar `.env.local`: renombrar `NEXT_PUBLIC_SUPABASE_URL` → `EXPO_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → `EXPO_PUBLIC_SUPABASE_ANON_KEY`; dejar `SUPABASE_SERVICE_ROLE_KEY` intacto y sin referenciar en ningún código de la app.
3. Crear `src/lib/supabase.ts` con el cliente de Supabase configurado (`AsyncStorage`, `autoRefreshToken`, `persistSession`, `detectSessionInUrl: false`).
4. Añadir `import 'react-native-url-polyfill/auto';` como primera línea del entry point de la app (`src/app/_layout.tsx`, antes de cualquier otro import).
5. Reescribir `src/contexts/auth-context.tsx`: tipos `AuthUser`, helper `mapSupabaseUser`, `AuthProvider` con `getSession`/`onAuthStateChange`/`signInWithPassword`/`signOut`, eliminando toda referencia a `expo-secure-store` y al token simulado de la spec `03`.
6. Actualizar `src/app/login.tsx`: quitar la regex de validación de email y el mensaje de error fijo; mostrar `error.message` de Supabase; mantener solo la validación de campos no vacíos.
7. Actualizar `src/components/dashboard/dashboard-header.tsx` (y cualquier otro consumidor de `AuthUser`) para usar `displayName` en vez del `name` mock.
8. Desinstalar `expo-secure-store` si tras el paso 5 no queda ningún otro uso en el proyecto (verificar antes de remover).
9. Verificación manual: `npm run lint`, `npm start`; probar login con una cuenta real existente en el proyecto de Supabase (credenciales correctas → Dashboard; credenciales incorrectas → mensaje de error de Supabase tal cual); cerrar y reabrir la app para confirmar que la sesión persiste; logout y confirmar que el guard del Dashboard redirige a `/login`.
10. Confirmar (búsqueda de texto en `src/`) que ningún archivo referencia `SUPABASE_SERVICE_ROLE_KEY`.

## Criterios de aceptación

- [x] `src/lib/supabase.ts` existe y exporta un cliente creado con `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY`, con `storage: AsyncStorage`, `autoRefreshToken: true`, `persistSession: true`.
- [x] `.env.local` ya no contiene `NEXT_PUBLIC_SUPABASE_URL` ni `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; contiene `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` con los mismos valores.
- [x] `SUPABASE_SERVICE_ROLE_KEY` sigue existiendo en `.env.local` pero ningún archivo bajo `src/` lo referencia (verificable con `grep -r SUPABASE_SERVICE_ROLE_KEY src/` sin resultados).
- [x] `src/hooks/use-auth.ts`/lógica de `expo-secure-store`/token simulado de la spec `03` ya no existen; `AuthProvider` usa `supabase.auth` exclusivamente.
- [x] Con credenciales de una cuenta real existente en Supabase, `login(email, password)` autentica y navega a `/dashboard`.
- [x] Con credenciales incorrectas, `login()` devuelve `error.message` tal cual lo entrega Supabase y se muestra en el formulario, sin navegar.
- [x] `AuthUser.displayName` usa `user_metadata.full_name` o `user_metadata.name` si existen, y el email como fallback; `DashboardHeader` muestra ese `displayName`.
- [x] Cerrar la app y volver a abrirla mantiene la sesión iniciada (sin pasar por `/login`), gracias a la persistencia de `AsyncStorage` del SDK de Supabase.
- [x] El guard de `dashboard.tsx` sigue funcionando: sin sesión, redirige a `/login`.
- [x] Pulsar "Cerrar sesión" invoca `supabase.auth.signOut()`, `isAuthenticated` pasa a `false` y navega a `index`.
- [x] `npm run lint` pasa sin errores nuevos.

## Decisiones tomadas y descartadas

1. **Email + password nativo de Supabase**, no un campo "username" separado. *Por qué:* Supabase no soporta username nativamente; decisión explícita del usuario tras aclarar la ambigüedad.
2. **Sin sign-up** — las cuentas ya existen y se crean manualmente en el dashboard de Supabase. *Por qué:* decisión explícita del usuario; reduce el alcance de esta spec a solo sign-in.
3. **`AsyncStorage` en vez de `expo-secure-store`** para la sesión de Supabase. *Por qué:* recomendación oficial del SDK de Supabase para React Native — `SecureStore` tiene un límite de 2048 bytes por valor que puede truncar una sesión real (access + refresh token).
4. **`displayName` con fallback `user_metadata.full_name` → `user_metadata.name` → `email`**. *Por qué:* decisión explícita del usuario; no requiere crear una tabla `profiles` ni ningún esquema nuevo en Supabase.
5. **Errores de Supabase mostrados tal cual (`error.message`)**, sin mapeo a mensajes personalizados. *Por qué:* decisión explícita del usuario; evita mantener un diccionario de traducciones de errores que puede quedar desactualizado.
6. **Se descarta el timeout de inactividad/countdown de expiración** que se pidió inicialmente. *Por qué:* decisión explícita del usuario en esta ronda de preguntas; puede retomarse como spec futura si se necesita.
7. **`SUPABASE_SERVICE_ROLE_KEY` completamente fuera de alcance**, nunca referenciado en código de la app. *Por qué:* es una clave de máximo privilegio (bypassa RLS); exponerla en el bundle del cliente sería una vulnerabilidad crítica.
8. **Renombrar (no duplicar) `NEXT_PUBLIC_*` → `EXPO_PUBLIC_*`** en `.env.local`. *Por qué:* decisión explícita del usuario; evita mantener las mismas credenciales bajo dos nombres distintos sin necesidad.

## Riesgos identificados

- **Polyfills/bundling específicos de Expo SDK 57.** `react-native-url-polyfill` y el SDK de Supabase pueden requerir ajustes de Metro no cubiertos por este plan — si aparecen errores de bundling al implementar, hay que consultar la documentación versionada de Expo (`https://docs.expo.dev/versions/v57.0.0/`) antes de improvisar una solución.
- **Confirmación de email obligatoria en Supabase.** Si está activada en el proyecto, cuentas no confirmadas mostrarán el error de Supabase tal cual ("Email not confirmed"), lo cual puede confundir a un usuario que no sabe que existe ese paso — no se comunica de forma especial en esta spec.
- **Eliminar `expo-secure-store` (paso 8 del plan).** Si algún archivo fuera de `auth-context.tsx` llegó a importarlo durante la implementación de la spec `03`, desinstalar la dependencia podría romperlo — hay que verificar todos los usos antes de desinstalar, no asumir que solo estaba en `auth-context.tsx`.
