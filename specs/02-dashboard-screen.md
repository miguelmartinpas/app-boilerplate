# 02 - Pantalla de Dashboard

## Header

**Estado:** Draft
**Dependencias:** `01-design-system-theming` (usa `Colors.primary/secondary/tertiary`, `ThemedView`/`ThemedText`, `ThemeFonts`)
**Fecha:** 2026-09-14

**Objetivo:** Crear una pantalla de Dashboard genérica y sobria — header con usuario/avatar, stat cards y lista de actividad reciente — como nuevo tab principal de la app, con datos mock, un estado de loading realista (delay simulado) y un placeholder de autenticación, consumiendo el sistema de theming de la spec `01-design-system-theming`.

## Scope

**Incluye:**

- Nueva ruta `src/app/dashboard.tsx`, agregada como **primer tab** (antes de `index`/`explore`) en `src/components/app-tabs.tsx` y su contraparte `app-tabs.web.tsx`.
- Hook placeholder de autenticación `src/hooks/use-auth.ts` (`useAuth()`), devuelve un usuario mock fijo y `isAuthenticated: true` — listo para que una futura spec de Login lo reemplace por lógica real.
- Hook de datos `src/hooks/use-dashboard-data.ts` (`useDashboardData()`) con datos hardcodeados y un delay simulado (~800ms) que expone un estado `isLoading` realista.
- Componentes de UI en `src/components/dashboard/`:
  - `dashboard-header.tsx` — nombre del usuario + avatar de iniciales (círculo con color `primary` del theme activo).
  - `stat-card.tsx` — tarjeta de métrica con acento de color variable (`primary`/`secondary`/`tertiary`).
  - `activity-list.tsx` — lista de actividad reciente, con **estado vacío** soportado (mensaje sobrio cuando no hay items).
  - Skeletons de loading para el header, las stat cards y la lista de actividad, mostrados mientras `isLoading` es `true`.
- Uso de `SymbolView` (`expo-symbols`) para los iconos, consistente con el resto del proyecto (`explore.tsx`, `collapsible.tsx`).
- Uso del sistema de theming de la spec `01` (`Colors`, `ThemedView`/`ThemedText`, `ThemeFonts`) — el Dashboard debe verse distinto según `EXPO_PUBLIC_THEME`.
- Paso final de verificación con el skill **Impeccable** sobre la pantalla ya implementada, para pulir jerarquía visual/espaciado antes de dar la implementación por terminada.

**No incluye:**

- Autenticación real ni pantalla de Login — spec futura. `useAuth()` es un mock fijo, sin lógica de login/logout.
- Conexión a un backend/API real — todos los datos son estáticos, no hay fetch real.
- Gráficos/charts — solo stat cards y lista de actividad.
- Pull-to-refresh, revalidación o cualquier tipo de sincronización de datos.
- Guard de rutas o redirección si no autenticado (no aplica todavía, no hay Login).
- Avatar con imagen real — solo iniciales.

## Modelo de datos

**`src/hooks/use-auth.ts`**

```ts
export type AuthUser = {
  name: string;
  email: string;
  avatarInitials: string;
};

export function useAuth(): { user: AuthUser; isAuthenticated: boolean } {
  return {
    user: { name: 'Jordan Rivera', email: 'jordan.rivera@example.com', avatarInitials: 'JR' },
    isAuthenticated: true,
  };
}
```

**`src/hooks/use-dashboard-data.ts`**

```ts
export type StatCardData = {
  id: string;
  label: string;
  value: string;
  icon: string; // nombre de SF Symbol para SymbolView
  colorToken: 'primary' | 'secondary' | 'tertiary';
};

export type ActivityItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string; // texto legible, ej. "Hace 2 horas"
  icon: string;
};

const MOCK_STATS: StatCardData[] = [
  { id: 'users', label: 'Usuarios activos', value: '1,204', icon: 'person.2.fill', colorToken: 'primary' },
  { id: 'revenue', label: 'Ingresos', value: '$8,940', icon: 'dollarsign.circle.fill', colorToken: 'secondary' },
  { id: 'tasks', label: 'Tareas completadas', value: '87', icon: 'checkmark.circle.fill', colorToken: 'tertiary' },
];

const MOCK_ACTIVITY: ActivityItem[] = [
  { id: '1', title: 'Nuevo usuario registrado', description: 'Ada Lovelace se unió al equipo', timestamp: 'Hace 12 min', icon: 'person.badge.plus' },
  { id: '2', title: 'Pago recibido', description: 'Factura #1042 pagada', timestamp: 'Hace 1 hora', icon: 'creditcard.fill' },
  { id: '3', title: 'Tarea completada', description: '"Revisar diseño" marcada como hecha', timestamp: 'Hace 3 horas', icon: 'checkmark.seal.fill' },
];

export function useDashboardData() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatCardData[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStats(MOCK_STATS);
      setActivity(MOCK_ACTIVITY);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timeout);
  }, []);

  return { isLoading, stats, activity };
}
```

**Componentes** (props, sin lógica propia de datos):

- `StatCard`: `{ data: StatCardData }`.
- `ActivityList`: `{ items: ActivityItem[] }` — si `items.length === 0`, renderiza el estado vacío.
- `DashboardHeader`: `{ user: AuthUser }`.
- Skeletons: `StatCardSkeleton`, `ActivityListSkeleton`, `DashboardHeaderSkeleton` — sin props, solo placeholders visuales.

## Plan de implementación

1. Crear `src/hooks/use-auth.ts` con `useAuth()` devolviendo el usuario mock fijo y `isAuthenticated: true`.
2. Crear `src/hooks/use-dashboard-data.ts` con los tipos `StatCardData`/`ActivityItem`, los datos mock (`MOCK_STATS`, `MOCK_ACTIVITY`) y `useDashboardData()` con el delay simulado de ~800ms.
3. Crear `src/components/dashboard/dashboard-header.tsx` (avatar de iniciales con color `primary` + nombre del usuario, usando `ThemedText`/`ThemedView`) y su `dashboard-header-skeleton.tsx`.
4. Crear `src/components/dashboard/stat-card.tsx` (tarjeta con icono `SymbolView`, label, valor y acento de color según `colorToken`) y su `stat-card-skeleton.tsx`.
5. Crear `src/components/dashboard/activity-list.tsx` (lista de `ActivityItem`, con estado vacío sobrio cuando `items.length === 0`) y su `activity-list-skeleton.tsx`.
6. Crear `src/app/dashboard.tsx`: compone `DashboardHeader`, la fila de `StatCard` y `ActivityList`, mostrando los skeletons correspondientes mientras `useDashboardData().isLoading` es `true`.
7. Registrar la ruta como primer tab en `src/components/app-tabs.tsx` y `src/components/app-tabs.web.tsx` (label "Dashboard", icono `SymbolView` acorde), antes de `index` y `explore`.
8. Verificación manual: `npm run lint`, arrancar la app (`npm start`), confirmar que el tab "Dashboard" aparece primero, que el loading se ve brevemente antes de los datos mock, y que cambiando `EXPO_PUBLIC_THEME` (`default`/`corporate`/`vibrant`) el acento de las stat cards y el avatar cambian de color.
9. Pasar la pantalla terminada por el skill **Impeccable** para revisión/pulido visual final (jerarquía, espaciado, tipografía) y aplicar los ajustes que sugiera.

## Criterios de aceptación

- [ ] Existe la ruta `src/app/dashboard.tsx` y aparece como **primer tab** en `app-tabs.tsx`/`app-tabs.web.tsx`, antes de `index` y `explore`.
- [ ] `useAuth()` devuelve un `AuthUser` mock fijo (`name`, `email`, `avatarInitials`) e `isAuthenticated: true`.
- [ ] `useDashboardData()` empieza con `isLoading: true`, `stats: []`, `activity: []`, y tras ~800ms pasa a `isLoading: false` con `MOCK_STATS`/`MOCK_ACTIVITY` pobladas.
- [ ] Mientras `isLoading` es `true`, la pantalla muestra `DashboardHeaderSkeleton`, `StatCardSkeleton` (×3) y `ActivityListSkeleton` en vez del contenido final.
- [ ] Tras el loading, se ve el header con nombre + avatar de iniciales, 3 stat cards (cada una con su `colorToken` distinto) y la lista de 3 items de actividad.
- [ ] `ActivityList` renderiza un estado vacío sobrio cuando recibe `items: []` (verificable pasando un array vacío manualmente).
- [ ] Cambiar `EXPO_PUBLIC_THEME` entre `default`/`corporate`/`vibrant` cambia visualmente el color del avatar y de los acentos de las stat cards, sin tocar código de la pantalla.
- [ ] Todos los iconos usan `SymbolView` de `expo-symbols`, consistente con `explore.tsx`/`collapsible.tsx`.
- [ ] `npm run lint` pasa sin errores nuevos.
- [ ] La pantalla fue revisada con el skill Impeccable y los ajustes sugeridos (si los hubo) fueron aplicados.

## Decisiones tomadas y descartadas

1. **Dashboard como tab nuevo e independiente** (primero en el orden), en vez de reemplazar `index.tsx`. *Por qué:* decisión explícita del usuario — conserva la pantalla de ejemplo existente y da al Dashboard la posición de entrada principal de la app.
2. **Placeholder de auth (`useAuth()` mock fijo)** en vez de dejar el Dashboard sin ningún concepto de usuario. *Por qué:* decisión explícita del usuario — deja el punto de integración listo para cuando exista una spec de Login real, sin bloquear esta spec con lógica de autenticación.
3. **Datos hardcodeados con delay simulado**, en vez de una capa de servicio/API real. *Por qué:* no hay backend definido todavía; simular el delay documenta el patrón de loading sin necesitar infraestructura real.
4. **Estado vacío soportado en `ActivityList`**, aunque hoy nunca ocurra con datos mock. *Por qué:* bajo costo, deja el componente listo para datos reales que sí puedan venir vacíos.
5. **Sin gráficos/charts**, solo stat cards + lista de actividad. *Por qué:* mantener el dashboard "genérico" simple; un chart implica elegir librería y modelo de datos adicional, fuera del alcance de esta spec.
6. **`expo-symbols` (`SymbolView`) para iconos**, en vez de introducir una librería de iconos nueva. *Por qué:* ya es el patrón usado en `explore.tsx` y `collapsible.tsx`; mantiene consistencia sin nuevas dependencias.
7. **Revisión con Impeccable como último paso del plan**, no como guía de diseño previa. *Por qué:* el skill pule una implementación ya construida; aplicarlo antes de tener código no aporta valor.

## Riesgos identificados

- **Dependencia de la spec `01-design-system-theming`.** Si esa spec no está implementada (o cambia sus nombres de exports) antes de implementar este Dashboard, `Colors.primary/secondary/tertiary` y `ThemeFonts` no existirán todavía — este Dashboard no puede implementarse de forma aislada.
- **`SymbolView` (SF Symbols) es nativo de iOS.** El comportamiento en Android/web depende de cómo `expo-symbols` resuelva esos símbolos en esas plataformas (fallback o render distinto) — conviene verificar visualmente en las 3 plataformas durante el paso 8 del plan, no asumir que se ve igual.
