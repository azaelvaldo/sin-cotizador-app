## Cotizador App – Arquitectura, prácticas y funcionalidades

Aplicación web de cotizaciones agrícolas construida con Next.js (App Router) y TypeScript. El objetivo es ofrecer un flujo completo para crear, listar y consultar cotizaciones, con filtros avanzados, paginación, geocercas sobre mapa y un centro de alertas.

### Tecnologías principales
- **Next.js (App Router)** y **TypeScript**
- **@tanstack/react-query** para fetching/caché/invalidación
- **Shadcn UI/Radix** para componentes accesibles (Dialog, Select, Table, etc.)
- **Leaflet + leaflet-draw + turf** para geocercas y cálculo de áreas
- **Lucide** para iconos
---

## Arquitectura y organización

### Estructura relevante
- `src/app` – Entradas de páginas/layouts (App Router)
- `src/components` – Componentes UI y vistas (tabla, formularios, modales, navbar, etc.)
- `src/hooks` – Hooks de dominio (e.g. `use-quotation`, `use-crop`, `use-state`, `use-debounce`)
- `src/services` – Capa de acceso a datos (fetchers HTTP tipados)
- `src/contexts` – Contextos globales (e.g. sesión/auth)
- `src/context/query-provider.tsx` – Proveedor de React Query (cliente y opciones por defecto)
- `src/types` – Tipos compartidos y contratos de datos

### Flujo de datos
1. Componentes de UI construyen filtros y parámetros (búsqueda, estado, cultivo, etc.).
2. Hooks de dominio (e.g. `useQuotations`) consultan la capa de `services` con **React Query**, usando claves de caché derivadas de los filtros.
3. La capa de `services` compone URL y headers, y devuelve respuestas tipadas.
4. Los componentes renderizan datos y controlan interacción (paginación, diálogos, exportaciones, etc.).

---

## Estado, sesión y proveedores

### React Query Provider
`src/context/query-provider.tsx` configura **staleTime** (30s) y reintentos, centralizando el cliente. Esto evita duplicación y optimiza la cohesión del fetching.

### Contexto de Autenticación
`src/contexts/auth-context.tsx` expone `user`, `login`, `logout` y `isLoading`. La sesión se hidrata desde `localStorage` y se limpia al cerrar sesión. Este contexto permite proteger vistas y propagar el usuario actual a `services`/UI cuando sea necesario.

---

## Datos y fetching con React Query

### Hook de cotizaciones (`use-quotation.ts`)
- Expone `{ quotations, total, page, pageSize, totalPages, isLoading, error, refetch, createQuotation }`.
- Claves de caché incluyen todos los filtros para garantizar coherencia.
- `createQuotation` invalida `'quotations'` al éxito para refrescar la lista.

### Capa de servicios (`src/services/*.ts`)
- `fetchQuotations(filters)` construye `URLSearchParams` a partir de los filtros, incluyendo: `search`, `cropId`, `stateId`, `status`, `insuredAmount`, `page`, `pageSize`, `sortKey`, `sortDirection` y `dateRange`.
- Las respuestas paginadas siguen la forma:
  ```json
  {
    "data": [...],
    "pagination": { "total": 12, "page": 0, "pageSize": 10, "totalPages": 2 }
  }
  ```
- El proyecto usa **paginación 0‑based** (páginas desde 0 a `totalPages - 1`).

### Búsqueda y rendimiento
- `use-debounce` desacopla el input del usuario de la consulta HTTP, evitando peticiones en cada pulsación.
- Selects de Cultivos/Estados traen los primeros 5 ítems y, mediante un campo de búsqueda dentro del dropdown, consultan al backend con el término (server‑side search) tras el debounce.

---

## UI y patrones de componentes

### Tabla de cotizaciones
- Filtros: texto, estado, cultivo y estado (MX) con inputs debounced.
- Paginación 0‑based con navegación anterior/siguiente, y rango mostrado calculado a partir de `page` y `pageSize`.
- Exportación a **CSV** (y placeholder para PDF).
- Accesibilidad: Dialog con `DialogTitle` obligatorio para lectores de pantalla.

### Modal de detalle de cotización
- `src/components/quotation-info.tsx` – Vista de sólo lectura, inspirada en tarjetas informativas (cliente, financiero, período y área), más el **mapa** debajo.
- El **mapa** se renderiza con `GeofenceMap` en modo `readOnly` y acepta `initialGeofence` (GeoJSON). Se usa **dynamic import** para evitar SSR de Leaflet.

### Geocercas y mapa
- `src/components/geofence-map.tsx` combina Leaflet + leaflet-draw para dibujar polígonos.
- Cálculo de área con **turf** y reporte en hectáreas.
- Modo `readOnly` deshabilita el control de dibujo y oculta el botón de “Limpiar mapa”.

### Centro de alertas
- `alerts-dropdown` recibe eventos por WebSocket (e.g. `HIGH_AREA_ALERT`) y los mapea a alertas visuales. Como fallback se usa persistencia simple en `localStorage` (en `alerts-panel`).

---

## Buenas prácticas aplicadas
- **Tipado estricto** en hooks y servicios; contratos centralizados en `src/types`.
- **Separación de capas**: UI (componentes) ↔ hooks (dominio) ↔ services (HTTP) ↔ tipos.
- **React Query** para sincronización de datos, caché e invalidación en mutaciones.
- **Rendimiento**: `useDebounce` para búsqueda; `dynamic()` para Leaflet; uso de `staleTime` para reducir refetching.
- **Accesibilidad**: `DialogTitle` obligatorio; componentes de Radix/shadcn como base.
- **UX**: selects con búsqueda, placeholders consistentes, triggers con min-width para evitar “saltos”.
- **0-based pagination** coherente de extremo a extremo.

---

## Puesta en marcha

### Requisitos
- Node 18+
- pnpm/yarn/npm

### Desarrollo
```bash
npm install
npm run dev
# http://localhost:3000
```

### Produccion
```bash
npm install
npm run build
npm start
# http://localhost:3000
```
---

## Funcionalidades clave del proyecto
- Vistas diferenciadas por rol de usuario:
  - `Admin` → `src/components/views/admin-view.tsx`: panel con estadísticas, tabs (Cotizaciones, Nueva, Alertas, Reportes), tabla global y creación.
  - `Usuario` → `src/components/views/user-view.tsx`: formulario de nueva cotización y listado de "Mis cotizaciones" (pendientes) en la misma vista.
- Alta de cotizaciones con validaciones de negocio (fechas, montos, áreas > 0).
- Listado con filtros avanzados, paginación 0‑based y exportación CSV.
- Geocerca editable (en formulario) y sólo lectura (en detalle), con cálculo de hectáreas.
- Centro de alertas con soporte a eventos en tiempo real (`HIGH_AREA_ALERT`).
- Contexto de sesión y proveedor de React Query.

---

## Mejoras sugeridas

- **Variables de entorno**: Mover URLs de API (`localhost:4000`) a variables de entorno
- **Tipado del mapa**: Definir tipos específicos para props de `GeofenceMap` (GeoJSON)
- **Manejo de errores**: Implementar toast/notificaciones para errores de API
- **Tests unitarios**: Agregar tests para hooks y servicios críticos
- **Guards de rol**: Implementar protección de rutas basada en roles de usuario
- **CI/CD**: Configurar linting y formateo automático en pipeline



