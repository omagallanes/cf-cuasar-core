# Visión del Proyecto

> **Documento:** FASE 1 — Descubrimiento  
> **Fuente principal:** [`VaaIA_ConceptoProyecto.md`](../fuentes-base/01%20VaaIA_ConceptoProyecto.md)  
> **Versión:** 1.0  
> **Fecha:** 2026-03-18

---

## Propósito del Proyecto

**VaaIA: València Análisis de activos con IA** es una herramienta online que permite a asesores inmobiliarios convertir anuncios inmobiliarios en análisis estructurados y evaluables del activo desde diversos ángulos.

El propósito principal es proporcionar a los empleados de la empresa con función de asesoría una herramienta que les permita ejecutar análisis consistentes, comparables y rigurosos sobre inmuebles detectados en portales inmobiliarios, evaluando su potencial de negocio de forma estructurada.

---

## Visión General

VaaIA es una **web-app analítica** apoyada en metodología y orquestación de IA mediante roles y prompts, que trabaja sobre un archivo **JSON** (ver Ejemplo-modelo-info.json) con la información completa y estructurada del inmueble en el portal inmobiliario (I-JSON).

### Componentes Principales

1. **Motor Analítico Doc-First**
   - Basado en I-JSON extraído de anuncios inmobiliarios
   - Ejecución de análisis predefinidos contra OpenAI API
   - Salidas derivadas del propio análisis

2. **Cuatro Planos Analíticos**
   - **Activo físico**: características del inmueble
   - **Activo estratégico**: posición y potencial
   - **Activo financiero**: viabilidad económica
   - **Activo regulado**: marco normativo aplicable

3. **Lectura Específica por Perfil**
   - **Inversor**: evaluación de retorno y riesgo
   - **Emprendedor / operador**: viabilidad de uso y operación
   - **Propietario**: optimización patrimonial

### Arquitectura del Sistema

```
Anuncio Inmobiliario → I-JSON → Proyecto → Workflow → OpenAI API → Markdown → R2
```

El sistema:
- Crea automáticamente proyectos a partir del I-JSON
- Ejecuta un workflow secuencial de 8 pasos
- Genera informes individuales en formato Markdown
- Almacena resultados en D1 (datos) y R2 (archivos)

---

## Valor Principal

El valor diferencial de VaaIA no está en listar inmuebles ni en realizar una tasación clásica, sino en **traducir fichas heterogéneas en decisiones accionables** sobre:

### Dimensiones de Decisión

| Dimensión | Qué aporta |
|-----------|------------|
| **Uso** | Determinación del uso más adecuado del activo |
| **Inversión** | Evaluación del potencial de inversión y retorno |
| **Explotación** | Viabilidad operativa del negocio |
| **Optimización patrimonial** | Estrategias de mejora del activo |

### Alcance Geográfico y Tipológico

- **Ámbito:** València ciudad
- **Foco tipológico:**
  - Local comercial
  - Reconversión / cambio de uso
  - Pisos utilizados como oficinas

---

## Posicionamiento del Producto

### Herramienta Interna vs. Producto para Cliente Final

**Fase actual (MVP):**
- Herramienta interna de trabajo para la empresa
- Usuario principal: empleado con función de asesoría
- Revisión humana de los resultados

**Evolución futura:**
- Herramienta para cliente final
- Experiencia cerrada y finalizada
- Requiere redefinición de UX, narrativa y expectativas

### Valor para la Empresa

1. **Consistencia:** Análisis estructurados y comparables
2. **Eficiencia:** Reducción del tiempo de análisis manual
3. **Rigor:** Metodología basada en prompts y roles de IA
4. **Trazabilidad:** Registro completo de ejecuciones y resultados
5. **Escalabilidad:** Motor analítico reutilizable para múltiples casos

---

## Enfoque Doc-First

VaaIA se concibe como **motor analítico doc-first**, no como plataforma inmobiliaria de captación o intermediación. Esto significa:

- La documentación y la metodología son el núcleo del sistema
- Los prompts y roles de IA están predefinidos
- La validación se basa en casos reales y utilidad percibida
- La evolución se construye sobre la experiencia analítica acumulada

---

## Frontera Funcional del MVP

El MVP se centra en:

- ✅ Creación de proyectos a partir de I-JSON
- ✅ Ejecución completa del workflow de análisis
- ✅ Generación y almacenamiento de informes Markdown
- ✅ Visualización de resultados en interfaz
- ✅ Gestión de estados y trazabilidad

**NO incluye:**
- ❌ Marketplace de inmuebles
- ❌ CRM comercial completo
- ❌ Automatización masiva de captura
- ❌ Producto orientado plenamente a cliente final
- ❌ Comparadores complejos de escenarios
- ❌ Ejecución parcial por módulos
- ❌ Versionado de prompts o resultados

---

> **Nota:** Esta visión está basada en [`VaaIA_ConceptoProyecto.md`](../fuentes-base/01%20VaaIA_ConceptoProyecto.md) como fuente principal de verdad.
