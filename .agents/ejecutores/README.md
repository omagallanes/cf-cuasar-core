# Agentes Ejecutores (AGTE)

Este directorio contiene los agentes ejecutores que realizan tareas técnicas específicas dentro del proyecto.

## Referencias Obligatorias

Todos los agentes ejecutores deben consultar antes de iniciar cualquier acción:

1. **`../.governance/inventario_recursos.md`** — Fuente única de verdad para recursos y configuración operativa
2. **`../.governance/reglas_proyecto.md`** — Reglas del proyecto que deben cumplir
3. **`../orquestador.md`** — Agente orquestador que coordina el trabajo

## Agentes Disponibles

### Cloudflare

| Agente | Responsabilidad Principal |
|--------|---------------------------|
| [`cloudflare-workers`](cloudflare-workers.md) | Endpoints HTTP, CORS, lógica de negocio backend, bindings |
| [`cloudflare-r2`](cloudflare-r2.md) | Almacenamiento de objetos, buckets, acceso público/privado |
| [`cloudflare-d1`](cloudflare-d1.md) | Bases de datos D1, esquemas SQL, migraciones, queries |
| [`cloudflare-kv`](cloudflare-kv.md) | Almacenamiento clave-valor, caché, sesiones, TTL |
| [`cloudflare-ai`](cloudflare-ai.md) | Workers AI, inferencia, AI SDK |
| [`cloudflare-workflows`](cloudflare-workflows.md) | Workflows de Cloudflare, orquestación de procesos |
| [`cloudflare-wrangler`](cloudflare-wrangler.md) | Configuración Wrangler, CI/CD, despliegues, GitHub Actions |

### Frontend

| Agente | Responsabilidad Principal |
|--------|---------------------------|
| [`frontend-react`](frontend-react.md) | Componentes React, shadcn/ui, Tailwind CSS, integración con APIs |

### Soporte

| Agente | Responsabilidad Principal |
|--------|---------------------------|
| [`code-validator`](code-validator.md) | Validación de calidad, lint, typecheck, tests, cumplimiento de reglas |
| [`natural-language-interpreter`](natural-language-interpreter.md) | Interpretación de instrucciones en lenguaje natural a objetivos técnicos |

### Gobernanza

| Agente | Responsabilidad Principal |
|--------|---------------------------|
| [`inventariador`](../inventariador.md) | **Exclusivo:** Actualizar `inventario_recursos.md` |
| [`inventory-auditor`](../inventory-auditor.md) | **Auditoría:** Comparar inventario vs recursos reales en Cloudflare |

## Uso

Estos agentes son invocados por el **agente orquestador** (`../orquestador.md`) cuando una tarea requiere su especialidad.

### Flujo Típico

1. El usuario envía una instrucción en lenguaje natural
2. El orquestador clasifica la petición y decide la estrategia
3. El orquestador delega en el/los agente(s) ejecutor(es) adecuado(s)
4. El agente ejecutor consulta `inventario_recursos.md` y `reglas_proyecto.md`
5. El agente ejecutor realiza el trabajo y devuelve evidencias
6. El validador verifica el cumplimiento de reglas y calidad
7. El orquestador acepta o rechaza el resultado

## Estructura de los Agentes

Cada agente ejecutor sigue esta estructura:

```markdown
---
name: [nombre-del-agente]
description: [Descripción breve]
tools: [Lista de herramientas disponibles]
model: [Modelo de IA recomendado]
permissionMode: [Modo de permisos]
---

# [Nombre del Agente] — Agente Ejecutor

## Propósito
[Descripción del propósito del agente]

## Referencias Obligatorias
1. `inventario_recursos.md` — Fuente única de verdad para recursos y configuración
2. `reglas_proyecto.md` — Reglas del proyecto
3. `orquestador.md` — Agente orquestador que coordina el trabajo

## Responsabilidades
[Lista de responsabilidades dentro de su especialidad]

## Límites de Actuación
### Lo que SÍ debes hacer:
- [...]

### Lo que NO debes hacer:
- [...]

## Criterios Operativos de Dominio
[Criterios técnicos específicos de esta especialidad]

## Formato de Salida
[Estructura JSON esperada para reportar resultados]

## Evidencia Mínima Exigida
[Qué validaciones deben ejecutarse antes de entregar]

## Archivos Típicos
[Rutas de archivos que este agente suele crear o modificar]

## Prohibiciones Expresas
[Lista de acciones prohibidas]
```

## Separación de Responsabilidades

| Documento | Contenido |
|-----------|-----------|
| `../.governance/reglas_proyecto.md` | Reglas globales del proyecto (R1-R16) |
| `../.governance/inventario_recursos.md` | Fuente de verdad para recursos y configuración (solo lectura para ejecutores) |
| `../.governance/AUTENTICACION.md` | Flujo de autenticación con Cloudflare |
| `../orquestador.md` | Coordinación, delegación, validación de reglas |
| `../inventariador.md` | **Único agente autorizado** para actualizar inventario |
| `../inventory-auditor.md` | Auditoría de consistencia entre inventario y recursos reales |
| `ejecutores/*.md` | Criterios operativos específicos de cada dominio técnico |
| `../../.skills/cloudflare-deploy/SKILL.md` | **Fuente de conocimiento técnico** para agentes ejecutores |

**Importante:** Los agentes ejecutores solo pueden **consultar** `inventario_recursos.md`, nunca modificarlo. Para actualizaciones, deben notificar al orquestador quien delegará en el `inventariador`.

**Skill Integration:** Los agentes ejecutores usan `cloudflare-deploy/SKILL.md` como fuente de conocimiento técnico para implementaciones en Cloudflare.

## Principios de Diseño

1. **Especialización:** Cada agente tiene una responsabilidad clara y no solapada
2. **Autonomía:** Los agentes tienen criterios operativos propios dentro de su especialidad
3. **Validación:** Todo trabajo debe ser validado antes de aceptarse
4. **Trazabilidad:** Los agentes deben reportar cambios, evidencias y riesgos
5. **Coherencia:** Todos los agentes consultan `inventario_recursos.md` antes de actuar

---

> **Nota:** Esta colección de agentes es una plantilla base. Adaptar según las necesidades específicas del proyecto.
