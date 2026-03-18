# Personas de Usuario

> **Documento:** FASE 1 — Descubrimiento  
> **Fuente principal:** [`VaaIA_ConceptoProyecto.md`](../fuentes-base/01%20VaaIA_ConceptoProyecto.md)  
> **Versión:** 1.0  
> **Fecha:** 2026-03-18

---

## Introducción

VaaIA tiene dos tipos de usuarios principales: usuarios internos de la empresa que utilizan la herramienta como soporte analítico, y perfiles de interesado o cliente potencial para los cuales se generan los análisis.

---

## Usuarios Internos

### Persona Principal: Asesor Inmobiliario

#### Perfil

| Atributo | Descripción |
|-----------|-------------|
| **Rol** | Empleado de la empresa con rango o función de asesoría |
| **Ubicación** | València ciudad |
| **Experiencia** | Conocimiento del mercado inmobiliario local |
| **Responsabilidad** | Analizar activos inmobiliarios con lógica de negocio o inversión |

#### Objetivos

- Evaluar el potencial de negocio de inmuebles detectados en portales inmobiliarios
- Determinar si un activo tiene sentido real, está infrautilizado o soporta un uso económico razonable
- Decidir si conviene mantener, transformar o descartar un inmueble
- Evaluar si una posible reconversión o cambio de uso parece defendible en València ciudad

#### Necesidades

- **Estructura:** Necesita criterios estandarizados para análisis consistentes
- **Rigor:** Requiere análisis multidimensionales (físico, estratégico, financiero, regulado)
- **Eficiencia:** Quiere reducir el tiempo de análisis manual
- **Trazabilidad:** Necesita registro completo de ejecuciones y resultados
- **Comparabilidad:** Quiere poder comparar análisis entre diferentes inmuebles

#### Motivaciones

- Mejorar la calidad de las decisiones de inversión
- Reducir el tiempo de análisis de inmuebles
- Disponer de criterios objetivos para evaluar oportunidades
- Aumentar el volumen de análisis sin aumentar proporcionalmente el esfuerzo

#### Frustraciones Actuales

- Análisis manuales y desestructurados
- Falta de criterios estandarizados
- Imposibilidad de comparar análisis entre inmuebles
- Pérdida de tiempo en tareas repetitivas
- Incertidumbre en la calidad de sus propias evaluaciones

#### Escenario de Uso Típico

1. Encuentra un anuncio interesante en un portal inmobiliario
2. Copia el contenido JSON del anuncio (I-JSON)
3. Crea un nuevo proyecto en VaaIA
4. Pega el I-JSON en el formulario
5. Ejecuta el workflow de análisis
6. Revisa los informes generados
7. Toma una decisión informada sobre el inmueble

---

### Persona Secundaria: Administrador del Sistema

#### Perfil

| Atributo | Descripción |
|-----------|-------------|
| **Rol** | Administrador técnico del sistema |
| **Responsabilidad** | Gestionar y mantener la plataforma |

#### Objetivos

- Asegurar el correcto funcionamiento del sistema
- Gestionar usuarios y permisos (en fases posteriores)
- Monitorear el rendimiento y la disponibilidad

#### Necesidades

- Panel de administración para gestión del sistema
- Herramientas de monitoreo y logging
- Capacidad para gestionar catálogos de funciones y operaciones de negocio

---

### Persona Secundaria: Comercial

#### Perfil

| Atributo | Descripción |
|-----------|-------------|
| **Rol** | Empleado comercial de la empresa |
| **Responsabilidad** | Presentar oportunidades a clientes |

#### Objetivos

- Disponer de análisis estructurados para presentar a clientes
- Identificar oportunidades de negocio para clientes potenciales

#### Necesidades

- Acceso a resultados de análisis para uso comercial
- Posibilidad de compartir informes con clientes (en fases posteriores)

---

## Perfiles de Interesado / Cliente Potencial

Estos perfiles no son usuarios directos de la herramienta, pero son los destinatarios finales de los análisis generados.

### Inversor

#### Perfil

| Atributo | Descripción |
|-----------|-------------|
| **Tipo** | Inversor inmobiliario |
| **Interés** | Retorno de inversión y riesgo |
| **Horizonte** | Medio/largo plazo |

#### Necesidades del Análisis

- Evaluación del potencial de retorno
- Análisis de riesgos asociados
- Comparación con oportunidades alternativas
- Visión financiera del activo

#### Preguntas Clave

- ¿Cuál es el retorno esperado?
- ¿Cuáles son los riesgos principales?
- ¿Es este activo mejor que otras alternativas?
- ¿Cuál es el horizonte de inversión?

---

### Emprendedor / Operador

#### Perfil

| Atributo | Descripción |
|-----------|-------------|
| **Tipo** | Emprendedor u operador de negocio |
| **Interés** | Viabilidad operativa del espacio |
| **Horizonte** | Corto/medio plazo |

#### Necesidades del Análisis

- Evaluación de la idoneidad del espacio para la actividad
- Análisis de costes de adaptación
- Viabilidad de la operación
- Potencial de crecimiento

#### Preguntas Clave

- ¿Este espacio sirve para mi actividad?
- ¿Cuánto costará adaptarlo?
- ¿Es viable la operación?
- ¿Hay potencial de expansión?

---

### Propietario

#### Perfil

| Atributo | Descripción |
|-----------|-------------|
| **Tipo** | Propietario de un activo inmobiliario |
| **Interés** | Optimización patrimonial |
| **Horizonte** | Variable |

#### Necesidades del Análisis

- Evaluación del potencial del activo
- Identificación de oportunidades de mejora
- Estrategias de optimización
- Valoración del activo

#### Preguntas Clave

- ¿Está mi activo infrautilizado?
- ¿Puedo mejorar su rendimiento?
- ¿Hay oportunidades de reconversión?
- ¿Cuál es el valor real de mi activo?

---

## Mapa de Relaciones

```
Asesor Inmobiliario (usuario principal)
    ↓
VaaIA (herramienta)
    ↓
Análisis estructurados
    ↓
Inversor / Emprendedor / Propietario (destinatarios)
```

---

## Usuario Inicial Más Viable para MVP

Aunque el usuario operativo principal del MVP es interno (Asesor Inmobiliario), los análisis están orientados a servir a casos en los que el asesor necesita trabajar para perfiles como:

- **Propietario** con un local o activo ya en cartera que el asesor sospecha está infrautilizado
- **Inversor** al que el asesor puede proporcionar oportunidades filtradas para profundizar
- **Operador** que necesita saber si el espacio sirve realmente para una actividad o cambio de uso

---

> **Nota:** Este documento está basado en [`VaaIA_ConceptoProyecto.md`](../fuentes-base/01%20VaaIA_ConceptoProyecto.md) como fuente principal de verdad.
