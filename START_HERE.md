# Inicio Rápido — Gobernanza del Proyecto

> **Tiempo de lectura:** 5 minutos  
> **Propósito:** Entender cómo funciona el sistema de gobernanza y cómo usarlo

---

## ¿Qué es esta Gobernanza?

Este proyecto utiliza un **sistema de agentes de IA coordinados** para gestionar el desarrollo y despliegue en Cloudflare.

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO                                 │
│                    (Tú, el desarrollador)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ solicita
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ORQUESTADOR                                │
│              (Coordina y delega tareas)                         │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │ delega en        │ delega en        │ delega en
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   EJECUTORES    │  │  INVENTARIADOR  │  │   VALIDADOR     │
│ (Implementan)   │  │ (Inventario)    │  │  (Calidad)      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Reglas Clave (Lo que DEBES saber)

| Regla | Qué significa | Ejemplo |
|-------|---------------|---------|
| **R1** | No asumir valores no documentados | Preguntar si no sabes el nombre de un recurso |
| **R2** | Cero hardcoding | Usar variables de entorno, no valores fijos |
| **R15** | Solo `inventariador` actualiza inventario | **NUNCA** modifiques `inventario_recursos.md` directamente |

---

## Cómo Empezar (En 3 pasos)

### Paso 1: Autenticación

Primera vez, autentícate con Cloudflare:

```bash
npx wrangler login
```

Verifica tu autenticación:

```bash
npx wrangler whoami
```

### Paso 2: Iniciar Sesión de Desarrollo

Copia y pega este prompt en tu IA:

```markdown
---
# Prompt de Arranque de Sesión

Lee y memoriza:
- /.governance/reglas_proyecto.md
- /.governance/inventario_recursos.md
- /.agents/orquestador.md
- /.agents/inventariador.md
- /.agents/ejecutores/README.md
- /.skills/cloudflare-deploy/SKILL.md

Verifica el estado del proyecto:
1. ¿inventario_recursos.md está poblado o es plantilla vacía?
2. ¿Existen recursos Cloudflare reales?
3. ¿Hay wrangler.toml y package.json?

Luego ejecuta /.agents/orquestador.md y asume el rol de orquestador.
Espera siguientes instrucciones.
---
```

### Paso 3: Solicitar tu Primera Tarea

Ejemplo:

```
Necesito crear un endpoint para guardar usuarios en la base de datos.
```

El orquestador coordinará el resto.

---

## Flujo de Trabajo Típico

```
1. Usuario solicita tarea
   ↓
2. Orquestador clasifica y delega
   ↓
3. Ejecutor implementa
   ↓
4. Validador verifica calidad
   ↓
5. Inventariador actualiza inventario (si hay cambios en recursos)
   ↓
6. Commit con identificador
```

---

## Archivos de Gobernanza

| Archivo | Para qué sirve | ¿Lo lees? | ¿Lo modificas? |
|---------|----------------|-----------|----------------|
| `reglas_proyecto.md` | Define las 16 reglas | ✅ Sí (primera vez) | ❌ No |
| `inventario_recursos.md` | Recursos y configuración | ✅ Sí (antes de trabajar) | ❌ No (solo `inventariador`) |
| `orquestador.md` | Coordinación | ⚠️ Opcional | ❌ No |
| `inventariador.md` | Gestión de inventario | ⚠️ Opcional | ❌ No |
| `ejecutores/*.md` | Agentes especializados | ⚠️ Opcional | ❌ No |
| `START_HERE.md` | Esta guía | ✅ Sí (primera vez) | ❌ No |

---

## Solicitar Cambios en el Inventario

**NUNCA** modifiques `inventario_recursos.md` directamente. Usa este prompt:

```markdown
Necesito actualizar el inventario:
- Tipo de cambio: [crear/modificar/eliminar/corregir]
- Recurso: [nombre del recurso]
- Detalles: [descripción del cambio]

Por favor, invoca al inventariador para actualizar.
```

---

## Preguntas Frecuentes

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

---

## Más Información

| Documento | Propósito |
|-----------|-----------|
| [Reglas completas (R1-R16)](/.governance/reglas_proyecto.md) | Todas las reglas obligatorias |
| [Inventario de recursos](/.governance/inventario_recursos.md) | Recursos y configuración operativa |
| [Agentes ejecutores](/.agents/ejecutores/README.md) | Agentes especializados por dominio |
| [Skill Cloudflare Deploy](/.skills/cloudflare-deploy/SKILL.md) | Referencias técnicas de Cloudflare |
| [Flujo de Autenticación](/.governance/AUTENTICACION.md) | Cómo autenticarse con Cloudflare |
| [Inventory Auditor](/.agents/inventory-auditor.md) | Auditoría de consistencia de inventario |

---

**Última actualización:** 2026-03-17
