# 07 - `display_name` normalizado, cabecera unificada y tab inicial Dashboard

## Header

**Estado:** Implemented
**Dependencias:**

- `04-supabase-auth` (modifica `mapSupabaseUser` en `src/contexts/auth-context.tsx` para leer
  `display_name`; el resto de la lógica de Supabase no se toca)
- `05-neo-mirai-theme-home` (la Home que rediseñó pierde su CTA en estado logado)
- `06-navegacion-por-sesion` (reabre sus decisiones nº4 —Home como primer tab— y nº9 —Home logada
  sin cabecera—, y sustituye el `anchor: 'dashboard'` que no cumplía su función)

**Fecha:** 2026-09-16

**Objetivo:** Normalizar el `display_name` de todos los usuarios de Supabase a partir de la parte
local de su email, mostrarlo en la app tal como queda almacenado, unificar la `SessionHeader` en
**todas** las pantallas logadas incluida Home, y hacer que el tab seleccionado al iniciar sesión sea
Dashboard.

## Scope

**Incluye:**

- **Backfill del `display_name` en Supabase** para **todos** los usuarios de `auth.users`, con la
  parte local del email como origen: cualquier carácter no alfanumérico pasa a espacio y cada
  palabra se capitaliza (`miguel.pastor@mock.com` → `Miguel Pastor`).
    - Se escribe en `raw_user_meta_data.display_name` (la clave estándar del panel de Supabase)
      **por merge**, conservando el resto del metadata.
    - Se sobreescribe siempre, incluso si el usuario ya tenía un `display_name`.
    - El SQL queda commiteado en `scripts/backfill-display-name.sql` como registro de qué se
      ejecutó.
    - La ejecución estaba prevista vía el MCP de Supabase (`execute_sql`), pero ese MCP no llegó a
      conectar (`HTTP 400`), así que se aplicó por el plan B que esta spec ya contemplaba:
      `scripts/backfill-display-name.mjs`, que replica la misma transformación sobre la Admin API
      (`listUsers` + `updateUserById`) leyendo `SUPABASE_SERVICE_ROLE_KEY` de `.env.local`. Ese
      script también queda commiteado, porque es lo que de verdad se ejecutó.
- **`mapSupabaseUser` lee `display_name` primero** (`src/contexts/auth-context.tsx`): la cadena de
  fallback pasa a ser `display_name ?? full_name ?? name ?? email`. El valor se muestra **tal cual
  está almacenado**, sin formateo en la app.
- **`SessionHeader` en todas las pantallas logadas, Home incluida**: `src/app/(app)/_layout.tsx`
  deja de condicionar la cabecera con `usePathname()` y la renderiza siempre.
- **La Home logada pierde su CTA**: en `src/components/home-screen.tsx` el botón solo se renderiza
  cuando no hay sesión ("Iniciar sesión" → `/login`). Con sesión, la pantalla termina en las 3
  features y el logout vive únicamente en la cabecera.
- **Ajuste del safe area de Home**: `HomeScreen` no debe aplicar el inset superior cuando se
  renderiza bajo la cabecera del grupo `(app)`, porque el layout ya lo consumió. Se resuelve con el
  `isAuthenticated` que el componente ya lee, sin añadirle props.
- **Tab inicial tras el login = Dashboard**, reordenando los triggers a `[Dashboard][Home][Explore]`
  en `src/components/app-tabs.tsx` y `src/components/app-tabs.web.tsx` (el primer trigger es el tab
  inicial).
- **Eliminación de `export const unstable_settings = { anchor: 'dashboard' }`** en
  `src/app/(app)/_layout.tsx`: no hace lo que la spec `06` esperaba y su presencia sugiere lo
  contrario.
- Paso final de revisión con **Impeccable** sobre la única superficie que cambia visualmente: Home
  en estado logado (cabecera arriba, sin CTA abajo).

**No incluye:**

- Cualquier automatismo para que **nuevos** usuarios obtengan `display_name` (trigger SQL, hook de
  sign-up, edge function). Esto es un backfill puntual sobre usuarios existentes.
- Sign-up, cambio de contraseña, edición del perfil desde la app o escritura de `user_metadata`
  desde el cliente.
- Cambios en la lógica de `avatarInitials`: con `Miguel Pastor` sigue dando `MP` sin tocarla.
- Cambios en el contenido de Dashboard y Explore, ni en su espaciado, más allá de lo que implique la
  cabecera que ya tenían.
- Rediseño de Home: solo desaparece el CTA en estado logado. No se añade saludo, ni contenido
  sustituto, ni se reordena el hero.
- Cambios en los guards, en `(public)`, en `login.tsx` o en el spinner de `isLoading`.
- Redirects o canonicalización entre las dos URLs de Home (`/` y `/home`): siguen conviviendo como
  en la spec `06`.
- El bug preexistente de SSR en web (`window is not defined` con `web.output: "static"`, heredado de
  la spec `04`) — sigue pendiente de su propia spec.
- Tests automatizados.

## Modelo de datos

No hay tipos nuevos en la app: `AuthUser` (`id`, `email`, `displayName`, `avatarInitials`) se queda
igual. Lo que cambia es el **contenido** de `raw_user_meta_data` en Supabase y el orden de lectura
en el mapeo.

**`scripts/backfill-display-name.sql`** — un único `UPDATE`, idempotente:

```sql
-- Backfill de display_name a partir de la parte local del email.
-- Merge sobre raw_user_meta_data: no borra el resto del metadata.
update auth.users
set raw_user_meta_data =
      coalesce(raw_user_meta_data, '{}'::jsonb)
      || jsonb_build_object(
           'display_name',
           initcap(btrim(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9]+', ' ', 'g')))
         )
where email is not null;
```

Resultado esperado de la transformación:

| `email` | `display_name` |
| --- | --- |
| `miguel.pastor@mock.com` | `Miguel Pastor` |
| `ana-lopez@mock.com` | `Ana Lopez` |
| `juan_perez@mock.com` | `Juan Perez` |
| `admin@mock.com` | `Admin` |

**`src/contexts/auth-context.tsx`** — `display_name` primero, sin formateo en cliente:

```ts
const displayName =
  supabaseUser.user_metadata?.display_name ??
  supabaseUser.user_metadata?.full_name ??
  supabaseUser.user_metadata?.name ??
  supabaseUser.email!;
```

**`src/app/(app)/_layout.tsx`** — sin `unstable_settings` y sin condición de ruta:

```tsx
export default function AppLayout() {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.headerRow, { paddingTop: insets.top + Spacing.four }]}>
        <View style={styles.headerContent}>
          <SessionHeader />
        </View>
      </View>
      <AppTabs />
    </ThemedView>
  );
}
```

**`src/components/home-screen.tsx`** — el CTA desaparece con sesión y el inset superior también:

```tsx
const { isAuthenticated } = useAuth();

// Bajo la cabecera de `(app)` el inset superior ya está consumido por el layout.
const safeAreaEdges = isAuthenticated
  ? (['bottom', 'left', 'right'] as const)
  : (['top', 'bottom', 'left', 'right'] as const);

// ...
{!isAuthenticated && (
  <Pressable onPress={() => router.push('/login')} /* ...estilos actuales... */>
    <ThemedText type="smallBold" style={{ color: onPrimaryColor }}>
      Iniciar sesión
    </ThemedText>
  </Pressable>
)}
```

`logout` deja de usarse en `HomeScreen` y sale de la desestructuración de `useAuth()`.

**Orden de tabs del grupo logado** (el primer trigger es el inicial):

| Archivo | Entradas (en orden) |
| --- | --- |
| `src/components/app-tabs.tsx` | `dashboard`, `home`, `explore` |
| `src/components/app-tabs.web.tsx` | `/dashboard`, `/home`, `/explore` |

## Plan de implementación

No hay dependencias nuevas que instalar.

1. **Crear `scripts/backfill-display-name.sql`** con el `UPDATE` del modelo de datos. No cambia nada
   en la app; es el artefacto que documenta la operación de datos.
2. **Leer `display_name` en el mapeo.** En `src/contexts/auth-context.tsx`, añadir
   `user_metadata?.display_name` como primera opción de la cadena de fallback. Seguro de aplicar
   antes del backfill: sin esa clave, el comportamiento actual (`full_name ?? name ?? email`) se
   mantiene intacto.
3. **Ejecutar el backfill.** Hecho el 2026-09-16 sobre 19 usuarios, con
   `node --env-file=.env.local scripts/backfill-display-name.mjs --apply` (el MCP de Supabase no
   conectaba). Ninguno tenía `display_name` previo, `email_verified` sobrevivió al merge en las 19
   filas y una segunda pasada en dry-run no detecta diferencias, así que la operación es idempotente.
   Los datos reales son handles, no nombres: `vault_07@mock.com` → `Vault 07`,
   `rgb_queen@mock.com` → `Rgb Queen`, `z3r0cool@mock.com` → `Z3r0cool`.
4. **Tab inicial Dashboard.** Reordenar los triggers a `dashboard`, `home`, `explore` en
   `src/components/app-tabs.tsx` y a `/dashboard`, `/home`, `/explore` en
   `src/components/app-tabs.web.tsx`, y eliminar
   `export const unstable_settings = { anchor: 'dashboard' }` de `src/app/(app)/_layout.tsx`.
5. **Cabecera en Home logada.** En `src/app/(app)/_layout.tsx`, eliminar `usePathname()` y el
   condicional `showSessionHeader` para que `SessionHeader` se renderice siempre; en
   `src/components/home-screen.tsx`, excluir el borde `top` del `SafeAreaView` cuando
   `isAuthenticated`, para no duplicar el inset superior que el layout ya consumió. En este punto
   Home logada tiene dos controles de logout (cabecera y CTA) — estado transitorio, la app funciona.
6. **Quitar el CTA de Home logada.** En `src/components/home-screen.tsx`, renderizar el `Pressable`
   solo cuando `!isAuthenticated`, con su etiqueta fija "Iniciar sesión" → `/login`, y sacar
   `logout` de la desestructuración de `useAuth()`.
7. **Verificación manual** (`npm run lint` + arranque de la app):
    - Login con un usuario `@mock.com` → la cabecera muestra el `display_name` nuevo (p. ej.
      `Miguel Pastor`) y el avatar sus dos iniciales (`MP`).
    - Tras el login, el tab seleccionado es **Dashboard**, y el orden de la barra es
      `[Dashboard][Home][Explore]`.
    - Tab Home estando logado → `/home` muestra la **misma cabecera** que Dashboard y Explore, sin
      CTA al final y sin hueco extra sobre el hero.
    - Home sin sesión (`/`) → sigue con su CTA "Iniciar sesión" y su inset superior correcto, sin
      cabecera.
    - Cerrar sesión desde la cabecera en Dashboard, Explore y Home → Home pública en los tres casos.
    - Cerrar y reabrir la app con sesión guardada → Dashboard directo.

    > Nota: verificar en web exige sortear el bug de SSR de la spec `04` (p. ej.
    > `web.output: "single"` en local sin commitear), o verificar en nativo.
8. **Revisión con Impeccable** sobre Home en estado logado, aplicando los ajustes que sugiera.

## Criterios de aceptación

- [x] Existe `scripts/backfill-display-name.sql` con un único `UPDATE` que hace merge sobre
      `raw_user_meta_data` y no filtra por dominio de email.
- [x] Ejecutado el backfill, los 19 usuarios tienen en `user_metadata.display_name` la parte local
      del email con los caracteres no alfanuméricos convertidos en espacios y cada palabra
      capitalizada (`vault_07@mock.com` → `Vault 07`).
- [x] El backfill no borró ninguna otra clave de `raw_user_meta_data`: las 19 filas conservan
      `email_verified`.
- [x] Volver a ejecutar el backfill produce el mismo resultado (es idempotente).
- [ ] `mapSupabaseUser` en `src/contexts/auth-context.tsx` resuelve `displayName` como
      `display_name ?? full_name ?? name ?? email`, sin transformar la cadena.
- [ ] Tras iniciar sesión con un usuario ya backfilleado, `SessionHeader` muestra exactamente el
      `display_name` almacenado en Supabase y `avatarInitials` sus dos iniciales.
- [ ] `src/app/(app)/_layout.tsx` no importa `usePathname` ni contiene condicional alguno sobre la
      cabecera: `SessionHeader` se renderiza en Dashboard, Explore y Home.
- [ ] `src/app/(app)/_layout.tsx` no exporta `unstable_settings`.
- [ ] Con sesión, el orden de la tab bar es `[Dashboard][Home][Explore]` en nativo y en web, y el
      tab seleccionado justo después del login es **Dashboard**.
- [ ] Con sesión, `/home` no muestra ningún botón de CTA: la pantalla termina en la tercera feature
      card.
- [ ] Con sesión, el espaciado sobre el hero de `/home` es el mismo que sobre el contenido de
      Dashboard (sin inset superior duplicado).
- [ ] Sin sesión, `/` sigue mostrando el CTA "Iniciar sesión" que navega a `/login`, con su inset
      superior intacto y sin cabecera.
- [ ] `src/components/home-screen.tsx` ya no llama a `logout()`.
- [ ] Cerrar sesión desde la cabecera funciona en las tres pantallas logadas y deja al usuario en
      Home pública.
- [ ] `npm run lint` pasa sin errores nuevos.
- [ ] Home en estado logado fue revisada con el skill Impeccable y los ajustes sugeridos (si los
      hubo) fueron aplicados.

## Decisiones tomadas y descartadas

1. **El `display_name` se genera ya embellecido en la BD** (`Miguel Pastor`), descartando guardar la
   parte local literal (`miguel.pastor`) y descartando formatearla en la app. *Por qué:* decisión
   explícita del usuario ("mostrémoslo tal como quede almacenado"); mantiene la app como mero lector
   del dato y hace que `avatarInitials`, que parte por espacios, siga dando dos letras sin tocar su
   lógica.
2. **Cualquier carácter no alfanumérico actúa como separador** (`.`, `-`, `_`, `+`…), descartando
   tratar solo el punto. *Por qué:* decisión explícita del usuario; un solo `regexp_replace` los
   cubre todos y evita un segundo backfill cuando entre un email con otro separador.
3. **La clave es `display_name`**, la que usa el panel de Supabase, y se añade como primera opción
   del fallback existente. *Por qué:* decisión explícita del usuario de usar la convención estándar
   de Supabase; conservar `full_name`/`name`/`email` detrás evita romper a cualquier usuario que no
   pase por el backfill.
4. **`UPDATE` con merge (`||`) sobre `raw_user_meta_data`**, descartando reemplazar el objeto
   entero. *Por qué:* decisión explícita del usuario; reemplazarlo borraría `sub`, `email_verified` y
   cualquier clave que Supabase u otra spec haya puesto ahí.
5. **Se actualizan todos los usuarios, sin filtrar por `@mock.com`**, y se sobreescribe siempre.
   *Por qué:* decisión explícita del usuario; hoy todos los usuarios son mock, y la regla "parte
   local del email" es válida para cualquier dominio.
6. **El SQL se commitea en `scripts/backfill-display-name.sql`** en vez de ejecutarse y olvidarse.
   *Por qué:* es una operación de datos que no deja rastro en el código; sin el fichero, dentro de
   tres meses nadie sabrá de dónde salieron esos nombres.
7. **Ningún automatismo para nuevos usuarios** (trigger SQL, hook de sign-up, edge function). *Por
   qué:* no hay sign-up en la app (spec `04` lo dejó fuera), así que no existe el caso "usuario
   nuevo" que haya que cubrir. Si algún día se añade registro, el `display_name` es parte de esa
   spec.
8. **El tab inicial se fija reordenando los triggers a `[Dashboard][Home][Explore]`**, descartando
   `unstable_settings = { initialRouteName: 'dashboard' }` y descartando volver a un
   `router.replace('/dashboard')` tras el login. *Por qué:* los docs de Expo Router del SDK 57 no
   documentan ninguna API de selección inicial para `NativeTabs` —ni `initialRouteName` ni
   `anchor`— y sí documentan que el orden de los triggers determina el orden de la barra y que el
   primero es el inicial. La alternativa imperativa reabriría la decisión nº14 de la spec `06`
   (navegación en manos exclusivas de los guards) y podría mostrar un salto Home→Dashboard.
9. **Se reabre la decisión nº4 de la spec `06`** (Home como primer tab). *Por qué:* consecuencia
   directa de la nº8; el requisito "al logarse el tab debe ser Dashboard" y "Home a la izquierda"
   son incompatibles con las APIs disponibles, y el usuario priorizó el tab inicial.
10. **`unstable_settings` se elimina, no se deja como decoración.** *Por qué:* fue añadido en la
    spec `06` para conseguir justo lo que no consigue; dejarlo ahí haría creer al siguiente lector
    que el tab inicial está resuelto por configuración.
11. **Se reabre la decisión nº9 de la spec `06`** (Home logada sin cabecera): ahora la cabecera está
    en las tres pantallas logadas. *Por qué:* decisión explícita del usuario; la cabecera pasa a ser
    una propiedad del grupo `(app)`, sin excepciones, lo que además elimina la condición frágil
    `usePathname() !== '/home'` que la propia spec `06` señaló como riesgo.
12. **El CTA de Home desaparece con sesión**, descartando dejar dos botones de logout y descartando
    reconvertirlo en "Ir al Dashboard". *Por qué:* decisión explícita del usuario; el logout ya está
    en la cabecera y un CTA a Dashboard duplicaría el tab que tiene al lado.
13. **Home logada no recibe contenido sustituto** del CTA (ni saludo con el `displayName`, ni nada).
    *Por qué:* decisión explícita del usuario; inventar contenido abriría un rediseño que esta spec
    no necesita.
14. **El inset superior de Home se desactiva según `isAuthenticated`**, en vez de añadir una prop a
    `HomeScreen`. *Por qué:* el componente ya lee `useAuth()` para decidir el CTA, así que no se
    introduce una nueva vía de configuración; la spec `06` lo definió explícitamente "sin props".

## Riesgos identificados

- **La sesión cacheada lleva el metadata viejo.** `supabase.auth.getSession()` devuelve la sesión
  guardada en `AsyncStorage`, con el snapshot del usuario tal como estaba al emitirla. Tras ejecutar
  el backfill, un usuario que ya estuviera logado seguirá viendo su `display_name` anterior hasta
  que el token se refresque o vuelva a entrar. La verificación del paso 7 debe hacerse con un
  **logout + login**, no reabriendo la app.
- **El paso 3 depende de que el MCP de Supabase vuelva.** Hoy falla al conectar
  (`CLIENT_HTTP_NOT_IMPLEMENTED`), así que el backfill no se puede ejecutar desde aquí. El resto de
  la spec avanza igual, pero los criterios de aceptación sobre el contenido de `auth.users` quedan
  sin verificar hasta entonces.
- **`auth.users` es una tabla gestionada por Supabase.** El camino oficialmente soportado para tocar
  `user_metadata` es la Admin API (`auth.admin.updateUserById`), no un `UPDATE` directo. El merge
  minimiza el daño posible, pero si el `UPDATE` resultara problemático, el plan B es un script Node
  de un solo uso con la `service_role` key — lo que implicaría manejar ese secreto en local.
- **`initcap` no entiende de nombres propios.** `mcdonald@mock.com` → `Mcdonald`,
  `o.brien@mock.com` → `O Brien`. Se acepta porque son usuarios mock, pero el SQL no es apto tal
  cual para usuarios reales.
- **Un email sin caracteres alfanuméricos en su parte local** dejaría un `display_name` vacío, y con
  él un avatar sin iniciales. No hay validación ni fallback para ese caso.
- **"El primer trigger es el tab inicial" no está afirmado literalmente en los docs del SDK 57** para
  `NativeTabs`: la doc general dice que `index.tsx` es el tab por defecto y que el orden de los
  triggers determina el orden de la barra, pero no hay API explícita de selección inicial y la
  librería sigue siendo `unstable_`. Si al reordenar el tab seleccionado sigue siendo otro, hay que
  caer a los descartes de la decisión nº8 (`initialRouteName`, y si no,
  `router.replace('/dashboard')`).
- **En web el mecanismo es distinto.** `app-tabs.web.tsx` usa `Tabs` de `expo-router/ui`, donde el
  tab activo lo determina la URL. Tras el login, esa URL la decide el guard al montar `(app)`, así
  que es posible que en web se aterrice en `/home` aunque en nativo funcione. Hay que verificar las
  dos plataformas por separado.
- **Home logada gana 56px de cabecera.** El hero baja y el espacio útil se reduce; en pantallas
  pequeñas puede quedar apretado. Es justo lo que el paso 8 (Impeccable) debe mirar.
- **`isAuthenticated` como proxy de "hay una cabecera encima".** Funciona porque hoy `HomeScreen`
  solo se renderiza desde `(public)/index.tsx` y `(app)/home.tsx`. Si mañana se usa en un tercer
  sitio con otra composición, el safe area será incorrecto y el síntoma será puramente visual.
