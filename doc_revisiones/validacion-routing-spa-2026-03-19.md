# Validación del Routing SPA - Cloudflare Pages

**Fecha:** 2026-03-19  
**Proyecto:** cf-cuasar-core  
**Fase:** Fase 1 - Correcciones Frontend  
**Objetivo:** Validar que el routing SPA funciona correctamente en Cloudflare Pages

---

## 1. Información del Despliegue

### URL del Despliegue
- **Nombre del proyecto:** `cb-consulting`
- **URL base:** `https://cb-consulting.pages.dev` (o la URL asignada por Cloudflare Pages)
- **Directorio de build:** `src/frontend/dist`

### Configuración de Cloudflare Pages
- **Archivo de configuración:** [`wrangler.pages.toml`](../wrangler.pages.toml)
- **Fecha de compatibilidad:** 2024-01-01

---

## 2. Configuración de Routing Implementada

### Archivo `_routes.json`

Ubicación: [`src/frontend/_routes.json`](../src/frontend/_routes.json)

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/assets/*", "/favicon.ico"]
}
```

### Explicación de la Configuración

| Propiedad | Valor | Propósito |
|-----------|-------|-----------|
| `version` | 1 | Versión del formato de configuración de routing |
| `include` | `["/*"]` | Incluye todas las rutas para que sean manejadas por el SPA |
| `exclude` | `["/assets/*", "/favicon.ico"]` | Excluye recursos estáticos que no necesitan routing |

**¿Cómo funciona?**
- Todas las solicitudes que no coincidan con los patrones de exclusión se redirigen a `index.html`
- Esto permite que React Router maneje el routing del lado del cliente
- Los recursos estáticos (assets, favicon) se sirven directamente sin redirección

---

## 3. Rutas del SPA

### Rutas Definidas en React Router

Ubicación: [`src/frontend/src/App.tsx`](../src/frontend/src/App.tsx)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | [`Dashboard`](../src/frontend/src/pages/Dashboard.tsx) | Panel de control principal |
| `/projects` | [`ProjectsPage`](../src/frontend/src/pages/ProjectsPage.tsx) | Lista de proyectos |
| `/projects/new` | [`CreateProjectPage`](../src/frontend/src/pages/CreateProjectPage.tsx) | Formulario para crear nuevo proyecto |
| `/projects/:id` | [`ProjectDetailPage`](../src/frontend/src/pages/ProjectDetailPage.tsx) | Detalles de un proyecto específico |
| `/projects/:id/results` | [`ResultsPage`](../src/frontend/src/pages/ResultsPage.tsx) | Resultados de un proyecto |
| `*` | [`NotFoundPage`](../src/frontend/src/pages/NotFoundPage.tsx) | Página 404 para rutas no encontradas |

### Rutas de Navegación del Sidebar

Ubicación: [`src/frontend/src/config/navigation.ts`](../src/frontend/src/config/navigation.ts)

| ID | Etiqueta | Path | Icono |
|----|----------|------|-------|
| `dashboard` | Panel de Control | `/` | LayoutDashboard |
| `projects` | Proyectos | `/projects` | FolderOpen |

---

## 4. Lista de Rutas a Validar

### Rutas Principales
- [ ] `/` - Dashboard (Panel de Control)
- [ ] `/projects` - Lista de Proyectos
- [ ] `/projects/new` - Crear Nuevo Proyecto
- [ ] `/projects/:id` - Detalle de Proyecto (ej: `/projects/123`)
- [ ] `/projects/:id/results` - Resultados de Proyecto (ej: `/projects/123/results`)

### Rutas de Error
- [ ] `/*` (cualquier ruta inválida) - Página 404

### Casos de Validación Especiales
- [ ] **Recarga de página (F5)** en cada ruta principal
- [ ] **Acceso directo por URL** (copiar y pegar URL en nueva pestaña)
- [ ] **Navegación hacia atrás/adelante** en el navegador
- [ ] **Enlaces profundos** (deep links) desde fuentes externas

---

## 5. Pasos para Validar el Routing SPA

### Paso 1: Verificar el Despliegue
1. Acceder a la URL del despliegue: `https://cb-consulting.pages.dev`
2. Verificar que la página cargue correctamente
3. Abrir la consola del navegador (F12) y verificar que no haya errores de carga

### Paso 2: Validar Ruta Principal (Dashboard)
1. Navegar a `/`
2. Verificar que se muestre el Dashboard
3. Recargar la página (F5)
4. **Esperado:** El Dashboard debe cargarse sin errores

### Paso 3: Validar Ruta de Proyectos
1. Hacer clic en "Proyectos" en el sidebar
2. Verificar que se muestre la lista de proyectos
3. Recargar la página (F5)
4. **Esperado:** La lista de proyectos debe cargarse sin errores

### Paso 4: Validar Ruta de Crear Proyecto
1. Hacer clic en el botón "Nuevo Proyecto"
2. Verificar que se muestre el formulario de creación
3. Recargar la página (F5)
4. **Esperado:** El formulario debe cargarse sin errores

### Paso 5: Validar Ruta de Detalle de Proyecto
1. Seleccionar un proyecto existente de la lista
2. Verificar que se muestre el detalle del proyecto
3. Copiar la URL actual
4. Abrir una nueva pestaña y pegar la URL
5. **Esperado:** El detalle del proyecto debe cargarse directamente

### Paso 6: Validar Ruta de Resultados
1. Desde el detalle de un proyecto, navegar a la sección de resultados
2. Verificar que se muestren los resultados
3. Recargar la página (F5)
4. **Esperado:** Los resultados deben cargarse sin errores

### Paso 7: Validar Página 404
1. Acceder a una URL inválida (ej: `/ruta-inexistente`)
2. Verificar que se muestre la página 404
3. **Esperado:** Debe aparecer [`NotFoundPage`](../src/frontend/src/pages/NotFoundPage.tsx)

### Paso 8: Validar Navegación del Historial
1. Navegar entre varias rutas usando el sidebar
2. Usar el botón "Atrás" del navegador
3. Usar el botón "Adelante" del navegador
4. **Esperado:** La navegación debe funcionar correctamente

### Paso 9: Verificar Recursos Estáticos
1. Abrir la pestaña Network de las DevTools
2. Navegar por la aplicación
3. Verificar que los recursos estáticos (CSS, JS, imágenes) se carguen correctamente
4. **Esperado:** Los recursos deben cargarse sin redirecciones innecesarias

---

## 6. Comportamiento Esperado

### Comportamiento del Routing

| Situación | Comportamiento Esperado |
|-----------|-------------------------|
| **Acceso directo por URL** | La aplicación carga y React Router maneja la ruta correctamente |
| **Recarga de página** | La ruta se mantiene y el contenido se recarga sin errores |
| **Navegación por sidebar** | La ruta cambia sin recargar la página (SPA) |
| **Botón atrás/adelante** | La navegación del historial funciona correctamente |
| **Ruta inválida** | Se muestra la página 404 (`NotFoundPage`) |
| **Recursos estáticos** | Se sirven directamente sin pasar por el routing SPA |

### Comportamiento del Servidor (Cloudflare Pages)

| Solicitud | Respuesta |
|-----------|-----------|
| `/` | `index.html` (200 OK) |
| `/projects` | `index.html` (200 OK) |
| `/projects/123` | `index.html` (200 OK) |
| `/assets/main.js` | Archivo estático (200 OK) |
| `/favicon.ico` | Archivo estático (200 OK) |

### Comportamiento del Cliente (React Router)

| Ruta | Componente Renderizado |
|------|------------------------|
| `/` | `Dashboard` dentro de `MainLayout` |
| `/projects` | `ProjectsPage` dentro de `MainLayout` |
| `/projects/new` | `CreateProjectPage` dentro de `MainLayout` |
| `/projects/:id` | `ProjectDetailPage` dentro de `MainLayout` |
| `/projects/:id/results` | `ResultsPage` dentro de `MainLayout` |
| Cualquier otra ruta | `NotFoundPage` |

---

## 7. Problemas Comunes y Soluciones

### Problema: Error 404 al recargar la página

**Síntoma:** Al recargar una ruta como `/projects`, aparece un error 404 del servidor.

**Causa:** El archivo `_routes.json` no está configurado correctamente o no se ha desplegado.

**Solución:**
1. Verificar que [`_routes.json`](../src/frontend/_routes.json) existe en el directorio `src/frontend/`
2. Verificar que el contenido es correcto (ver sección 2)
3. Rehacer el despliegue en Cloudflare Pages

### Problema: Los recursos estáticos no cargan

**Síntoma:** Los archivos CSS, JS o imágenes muestran errores 404.

**Causa:** Los patrones de exclusión en `_routes.json` no están configurados correctamente.

**Solución:**
1. Verificar que `/assets/*` y `/favicon.ico` están en la lista `exclude`
2. Rehacer el despliegue

### Problema: La navegación por sidebar no funciona

**Síntoma:** Al hacer clic en los enlaces del sidebar, la página no cambia.

**Causa:** React Router no está configurado correctamente en [`App.tsx`](../src/frontend/src/App.tsx).

**Solución:**
1. Verificar que `BrowserRouter` envuelve las rutas
2. Verificar que los componentes `Link` de `react-router-dom` se usan correctamente

---

## 8. Checklist de Validación

### Pre-Despliegue
- [ ] Archivo `_routes.json` existe en `src/frontend/`
- [ ] Configuración de `include` y `exclude` es correcta
- [ ] React Router está configurado en `App.tsx`
- [ ] Todas las rutas están definidas correctamente

### Post-Despliegue
- [ ] El despliegue se completó sin errores
- [ ] La URL base es accesible
- [ ] Todas las rutas principales funcionan
- [ ] La recarga de página funciona en todas las rutas
- [ ] La navegación por historial funciona
- [ ] La página 404 se muestra para rutas inválidas
- [ ] Los recursos estáticos cargan correctamente

---

## 9. Referencias

- [Documentación de Cloudflare Pages - Routing](https://developers.cloudflare.com/pages/configuration/headers/)
- [Documentación de React Router](https://reactrouter.com/)
- [Archivo de configuración](../wrangler.pages.toml)
- [Configuración de routing](../src/frontend/_routes.json)
- [Rutas de la aplicación](../src/frontend/src/App.tsx)
- [Configuración de navegación](../src/frontend/src/config/navigation.ts)

---

**Estado del documento:** ✅ Completado  
**Próxima revisión:** Post-despliegue para validar resultados
