# Gobernanza para Proyectos Cloudflare

> **Plantilla de gobernanza lista para usar** en proyectos desplegados en Cloudflare Workers  
> **Tiempo de configuración:** 15 minutos  
> **Estado:** ✅ Lista para producción

[![Estado](https://img.shields.io/badge/estado-lista%20para%20producci%C3%B3n-brightgreen)](START_HERE.md)
[![Versión](https://img.shields.io/badge/versi%C3%B3n-5.0-blue)](.governance/reglas_proyecto.md)
[![Agentes](https://img.shields.io/badge/agentes-15-orange)](.agents/)

---

## 🚀 Inicio Rápido

**¿Nuevo en este proyecto?** Comienza aquí:

### [→ START_HERE.md](START_HERE.md) — Guía de Inicio (5 min lectura)

Este archivo contiene todo lo necesario para empezar:
- Explicación del sistema de agentes
- Prompt de arranque para tu IA
- Flujo de trabajo típico
- Preguntas frecuentes

---

## 📋 ¿Qué es Esta Gobernanza?

Un **sistema completo de agentes de IA coordinados** para gestionar el desarrollo y despliegue de proyectos en Cloudflare Workers.

### Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO                                 │
│  • Solicita tareas en lenguaje natural                          │
│  • Recibe resultados coordinados                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ORQUESTADOR                                │
│  • Clasifica tareas                                             │
│  • Delega en agentes especializados                             │
│  • Verifica cumplimiento de reglas                              │
│  • Coordina actualizaciones de inventario                       │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   EJECUTORES    │  │  INVENTARIADOR  │  │INVENTORY-AUDITOR│
│ (10 agentes)    │  │ (Inventario)    │  │  (Auditoría)    │
│ Implementan     │  │ Actualiza       │  │ Verifica        │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Componentes Principales

| Componente | Ubicación | Propósito |
|------------|-----------|-----------|
| **Reglas del Proyecto** | `.governance/reglas_proyecto.md` | 16 reglas obligatorias (R1-R16) |
| **Inventario de Recursos** | `.governance/inventario_recursos.md` | Fuente única de verdad para recursos Cloudflare |
| **Autenticación** | `.governance/AUTENTICACION.md` | Flujo de autenticación con Cloudflare |
| **Orquestador** | `.agents/orquestador.md` | Coordina todas las tareas y delegaciones |
| **Inventariador** | `.agents/inventariador.md` | Único agente que actualiza el inventario |
| **Inventory Auditor** | `.agents/inventory-auditor.md` | Auditoría de consistencia inventario vs Cloudflare |
| **Agentes Ejecutores** | `.agents/ejecutores/` | 10 agentes especializados por dominio |
| **Skill Cloudflare** | `.skills/cloudflare-deploy/` | Conocimiento técnico de Cloudflare |

---

## 🎯 ¿Por Qué Usar Esta Gobernanza?

### Problemas que Resuelve

| Problema | Solución |
|----------|----------|
| ❌ Hardcoding de recursos | ✅ R2: Cero hardcoding + inventario centralizado |
| ❌ Recursos no documentados | ✅ R15: Solo inventariador actualiza inventario |
| ❌ Inconsistencia entre docs | ✅ Inventory-auditor verifica consistencia |
| ❌ Agents asumen valores | ✅ R1: No asumir + verificación obligatoria |
| ❌ Sin flujo de autenticación | ✅ AUTENTICACION.md con flujo completo |
| ❌ Documentación desactualizada | ✅ START_HERE.md + agente documentador (futuro) |

### Beneficios

| Beneficio | Impacto |
|-----------|---------|
| **Consistencia** | Todos los agentes siguen las mismas reglas |
| **Trazabilidad** | Todo cambio queda registrado en inventario |
| **Seguridad** | Secrets nunca en código, siempre en KV/GitHub Secrets |
| **Escalabilidad** | Funciona igual para 1 o 100 Workers |
| **Onboarding** | Nuevos desarrolladores entienden el sistema en 5 min |

---

## 📦 Estructura del Repositorio

```
/
├── START_HERE.md                    # 🚀 COMIENZA AQUÍ
├── README.md                        # Este archivo
│
├── .governance/                     # Gobernanza del proyecto
│   ├── reglas_proyecto.md           # 16 reglas obligatorias (R1-R16)
│   ├── inventario_recursos.md       # Inventario de recursos Cloudflare
│   └── AUTENTICACION.md             # Flujo de autenticación
│
├── .agents/                         # Agentes de IA
│   ├── orquestador.md               # Coordinador principal
│   ├── inventariador.md             # Gestor de inventario
│   ├── inventory-auditor.md         # Auditor de consistencia
│   └── ejecutores/                  # Agentes especializados
│       ├── cloudflare-workers.md    # Endpoints HTTP, CORS
│       ├── cloudflare-d1.md         # Bases de datos D1
│       ├── cloudflare-kv.md         # KV, caché, sesiones
│       ├── cloudflare-r2.md         # R2, buckets
│       ├── cloudflare-ai.md         # Workers AI
│       ├── cloudflare-workflows.md  # Workflows
│       ├── cloudflare-wrangler.md   # Wrangler, CI/CD
│       ├── frontend-react.md        # React, shadcn/ui
│       ├── code-validator.md        # Validación de calidad
│       └── natural-language-interpreter.md
│
├── .skills/                         # Skills técnicos
│   └── cloudflare-deploy/           # Skill para Cloudflare
│       ├── SKILL.md                 # Definición del skill
│       └── references/              # 80+ referencias Cloudflare
│
├── apps/                            # Código de la aplicación
│   ├── backend/                     # Backend Workers
│   └── frontend/                    # Frontend React
│
└── wrangler.toml                    # Configuración de Wrangler
```

---

## 🔧 Configuración Inicial

### Paso 1: Clonar como Template

```bash
# Opción A: Usar como template de GitHub
# 1. Ve a https://github.com/[usuario]/cloudflare-governance-template
# 2. Haz clic en "Use this template"
# 3. Crea tu nuevo repositorio

# Opción B: Clonar manualmente
git clone https://github.com/[usuario]/cloudflare-governance-template.git mi-proyecto
cd mi-proyecto
rm -rf .git
git init
git add .
git commit -m "Initial commit con gobernanza Cloudflare"
```

### Paso 2: Autenticación con Cloudflare

```bash
# Primera vez: autenticar
npx wrangler login

# Verificar autenticación
npx wrangler whoami
```

Más detalles en [`.governance/AUTENTICACION.md`](.governance/AUTENTICACION.md)

### Paso 3: Iniciar Sesión de Desarrollo

1. Abre [`START_HERE.md`](START_HERE.md)
2. Copia el **Prompt de Arranque de Sesión**
3. Pégalo en tu IA (Claude, Copilot, etc.)
4. El orquestador se activará y esperará instrucciones

### Paso 4: Configurar Inventario Inicial

```bash
# El orquestador te guiará para:
# 1. Verificar si inventario_recursos.md está poblado
# 2. Identificar recursos existentes
# 3. Actualizar inventario con recursos reales
```

---

## 📖 Reglas del Proyecto

### Reglas Críticas (Debes Conocer)

| Regla | Nombre | Qué Significa |
|-------|--------|---------------|
| **R1** | No asumir valores no documentados | Preguntar si no sabes el nombre de un recurso |
| **R2** | Cero hardcoding | Usar variables de entorno, no valores fijos |
| **R15** | Inventario actualizado | Solo `inventariador` actualiza inventario |

### Todas las Reglas

Consulta [`reglas_proyecto.md`](.governance/reglas_proyecto.md) para las 16 reglas completas.

---

## 🤖 Agentes Disponibles

### Agentes de Gobernanza

| Agente | Responsabilidad |
|--------|-----------------|
| [`orquestador`](.agents/orquestador.md) | Coordina todas las tareas |
| [`inventariador`](.agents/inventariador.md) | Actualiza inventario (único autorizado) |
| [`inventory-auditor`](.agents/inventory-auditor.md) | Auditoría de consistencia |

### Agentes Ejecutores (Cloudflare)

| Agente | Responsabilidad |
|--------|-----------------|
| [`cloudflare-workers`](.agents/ejecutores/cloudflare-workers.md) | Endpoints HTTP, CORS, lógica backend |
| [`cloudflare-d1`](.agents/ejecutores/cloudflare-d1.md) | Bases de datos D1, migraciones |
| [`cloudflare-kv`](.agents/ejecutores/cloudflare-kv.md) | KV, caché, sesiones, TTL |
| [`cloudflare-r2`](.agents/ejecutores/cloudflare-r2.md) | R2, buckets, acceso público/privado |
| [`cloudflare-ai`](.agents/ejecutores/cloudflare-ai.md) | Workers AI, inferencia |
| [`cloudflare-workflows`](.agents/ejecutores/cloudflare-workflows.md) | Workflows de Cloudflare |
| [`cloudflare-wrangler`](.agents/ejecutores/cloudflare-wrangler.md) | Wrangler, CI/CD, despliegues |

### Agentes Ejecutores (Frontend y Soporte)

| Agente | Responsabilidad |
|--------|-----------------|
| [`frontend-react`](.agents/ejecutores/frontend-react.md) | React, shadcn/ui, Tailwind CSS |
| [`code-validator`](.agents/ejecutores/code-validator.md) | Validación lint, typecheck, tests |
| [`natural-language-interpreter`](.agents/ejecutores/natural-language-interpreter.md) | Interpretación de lenguaje natural |

---

## 🔄 Flujo de Trabajo Típico

```
1. Usuario solicita tarea
   ↓
2. Orquestador clasifica (informativa/cambio local/coordinado/bloqueado)
   ↓
3. Orquestador verifica reglas (R1, R2, R15)
   ↓
4. Orquestador delega en agente ejecutor especializado
   ↓
5. Agente ejecutor implementa (usa SKILL como fuente de conocimiento)
   ↓
6. Code-validator verifica calidad (lint, typecheck, tests)
   ↓
7. Si hay cambios en recursos → Orquestador invoca inventariador
   ↓
8. Inventariador actualiza inventario_recursos.md
   ↓
9. Commit con identificador (R12)
```

---

## 📝 Solicitar Cambios en el Inventario

**NUNCA** modifiques `.governance/inventario_recursos.md` directamente.

### Prompt para Solicitar Cambios

```markdown
Necesito actualizar el inventario:
- Tipo de cambio: [crear/modificar/eliminar/corregir]
- Recurso: [nombre del recurso]
- Detalles: [descripción del cambio]

Por favor, invoca al inventariador para actualizar.
```

El orquestador invocará al agente `inventariador` para realizar la actualización.

---

## 🔐 Autenticación

### Desarrollo Local

```bash
# Autenticar (primera vez)
npx wrangler login

# Verificar
npx wrangler whoami
```

### CI/CD (GitHub Actions)

Configura estos secrets en tu repositorio:

| Secret | Propósito |
|--------|-----------|
| `CLOUDFLARE_API_TOKEN` | Token de API con permisos Worker:Edit |
| `CLOUDFLARE_ACCOUNT_ID` | ID de tu cuenta de Cloudflare |

Más detalles en [`.governance/AUTENTICACION.md`](.governance/AUTENTICACION.md)

---

## 📚 Documentación

| Documento | Propósito |
|-----------|-----------|
| [START_HERE.md](START_HERE.md) | 🚀 **Guía de inicio rápido** (5 min) |
| [.governance/reglas_proyecto.md](.governance/reglas_proyecto.md) | 16 reglas obligatorias (R1-R16) |
| [.governance/inventario_recursos.md](.governance/inventario_recursos.md) | Inventario de recursos Cloudflare |
| [.governance/AUTENTICACION.md](.governance/AUTENTICACION.md) | Flujo de autenticación |
| [.agents/ejecutores/README.md](.agents/ejecutores/README.md) | Agentes ejecutores |
| [.skills/cloudflare-deploy/SKILL.md](.skills/cloudflare-deploy/SKILL.md) | Skill de Cloudflare Deploy |

---

## 🚀 Uso como Template

### Para Tu Próximo Proyecto Cloudflare

1. **Haz clic en "Use this template"** en GitHub
2. **Crea tu nuevo repositorio**
3. **Copia las carpetas de gobernanza:**
   ```bash
   # Ya están en la raíz, solo personaliza:
   - .governance/inventario_recursos.md  # Actualiza con tus recursos
   - wrangler.toml                        # Configura tu proyecto
   ```
4. **Sigue START_HERE.md** para iniciar

### Personalización Mínima Requerida

| Archivo | Qué Personalizar |
|---------|------------------|
| `inventario_recursos.md` | Nombre del proyecto, recursos Cloudflare |
| `wrangler.toml` | Nombre del Worker, bindings, variables |
| `package.json` | Nombre del proyecto, dependencias específicas |

---

## ❓ Preguntas Frecuentes

### ¿Puedo modificar `inventario_recursos.md` directamente?

**NO.** Solo el agente `inventariador` puede actualizarlo. Solicita cambios a través del orquestador.

### ¿Qué pasa si no sé el nombre de un recurso?

**Pregunta.** La regla R1 exige que no asumas valores. El orquestador te ayudará a verificar.

### ¿Cómo sé si estoy autenticado?

```bash
npx wrangler whoami
```

Si muestra tu cuenta, estás autenticado. Si no, ejecuta `npx wrangler login`.

### ¿Puedo usar esta gobernanza en otro repositorio?

**SÍ.** Copia las carpetas `.governance/`, `.agents/`, y `.skills/` a la raíz del nuevo repositorio.

### ¿Necesito todos los agentes ejecutores?

**NO.** Usa solo los que necesites para tu proyecto. El orquestador trabajará con los agentes disponibles.

---

## 🤝 Contribuir

### Reportar Problemas

1. Verifica que el problema no esté en [Preguntas Frecuentes](#-preguntas-frecuentes)
2. Revisa que sigues las reglas en [reglas_proyecto.md](.governance/reglas_proyecto.md)
3. Si el problema persiste, crea un issue describiendo:
   - Qué intentabas hacer
   - Qué error obtuviste
   - Qué agente(s) involucrados

### Sugerir Mejoras

Las sugerencias de nuevos agentes, reglas o flujos son bienvenidas. Crea un issue con la etiqueta `enhancement`.

---

## 📄 Licencia

[MIT License](LICENSE) — Úsala libremente en tus proyectos.

---

## 🔗 Recursos Adicionales

| Recurso | Enlace |
|---------|--------|
| Cloudflare Workers Docs | https://developers.cloudflare.com/workers/ |
| Wrangler CLI | https://developers.cloudflare.com/workers/wrangler/ |
| Cloudflare Dashboard | https://dash.cloudflare.com/ |

---

**Última actualización:** 2026-03-17  
**Versión de gobernanza:** 5.0  
**Estado:** ✅ Lista para producción

---

## 🚀 ¿Listo para Empezar?

### [→ Ve a START_HERE.md](START_HERE.md)
