# 03 - Pantalla de Login

## Header

**Estado:** Implemented
**Dependencias:** `01-design-system-theming` (theming), `02-dashboard-screen` (reemplaza su `useAuth()` placeholder y es el destino tras login)
**Fecha:** 2026-09-14

**Objetivo:** Crear la pantalla de Login (validación mock y persistencia de sesión vía `expo-secure-store`), accesible desde un botón en la pantalla de inicio, que redirige al Dashboard tras autenticarse, protege el tab Dashboard con un guard, y añade un botón de logout en el header del Dashboard, siguiendo el mismo lenguaje visual ya usado en las specs `01` y `02`.

## Scope

**Incluye:**

- `src/contexts/auth-context.tsx`: `AuthProvider` + `useAuth()` — **reemplaza** el hook placeholder de la spec `02`. Expone `{ isAuthenticated, user, isLoading, login(email, password), logout() }`, donde `isLoading` cubre la restauración de sesión al arrancar la app.
- Persistencia de sesión vía **`expo-secure-store`** (nueva dependencia a instalar): se guarda el `AuthUser` completo + un token simulado (ej. `mock-token-<timestamp>`).
- `src/app/login.tsx`: pantalla **fuera de la tab bar** (stack/push), con formulario email + password, botón de submit y estado de error inline. Validación mock (opción a): email con formato válido + password no vacío → login exitoso; si no, muestra el error correspondiente sin llamar a nada.
- `login.tsx` redirige automáticamente a `/dashboard` si al montar ya hay una sesión restaurada (`isAuthenticated: true`), sin mostrar el formulario.
- Botón **"Iniciar sesión"** en `src/app/index.tsx` que navega a `/login`.
- **Guard** en `src/app/dashboard.tsx`: cuando `isLoading` es `false` y `isAuthenticated` es `false`, redirige (`router.replace`) a `/login`.
- Botón **"Cerrar sesión"** en `src/components/dashboard/dashboard-header.tsx`: llama a `logout()` y navega de vuelta a `index`.
- `src/app/_layout.tsx` envuelve la app en `AuthProvider`.
- Sigue el theming de la spec `01` y el lenguaje visual ya validado con Impeccable en la spec `02`; paso final de revisión con **Impeccable** sobre la pantalla de Login.

**No incluye:**

- Backend real de autenticación (Supabase u otro) — sigue siendo 100% mock.
- Registro de nuevo usuario, recuperación de contraseña o "recordarme".
- Guard en `index`/`explore` — siguen accesibles sin sesión.
- Expiración/refresh de token — el token simulado no caduca.
- Múltiples cuentas o cambio de usuario sin pasar por logout.

## Modelo de datos

**`src/contexts/auth-context.tsx`** — reemplaza `src/hooks/use-auth.ts` de la spec `02` (ese archivo se elimina; todo lo que importaba `useAuth` pasa a importarlo desde aquí):

```ts
export type AuthUser = {
  name: string;
  email: string;
  avatarInitials: string;
};

type StoredSession = {
  user: AuthUser;
  token: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const AUTH_SESSION_KEY = 'auth-session';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    (async () => {
      const raw = await SecureStore.getItemAsync(AUTH_SESSION_KEY);
      if (raw) {
        const { user } = JSON.parse(raw) as StoredSession;
        setUser(user);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    })();
  }, []);

  async function login(email: string, password: string) {
    if (!EMAIL_REGEX.test(email)) return { success: false, error: 'Ingresa un email válido.' };
    if (password.length === 0) return { success: false, error: 'Ingresa tu contraseña.' };

    const namePart = email.split('@')[0].replace(/[._]/g, ' ');
    const name = namePart.replace(/\b\w/g, (c) => c.toUpperCase());
    const avatarInitials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
    const nextUser: AuthUser = { name, email, avatarInitials };
    const token = `mock-token-${Date.now()}`;

    await SecureStore.setItemAsync(AUTH_SESSION_KEY, JSON.stringify({ user: nextUser, token }));
    setUser(nextUser);
    setIsAuthenticated(true);
    return { success: true };
  }

  async function logout() {
    await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
    setUser(null);
    setIsAuthenticated(false);
  }

  // ...value = { isAuthenticated, isLoading, user, login, logout }, <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext);
}
```

**`src/app/login.tsx`** — estado local del formulario (no persiste, es solo de UI):

```ts
type LoginFormState = {
  email: string;
  password: string;
  error: string | null;
  isSubmitting: boolean;
};
```

## Plan de implementación

1. Instalar `expo-secure-store` (`npx expo install expo-secure-store`).
2. Crear `src/contexts/auth-context.tsx` con `AuthProvider`, `useAuth()` y el tipo `AuthUser`, tal como en el modelo de datos.
3. Eliminar `src/hooks/use-auth.ts` (placeholder de la spec `02`) y actualizar los archivos que lo importaban para que usen `@/contexts/auth-context`.
4. Envolver la app en `AuthProvider` dentro de `src/app/_layout.tsx`.
5. Crear `src/app/login.tsx`: formulario email/password con `LoginFormState`, validación local, llamada a `login()`, manejo de error/`isSubmitting`, redirect a `/dashboard` en éxito, y redirect automático a `/dashboard` si `isAuthenticated` ya es `true` al montar (una vez `isLoading` es `false`).
6. Añadir botón **"Iniciar sesión"** en `src/app/index.tsx` que navega a `/login`.
7. Añadir el guard en `src/app/dashboard.tsx`: cuando `isLoading` es `false` y `isAuthenticated` es `false`, `router.replace('/login')`.
8. Añadir botón **"Cerrar sesión"** en `src/components/dashboard/dashboard-header.tsx`: llama a `logout()` y navega de vuelta a `index`.
9. Verificación manual (`npm run lint` + `npm start`) del flujo completo: `index` → botón Login → credenciales inválidas muestra error → credenciales válidas → `dashboard` → cerrar y reabrir la app conserva la sesión → logout → vuelve a `index` → intentar entrar a `dashboard` redirige a `login`.
10. Revisión con el skill **Impeccable** sobre la pantalla de Login terminada, aplicando los ajustes que sugiera.

## Criterios de aceptación

- [ ] Existe `src/contexts/auth-context.tsx` con `AuthProvider`/`useAuth()`; `src/hooks/use-auth.ts` ya no existe.
- [ ] `src/app/_layout.tsx` envuelve el árbol de la app en `AuthProvider`.
- [ ] Al abrir la app sin sesión previa, `index.tsx` muestra un botón "Iniciar sesión" que navega a `/login`.
- [ ] En `/login`, enviar un email con formato inválido o un password vacío muestra un mensaje de error y **no** llama a `login()` con éxito ni navega.
- [ ] En `/login`, enviar un email válido + password no vacío llama a `login()`, marca `isAuthenticated: true` y navega a `/dashboard`.
- [ ] Tras un login exitoso, `AuthUser` (`name`, `email`, `avatarInitials`) se deriva del email ingresado y se refleja en `DashboardHeader`.
- [ ] Cerrar la app (o recargar) y volver a abrirla mantiene la sesión (`isAuthenticated: true` sin pasar por el formulario), leyendo el `AuthUser` + token desde `expo-secure-store`.
- [ ] Entrar al tab `dashboard` sin sesión (`isAuthenticated: false` y `isLoading: false`) redirige automáticamente a `/login`.
- [ ] Los tabs `index` y `explore` siguen siendo accesibles sin sesión.
- [ ] Abrir `/login` con una sesión ya restaurada (`isAuthenticated: true`) redirige automáticamente a `/dashboard` sin mostrar el formulario.
- [ ] Pulsar "Cerrar sesión" en `DashboardHeader` borra la sesión de `expo-secure-store`, pone `isAuthenticated: false` y navega a `index`.
- [ ] `npm run lint` pasa sin errores nuevos.
- [ ] La pantalla de Login fue revisada con el skill Impeccable y los ajustes sugeridos (si los hubo) fueron aplicados.

## Decisiones tomadas y descartadas

1. **Validación mock opción (a)** — cualquier email con formato válido + password no vacío autentica. *Por qué:* decisión explícita del usuario; evita hardcodear credenciales "secretas" en el código del boilerplate.
2. **Persistencia con `expo-secure-store`** en vez de `AsyncStorage`. *Por qué:* decisión explícita del usuario — almacenamiento cifrado, apropiado si en el futuro esto guarda un token real de un backend.
3. **Se persiste el `AuthUser` completo + un token simulado**, no solo un booleano. *Por qué:* decisión explícita del usuario; permite que el Dashboard siga mostrando nombre/avatar tras reabrir la app, y deja un campo `token` listo para cuando haya backend real.
4. **`AuthProvider`/`useAuth()` centralizado en Context**, reemplazando el hook aislado de la spec `02`. *Por qué:* el estado de sesión debe compartirse y sincronizarse entre `index`, `login` y `dashboard`; un hook sin estado compartido no puede reflejar login/logout entre pantallas.
5. **Guard solo en el tab `dashboard`**, `index`/`explore` quedan abiertos sin sesión. *Por qué:* decisión explícita del usuario — son pantallas de ejemplo/landing, no necesitan protección.
6. **`login.tsx` fuera de la tab bar** (stack/push) en vez de ser un tab más. *Por qué:* decisión explícita del usuario; no tiene sentido un tab permanente para iniciar sesión.
7. **Sin expiración/refresh de token.** *Por qué:* fuera de alcance — es un token simulado sin backend real que lo valide o renueve.

## Riesgos identificados

- **Dependencia de la forma exacta de la spec `02`.** Si `dashboard.tsx`, `dashboard-header.tsx` o `use-auth.ts` cambiaron de nombre/forma respecto a lo documentado en esa spec durante su implementación, el paso 3 (eliminar `use-auth.ts` y migrar imports) y el paso 8 (botón de logout en `DashboardHeader`) deben verificarse contra el código real, no solo contra el documento.
- **`expo-secure-store` en web.** El comportamiento en `npm run web` puede diferir del nativo (soporte limitado o fallback); hay que verificar explícitamente la persistencia de sesión en web durante el paso 9, no asumir que funciona igual que en iOS/Android.
- **Heurística de nombre desde el email** es simple y puede dar nombres poco naturales con emails atípicos (ej. `abc123@dominio.com` → "Abc123"). Aceptable para un boilerplate genérico con datos mock, no es lógica de negocio real.
