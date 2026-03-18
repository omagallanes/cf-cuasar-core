Sí conviene **tomar ya decisiones de frontend en Fase 3**, pero **solo al nivel arquitectónico**, no al nivel de implementación detallada de pantallas. Y con Hono y la regla de cero hardcoding pasa algo parecido: **no hace falta bajarlo todo a detalle todavía, pero sí dejarlo explícitamente asentado ahora como restricción/decisión de arquitectura**. La razón es que los tres temas afectan a fronteras del sistema, responsabilidades, configuración, despliegue y gobernanza del código, que son precisamente materias de Fase 3. ([GitHub][1])

## Mi criterio general para Fase 3

En doc-first, en esta fase no deberías documentar “cómo se ve cada pantalla”, sino **qué papel juega el frontend dentro del sistema**, **qué plantilla/base se adopta**, **qué framework condiciona el backend/edge**, y **qué políticas transversales deben cumplirse**. Eso deja preparada la Fase 4 y evita que luego los agentes de IA inventen decisiones importantes por su cuenta.

La regla práctica sería esta:

* **Sí entra en Fase 3**: decisiones que cambian arquitectura, stack, límites, convenciones globales o restricciones del sistema.
* **No entra todavía en Fase 3**: detalle fino de componentes concretos, copy final, estados visuales exhaustivos o implementación feature-by-feature.

---

# 1) Frontend + UI + plantilla TailAdmin: ¿entra ya o más tarde?

## Recomendación

**Sí, entra ya parcialmente en Fase 3.**

No para documentar todo el frontend, pero sí para dejar fijado:

* que habrá una **SPA/Frontend React**
* que se usará una **base UI concreta**
* qué rol tendrá esa plantilla dentro del sistema
* qué partes de la plantilla son “acelerador visual” y cuáles **no** son fuente de verdad funcional

El repositorio que propones no es una plantilla genérica cualquiera: hoy se presenta como un dashboard en **React 19 + TypeScript + Tailwind CSS v4**, con router, tablas, charts, formularios de auth, dark mode y componentes de panel/admin. Eso la convierte en una decisión de base tecnológica y de composición de interfaz, no solo en un detalle cosmético. ([GitHub][1])

## Qué sí deberías documentar ahora

En `architecture.md` o en un nuevo `frontend-architecture.md` enlazado desde `architecture.md`:

* **Rol del frontend**: SPA administrativa, panel interno, dashboard operacional, etc.
* **Stack frontend aprobado**: React + TypeScript + Tailwind.
* **Base UI elegida**: TailAdmin free-react-tailwind-admin-dashboard.
* **Alcance de la plantilla**:

  * layout
  * navegación
  * tablas/charts/forms
  * tokens visuales base
* **Límites de la plantilla**:

  * no define dominio
  * no define contratos API
  * no define permisos
  * no define copy de negocio
* **Estrategia de adaptación**:

  * usar como “shell” y librería de bloques
  * no arrastrar páginas demo sin mapearlas a casos reales
* **Riesgos**:

  * sobreajuste a estructura de dashboard
  * arrastre de componentes no necesarios
  * mezcla entre demo data y datos reales

## Qué NO hace falta documentar todavía

Eso puede esperar a Fase 4 o 5:

* árbol completo de rutas de UI definitivo
* inventario de componentes por pantalla
* copy final de cada vista
* estados visuales detallados de todos los casos

## Juicio doc-first

Si no lo recoges ya, en Fase 4 los agentes pueden asumir cualquier estructura de frontend, cualquier librería o cualquier patrón de layout. Eso degrada consistencia. Así que **sí debe aparecer ya como decisión arquitectónica y restricción de implementación**.

## Cómo dejarlo escrito

Yo lo pondría así:

**En `architecture.md`:**

* sección `Frontend Delivery Architecture`
* sección `UI Base Template Decision`
* sección `Template Governance`

**Y opcionalmente un ADR nuevo:**

* `adr/00x-frontend-ui-foundation.md`

Ese ADR debería responder:

* por qué TailAdmin
* qué se reutiliza
* qué no se hereda
* cómo se evita dependencia excesiva del demo

---

# 2) Hono no aparece en Fase 3: ¿hay que meterlo ahora o posponerlo?

## Recomendación

**Debe incorporarse ahora, al menos como decisión pendiente o preferente de arquitectura.**
No lo dejaría fuera de Fase 3.

La razón es simple: si el sistema está pensado para **Cloudflare**, Hono no es un detalle de implementación menor. Tanto la documentación oficial de Cloudflare como la de Hono lo posicionan explícitamente como una opción natural para Workers, incluso con plantilla full-stack React + Vite sobre Workers Assets. Cloudflare describe Hono como un framework que “works fantastically with Cloudflare Workers”, y Hono documenta soporte directo para Cloudflare Workers. ([Cloudflare Docs][2])

## Qué significa eso en términos de Fase 3

Hono afecta a:

* modelo de routing
* composición middleware
* patrón request/response
* validación
* estructura del worker
* frontera entre SPA y API
* despliegue en Cloudflare/Wrangler

Eso es claramente arquitectura, no solo implementación.

## Qué haría exactamente

Tienes dos caminos válidos, pero uno es mejor:

### Opción recomendada

Añadir ya una de estas dos cosas:

* **un ADR formal**: `adr/00x-edge-http-framework-hono.md`
* o una **sección en `architecture.md`** llamada `Backend Edge Runtime and HTTP Framework`

Y dejar una decisión con este estado:

* **Status**: Proposed / Accepted / Pending validation

## Qué debe decir ese documento

Como mínimo:

* Runtime objetivo: Cloudflare Workers
* Framework HTTP considerado: Hono
* Motivo:

  * alineación con Cloudflare Workers
  * simplicidad en edge
  * compatibilidad con arquitectura full-stack React/Vite en Cloudflare
* Impacto:

  * estructura del backend
  * middleware
  * testing
  * despliegue
* Riesgo si se pospone:

  * agentes generando backend con Express/Nest/Fastify/Node assumptions
  * divergencia entre docs y entorno real

## Cuándo sí podrías posponer detalle

Lo que sí puedes dejar para Fase 4:

* convención exacta de carpetas Hono
* middleware concretos
* validadores concretos
* estrategia detallada de bindings
* estructura exacta de handlers y services

Pero **la decisión de que Hono está en evaluación o adoptado** debería quedar ya reflejada.

## Mi conclusión aquí

No diría “aún no se ha tenido en cuenta y ya veremos”. Diría algo más disciplinado:

> “Hono no está aún formalizado en la documentación de Fase 3, pero dado el objetivo de despliegue en Cloudflare, debe incorporarse inmediatamente como decisión arquitectónica explícita o ADR pendiente de validación.”

---

# 3) Regla de “cero hardcoding”: ¿afecta ya a Fase 3?

## Recomendación

**Sí, sí afecta a Fase 3**. No como catálogo exhaustivo de textos o variables, pero sí como **principio transversal de arquitectura y gobernanza**.

Porque en esta fase ya estáis definiendo:

* responsabilidades por capa
* decisiones técnicas
* persistencia y temporalidad de datos
* estructura de configuración
* interacción frontend/backend

Y ahí precisamente es donde se debe decidir **qué tipo de dato puede vivir en código y cuál no**.

## Qué pasa si no se documenta ahora

Los agentes tienden a hardcodear de forma oportunista:

* textos de UI
* mensajes de error
* timeouts
* feature flags
* endpoints
* keys de storage
* IDs, roles, límites, retries
* valores por defecto de negocio

Si no hay política explícita, te van a introducir deuda estructural desde Fase 4.

## Mi postura

No hace falta crear todavía el inventario final de todos los strings o configs, pero **sí hace falta declarar la política en Fase 3**.

## Cómo formularlo en arquitectura

Yo añadiría una sección transversal, por ejemplo en `architecture.md`:

### `Configuration and Dynamic Value Policy`

o

### `Zero Hardcoding Policy`

Con reglas como:

* Los valores de negocio no se embeben en componentes ni handlers.
* Los textos de UI no se dejan inline salvo excepciones justificadas.
* Los mensajes de error/advertencia deben provenir de catálogo o capa definida.
* Los parámetros operativos y feature toggles deben resolverse desde configuración.
* Los identificadores de recursos, rutas base, bindings, claves y límites deben venir de config/env/constantes tipadas.
* Los datos temporales o persistentes deben tener fuente de verdad explícita.
* Toda excepción al principio debe quedar documentada.

## Esto aplica tanto a frontend como backend

Especialmente a:

### En frontend

* labels
* placeholders
* mensajes de validación
* textos de error
* banners/alerts
* rutas externas
* IDs de features
* mock data persistente que luego se “queda”

### En backend

* códigos y mensajes de error
* TTL
* reintentos
* rate limits
* nombres de colas/buckets/bindings
* endpoints externos
* valores por defecto de dominio

## ¿Hace falta i18n ya?

No necesariamente como implementación completa. Pero sí conviene dejar una nota arquitectónica:

* si los textos van a centralizarse en catálogos desde el inicio
* si habrá soporte multiidioma o al menos “message catalogs ready”

Eso evita que luego el frontend nazca lleno de strings inline.

## Mi conclusión aquí

La regla de cero hardcoding **sí es relevante en Fase 3**, porque aquí se decide la política estructural.
Lo que no corresponde aún es bajar a todos los detalles operativos de cada texto o variable.

---

# Qué haría yo exactamente, ya

## Cambios mínimos recomendados en la documentación de Fase 3

### En `architecture.md`

Añadir 4 bloques nuevos:

1. **Frontend Architecture**

   * SPA React/TS
   * responsabilidad del frontend
   * relación con backend/edge

2. **UI Foundation**

   * adopción de TailAdmin como base visual/estructural
   * límites de uso de la plantilla
   * criterio de customización

3. **Edge Backend Architecture**

   * Cloudflare Workers como runtime
   * Hono como framework propuesto o aceptado
   * impacto en routing/middleware/deployment

4. **Cross-Cutting Policy: Zero Hardcoding**

   * configuración
   * mensajes
   * textos UI
   * parámetros dinámicos
   * excepciones permitidas

### Nuevos ADR recomendados

* `adr/00x-frontend-ui-foundation-tailadmin.md`
* `adr/00x-edge-framework-hono.md`
* `adr/00x-zero-hardcoding-and-config-policy.md`

---

# Mi veredicto, de forma muy directa

## Sobre frontend + plantilla

**Sí, debes introducirlo ya en Fase 3**, pero como decisión arquitectónica y de gobernanza, no como detalle de implementación visual.

## Sobre Hono

**También debe entrar ya en Fase 3**, al menos como decisión propuesta/pendiente, porque condiciona arquitectura real en Cloudflare. ([Cloudflare Docs][2])

## Sobre cero hardcoding

**Sí afecta a Fase 3**, porque es una política transversal de arquitectura. No hace falta detallarlo todo ya, pero sí fijar la regla y sus ámbitos.

---

# Regla práctica final

En Fase 3 debes documentar aquello que, si no queda escrito, hará que un agente de IA tome decisiones estructurales por su cuenta.

En tu caso, esas tres cosas cumplen exactamente esa condición:

* plantilla frontend base
* Hono para Cloudflare
* política de cero hardcoding

Así que **las tres deberían incorporarse ya**.

En el siguiente paso te puedo proponer un **patch exacto para `architecture.md`** con secciones nuevas y texto listo para pegar.

[1]: https://github.com/TailAdmin/free-react-tailwind-admin-dashboard "GitHub - TailAdmin/free-react-tailwind-admin-dashboard: Free React Tailwind CSS Admin Dashboard Template - TailAdmin is a free and open-source admin dashboard template built on React and Tailwind CSS, providing developers with everything they need to create a comprehensive, back-end, dashboard, or admin panel solution for upcoming web projects. · GitHub"
[2]: https://developers.cloudflare.com/workers/framework-guides/web-apps/more-web-frameworks/hono/?utm_source=chatgpt.com "Hono · Cloudflare Workers docs"
