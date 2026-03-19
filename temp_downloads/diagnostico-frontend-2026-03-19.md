# Diagnóstico Técnico - Frontend VaaIA

**Fecha:** 2026-03-19  
**Proyecto:** cf-cuasar-core-plzc (VaaIA)  
**URL Afectada:** https://cb-consulting.pages.dev  
**Reporte:** UI no se renderiza correctamente, sidebar duplicado, enlaces no funcionan

---

## 1. Resumen Ejecutivo

### Problema Reportado
El frontend no se está mostrando correctamente. Solo se visualiza el sidebar repetido dos veces y el contenido principal está en blanco. Los enlaces del sidebar parecen no responder.

### Causa Raíz Principal
**Tres problemas críticos bloquean completamente el funcionamiento del frontend:**

1. **Falta `<Outlet />` de React Router en MainLayout** - El contenido de las rutas nunca se renderiza
2. **Sidebar sin control responsive** - Se renderiza en móvil y desktop simultáneamente
3. **Header con conflicto de clases CSS** - Ignora el estado colapsado del sidebar

### Estado de los Enlaces
**Los enlaces del sidebar SÍ funcionan correctamente.** El problema es que al no renderizarse el contenido principal (por falta de Outlet), parece que no responden. Los `Link` de `react-router-dom` están bien implementados.

---

## 2. Problemas Identificados

### 2.1 Problemas Críticos (Bloqueantes)

| ID | Categoría | Descripción | Archivo | Severidad |
|----|-----------|-------------|---------|-----------|
| **UI-001** | Rendering | MainLayout no usa `<Outlet />` para renderizar rutas anidadas. Usa `{children}` que está undefined. | `src/frontend/src/components/layout/MainLayout.tsx` | 🔴 Critical |
| **UI-002** | Rendering | Sidebar desktop se renderiza sin clases responsive. Debería tener `hidden lg:block`. | `src/frontend/src/components/layout/MainLayout.tsx` | 🔴 Critical |
| **UI-003** | Styling | Header tiene conflicto de clases: `lg:left-16 lg:left-64`. La última gana siempre. | `src/frontend/src/components/layout/Header.tsx` | 🔴 Critical |

### 2.2 Problemas Secundarios (No Bloqueantes)

| ID | Categoría | Descripción | Archivo | Severidad |
|----|-----------|-------------|---------|-----------|
| **UI-004** | Navigation | `useLocation()` duplicado en Sidebar. Recibe `activePath` pero también llama `useLocation()`. | `src/frontend/src/components/layout/Sidebar.tsx` | 🟡 Medium |
| **UI-005** | Build | Tailwind v4 syntax en globals.css pero tailwind.config.js usa formato v3. | `src/frontend/src/styles/globals.css` | 🟡 Medium |
| **UI-006** | Styling | Header no recibe estado `collapsed` del sidebar para ajustar posición. | `src/frontend/src/components/layout/Header.tsx` | 🟡 Low |
| **DEPLOY-001** | Build | Directorio `dist` no existe localmente. Imposible verificar artifacts del build. | `src/frontend/` | 🟡 Medium |
| **DEPLOY-003** | Config | Falta `base` path en vite.config.ts. Assets pueden no cargar en Pages. | `src/frontend/vite.config.ts` | 🟡 Medium |
| **DEPLOY-004** | Routing | React Router con BrowserRouter necesita SPA rewrites en Cloudflare Pages. | `src/frontend/` | 🟡 Medium |

---

## 3. Análisis Detallado

### 3.1 Problema UI-001: Falta de `<Outlet />` en MainLayout

**Archivo:** `src/frontend/src/components/layout/MainLayout.tsx`

**Código Actual (Líneas 33-89):**
```tsx
const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  sidebarCollapsed: externalCollapsed
}) => {
  // ...
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar ... />
      
      {/* Header */}
      <Header ... />
      
      {/* Main content */}
      <main className={...}>
        <div className="p-4 lg:p-6">
          {children}  // ❌ ESTO ESTÁ UNDEFINED
        </div>
      </main>
    </div>
  );
};
```

**Problema:** En React Router v6/v7, cuando defines rutas anidadas como en `App.tsx`:

```tsx
<Route path="/" element={<MainLayout />}>
  <Route index element={<Dashboard />} />
  <Route path="projects" element={<ProjectsPage />} />
  {/* ... */}
</Route>
```

El componente padre (`MainLayout`) debe usar `<Outlet />` para indicar DÓNDE renderizar los child routes. `{children}` está undefined porque las rutas no se pasan como children de React, sino como configuración del router.

**Solución:**
```tsx
import { Outlet } from 'react-router-dom';

// ...
<div className="p-4 lg:p-6">
  <Outlet />  // ✅ Esto renderiza Dashboard, ProjectsPage, etc.
</div>
```

---

### 3.2 Problema UI-002: Sidebar sin Control Responsive

**Archivo:** `src/frontend/src/components/layout/MainLayout.tsx`

**Código Actual (Líneas 33-39):**
```tsx
{/* Sidebar */}
<Sidebar
  items={navigationItems}
  collapsed={sidebarCollapsed}
  onToggle={handleToggleSidebar}
  activePath={location.pathname}
/>
```

**Problema:** El Sidebar desktop se renderiza en TODOS los tamaños de pantalla, incluyendo móvil. No tiene clases responsive.

**Código Adicional (Líneas 46-55):**
```tsx
{/* Mobile sidebar */}
<div className={`
  fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:hidden
  ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
`}>
  <Sidebar ... />
</div>
```

El mobile sidebar tiene `lg:hidden` (correcto), pero el desktop sidebar no tiene `hidden lg:block`.

**Solución:**
```tsx
{/* Sidebar - Solo desktop */}
<Sidebar
  items={navigationItems}
  collapsed={sidebarCollapsed}
  onToggle={handleToggleSidebar}
  activePath={location.pathname}
  className="hidden lg:block"  // ✅ Solo visible en desktop
/>
```

O alternativamente, agregar las clases directamente en el componente Sidebar dentro de MainLayout.

---

### 3.3 Problema UI-003: Conflicto de Clases CSS en Header

**Archivo:** `src/frontend/src/components/layout/Header.tsx`

**Código Actual (Línea 13):**
```tsx
<header className="fixed top-0 right-0 left-0 lg:left-16 lg:left-64 h-16 bg-white border-b border-gray-200 z-40 transition-all duration-300">
```

**Problema:** Ambas clases tienen el mismo prefijo `lg:`, por lo que `lg:left-64` siempre prevalece, incluso cuando `sidebarCollapsed=true`.

**Solución:**
```tsx
// 1. Agregar prop sidebarCollapsed a HeaderProps
interface HeaderProps {
  sidebarCollapsed?: boolean;  // ✅ Nueva prop
  // ...
}

// 2. Usar clases condicionales
<header className={`
  fixed top-0 right-0 left-0 h-16 bg-white border-b border-gray-200 z-40 transition-all duration-300
  ${sidebarCollapsed ? 'lg:left-16' : 'lg:left-64'}  // ✅ Condicional
`}>
```

---

### 3.4 Problema UI-004: useLocation Duplicado en Sidebar

**Archivo:** `src/frontend/src/components/layout/Sidebar.tsx`

**Código Actual (Líneas 12-14, 37):**
```tsx
const Sidebar: React.FC<SidebarProps> = ({
  items = navigationItems,
  // ...
  activePath
}) => {
  const location = useLocation();  // ❌ Redundante
  // ...
  
  const isActive = activePath === item.path || location.pathname === item.path;  // ❌ Duplicado
```

**Problema:** MainLayout ya obtiene `location.pathname` y lo pasa como `activePath`. Sidebar no necesita su propio `useLocation()`.

**Solución:**
```tsx
const Sidebar: React.FC<SidebarProps> = ({
  items = navigationItems,
  collapsed = false,
  onToggle,
  activePath  // ✅ Usar solo esto
}) => {
  // Remover: const location = useLocation();
  
  const isActive = activePath === item.path;  // ✅ Simplificado
```

---

### 3.5 Problema UI-005: Tailwind v4/v3 Inconsistente

**Archivos:**
- `src/frontend/src/styles/globals.css` (Línea 1)
- `src/frontend/tailwind.config.js`

**Evidencia:**
```css
/* globals.css - Sintaxis v4 */
@import "tailwindcss";
```

```js
// tailwind.config.js - Formato v3
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

**Problema:** Tailwind v4 usa configuración diferente (CSS-first). La migración está incompleta.

**Recomendación:** Verificar versión instalada en `package.json` y actualizar configuración consistentemente.

---

### 3.6 Problemas de Despliegue (Cloudflare Pages)

#### DEPLOY-001: Directorio `dist` Inexistente

**Evidencia:** Búsqueda glob `**/dist/**/*` no encontró archivos.

**Problema:** No hay evidencia local de que el build se haya ejecutado correctamente. Los artifacts no se están persistiendo o el build falla.

**Acción:** Ejecutar `npm run build:frontend` localmente para verificar generación.

---

#### DEPLOY-003: Falta Base Path en Vite Config

**Archivo:** `src/frontend/vite.config.ts`

**Código Actual:**
```typescript
build: {
  outDir: path.resolve(__dirname, 'dist'),
  sourcemap: true,
},
// ❌ No hay configuración 'base'
```

**Problema:** Para Cloudflare Pages, los assets deberían usar rutas relativas o base explícita.

**Solución:**
```typescript
export default defineConfig({
  // ...
  base: './',  // ✅ Rutas relativas para assets
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    sourcemap: true,
  },
});
```

---

#### DEPLOY-004: React Router Necesita SPA Rewrites

**Archivo:** `src/frontend/src/App.tsx`

**Problema:** BrowserRouter requiere configuración de rewrites en Cloudflare Pages para SPA routing.

**Solución:** Crear archivo `src/frontend/_routes.json`:
```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/assets/*"]
}
```

O archivo `src/frontend/404.html` que redirija a `index.html`.

---

## 4. Componentes Afectados

| Componente | Archivo | Problemas |
|------------|---------|-----------|
| MainLayout | `src/frontend/src/components/layout/MainLayout.tsx` | UI-001, UI-002 |
| Header | `src/frontend/src/components/layout/Header.tsx` | UI-003, UI-006 |
| Sidebar | `src/frontend/src/components/layout/Sidebar.tsx` | UI-004 |
| Dashboard | `src/frontend/src/pages/Dashboard.tsx` | No se renderiza (consecuencia) |
| ProjectsPage | `src/frontend/src/pages/ProjectsPage.tsx` | No se renderiza (consecuencia) |
| CreateProjectPage | `src/frontend/src/pages/CreateProjectPage.tsx` | No se renderiza (consecuencia) |
| ProjectDetailPage | `src/frontend/src/pages/ProjectDetailPage.tsx` | No se renderiza (consecuencia) |
| ResultsPage | `src/frontend/src/pages/ResultsPage.tsx` | No se renderiza (consecuencia) |
| NotFoundPage | `src/frontend/src/pages/NotFoundPage.tsx` | No se renderiza (consecuencia) |

---

## 5. Acciones Correctivas Recomendadas

### 5.1 Prioridad ALTA (Bloqueantes - Corregir Inmediatamente)

| # | Acción | Archivo | Impacto Esperado |
|---|--------|---------|------------------|
| 1 | Agregar `<Outlet />` de react-router-dom en MainLayout.tsx | `MainLayout.tsx` | El contenido principal (Dashboard, Projects, etc.) comenzará a renderizarse correctamente |
| 2 | Agregar clases responsive `hidden lg:block` al Sidebar desktop | `MainLayout.tsx` | El sidebar solo se mostrará en desktop, eliminando la duplicación |
| 3 | Pasar prop `sidebarCollapsed` a Header y usar clases condicionales para `left` positioning | `Header.tsx` | El Header se ajustará correctamente cuando el sidebar esté colapsado/expandido |

### 5.2 Prioridad MEDIA (Mejoras - Corregir Después)

| # | Acción | Archivo | Impacto Esperado |
|---|--------|---------|------------------|
| 4 | Remover `useLocation()` redundante en Sidebar.tsx | `Sidebar.tsx` | Código más limpio y menos re-renders innecesarios |
| 5 | Agregar `base: './'` en vite.config.ts | `vite.config.ts` | Assets cargarán correctamente en Cloudflare Pages |
| 6 | Crear archivo `_routes.json` para SPA rewrites | `_routes.json` | Navegación funcionará en refresh de página |
| 7 | Verificar compatibilidad Tailwind v4 y actualizar config | `tailwind.config.js` | Prevenir errores de build futuros |

### 5.3 Prioridad BAJA (Optimizaciones)

| # | Acción | Impacto Esperado |
|---|--------|------------------|
| 8 | Crear directorio `public/` con assets estáticos | Favicon y assets disponibles |
| 9 | Documentar proceso de deploy del frontend en `.governance/metodo_despliegue.md` | Mejor trazabilidad |
| 10 | Ejecutar build localmente para verificar artifacts | Confirmar que el build funciona |

---

## 6. Código de Solución (Prioridad ALTA)

### 6.1 MainLayout.tsx - Correcciones UI-001 y UI-002

```tsx
import React, { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';  // ✅ Agregar Outlet
import Sidebar from './Sidebar';
import Header from './Header';
import type { MainLayoutProps } from '../../types/components';
import { navigationItems } from '../../config/navigation';

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  sidebarCollapsed: externalCollapsed
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const sidebarCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const handleToggleSidebar = () => {
    setInternalCollapsed(!internalCollapsed);
  };

  const handleMobileMenuClick = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Solo desktop */}
      <div className="hidden lg:block">  {/* ✅ Agregar contenedor responsive */}
        <Sidebar
          items={navigationItems}
          collapsed={sidebarCollapsed}
          onToggle={handleToggleSidebar}
          activePath={location.pathname}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobile sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:hidden
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar
          items={navigationItems}
          collapsed={false}
          activePath={location.pathname}
        />
      </div>

      {/* Header */}
      <Header
        sidebarCollapsed={sidebarCollapsed}  // ✅ Pasar estado al Header
        onMenuClick={handleMobileMenuClick}
        onLogout={() => console.log('Logout')}
      />

      {/* Main content */}
      <main
        className={`
          pt-16 transition-all duration-300
          ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}
        `}
      >
        <div className="p-4 lg:p-6">
          <Outlet />  // ✅ Reemplazar {children} con Outlet
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
```

### 6.2 Header.tsx - Corrección UI-003

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import type { HeaderProps } from '../../types/components';  // ✅ Actualizar tipo
import { uiTexts } from '../../config/texts';

// ✅ Actualizar interfaz para incluir sidebarCollapsed
interface UpdatedHeaderProps extends HeaderProps {
  sidebarCollapsed?: boolean;
}

const Header: React.FC<UpdatedHeaderProps> = ({
  userName = 'Usuario',
  userAvatar,
  sidebarCollapsed = false,  // ✅ Nueva prop
  onMenuClick,
  onLogout
}) => {
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  return (
    <header className={`
      fixed top-0 right-0 left-0 h-16 bg-white border-b border-gray-200 z-40 transition-all duration-300
      ${sidebarCollapsed ? 'lg:left-16' : 'lg:left-64'}  // ✅ Clases condicionales
    `}>
      {/* ... resto del código ... */}
    </header>
  );
};

export default Header;
```

### 6.3 vite.config.ts - Corrección DEPLOY-003

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname),
  publicDir: 'public',
  base: './',  // ✅ Agregar para rutas relativas en Pages
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    strictPort: false,
    open: false,
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    sourcemap: true,
  },
  envPrefix: 'VITE_',
});
```

### 6.4 _routes.json - Corrección DEPLOY-004

Crear archivo `src/frontend/_routes.json`:

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/assets/*", "/favicon.ico"]
}
```

---

## 7. Verificación Post-Corrección

Después de aplicar las correcciones, ejecutar:

```bash
# 1. Typecheck
npm run typecheck:frontend

# 2. Build
npm run build:frontend

# 3. Verificar directorio dist
ls -la src/frontend/dist/

# 4. Deploy (si todo está correcto)
# Usar método de despliegue documentado para Cloudflare Pages
```

---

## 8. Metodología de Diagnóstico

Este diagnóstico fue realizado siguiendo el enfoque del agente orquestador (`.agents/orquestador.md`):

1. **Fase 1 - Normalización:** Análisis del problema reportado
2. **Fase 2 - Puerta de Reglas:** Verificación de cumplimiento de reglas del proyecto
3. **Fase 3 - Diagnóstico UI:** Investigación de causa raíz de renderizado (agente `frontend-react`)
4. **Fase 4 - Diagnóstico Deploy:** Investigación de despliegue en Cloudflare Pages (agente `cloudflare-wrangler-deploy`)
5. **Fase 5 - Síntesis:** Integración de hallazgos y acciones correctivas

**Agentes involucrados:**
- `frontend-react` - Diagnóstico de componentes React, navegación y estilos
- `cloudflare-wrangler-deploy` - Diagnóstico de despliegue en Cloudflare Pages

**Documentos consultados:**
- `.governance/inventario_recursos.md` - Configuración de recursos Cloudflare
- `.governance/reglas_proyecto.md` - Reglas del proyecto (R1-R16)
- `.skills/cloudflare-deploy/SKILL.md` - Referencia técnica de Cloudflare

---

## 9. Conclusión

**El problema principal es de implementación de React Router, no de despliegue.** Los 3 problemas críticos (UI-001, UI-002, UI-003) son errores de código que deben corregirse antes del próximo deploy.

**Los enlaces del sidebar SÍ funcionan.** La percepción de que no responden es consecuencia del contenido en blanco (UI-001).

**Tiempo estimado de corrección:** 30-60 minutos para problemas críticos.

**Próximo paso recomendado:** Aplicar correcciones de prioridad ALTA (sección 6) y ejecutar build de verificación.

---

**Documento generado por:** Agente Orquestador  
**Fecha de generación:** 2026-03-19  
**Versión:** 1.0
