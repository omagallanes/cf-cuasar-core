# Modelo de Datos

> **Documento:** FASE 3 — Diseño  
> **Fuente principal:** [`03 domain-model.md`](../fase02/03%20domain-model.md)  
> **Versión:** 1.0  
> **Fecha:** 2026-03-18

---

## Resumen

Este documento define la estructura de datos del sistema desde una perspectiva de diseño técnico: entidades, relaciones, persistencia, restricciones, transformaciones y consideraciones de almacenamiento.

---

## Entidades y Persistencia

### 1. Proyecto

**Tabla D1:** `ani_proyectos`

| Campo | Tipo D1 | Descripción | Restricciones |
|-------|-----------|-------------|---------------|
| `id` | TEXT PRIMARY KEY | Identificador único del proyecto (UUID) | NOT NULL |
| `nombre` | TEXT | Nombre del proyecto | NOT NULL |
| `descripcion` | TEXT | Descripción del proyecto | NULL |
| `i_json` | TEXT | Contenido completo del I-JSON (JSON string) | NOT NULL |
| `estado` | TEXT | Estado del proyecto | NOT NULL, CHECK en (creado, procesando_analisis, analisis_con_error, analisis_finalizado) |
| `asesor_responsable` | TEXT | Identificador del asesor responsable | NULL |
| `fecha_creacion` | TEXT | Fecha y hora de creación (ISO 8601) | NOT NULL |
| `fecha_actualizacion` | TEXT | Fecha y hora de última actualización (ISO 8601) | NOT NULL |
| `fecha_analisis_inicio` | TEXT | Fecha y hora de inicio del análisis (ISO 8601) | NULL |
| `fecha_analisis_fin` | TEXT | Fecha y hora de finalización del análisis (ISO 8601) | NULL |
| `i_json_url` | TEXT | URL del I-JSON almacenado en R2 | NULL |

**Índices:**
- `idx_ani_proyectos_estado` en `estado`
- `idx_ani_proyectos_asesor` en `asesor_responsable`
- `idx_ani_proyectos_fecha_creacion` en `fecha_creacion`

**Relaciones:**
- 1:N con `ani_ejecuciones` (ani_ejecuciones.proyecto_id)
- 1:N con `ani_informes` (ani_informes.proyecto_id)

---

### 2. Ejecución de Workflow

**Tabla D1:** `ani_ejecuciones`

| Campo | Tipo D1 | Descripción | Restricciones |
|-------|-----------|-------------|---------------|
| `id` | TEXT PRIMARY KEY | Identificador único de la ejecución (UUID) | NOT NULL |
| `proyecto_id` | TEXT | Referencia al proyecto asociado | NOT NULL, FK ani_proyectos.id |
| `estado` | TEXT | Estado de la ejecución | NOT NULL, CHECK en (iniciada, en_ejecucion, finalizada_correctamente, finalizada_con_error) |
| `fecha_inicio` | TEXT | Fecha y hora de inicio (ISO 8601) | NOT NULL |
| `fecha_fin` | TEXT | Fecha y hora de finalización (ISO 8601) | NULL |
| `error_mensaje` | TEXT | Mensaje de error si la ejecución falló | NULL |

**Índices:**
- `idx_ani_ejecuciones_proyecto` en `proyecto_id`
- `idx_ani_ejecuciones_estado` en `estado`
- `idx_ani_ejecuciones_fecha_inicio` en `fecha_inicio`

**Relaciones:**
- N:1 con `ani_proyectos` (ani_proyectos.id)
- 1:N con `ani_pasos` (ani_pasos.ejecucion_id)

---

### 3. Paso de Workflow

**Tabla D1:** `ani_pasos`

| Campo | Tipo D1 | Descripción | Restricciones |
|-------|-----------|-------------|---------------|
| `id` | TEXT PRIMARY KEY | Identificador único del paso (UUID) | NOT NULL |
| `ejecucion_id` | TEXT | Referencia a la ejecución asociada | NOT NULL, FK ani_ejecuciones.id |
| `tipo_paso` | TEXT | Tipo de paso | NOT NULL, CHECK en (resumen, datos_clave, activo_fisico, activo_estrategico, activo_financiero, activo_regulado, lectura_inversor, lectura_emprendedor, lectura_propietario) |
| `orden` | INTEGER | Orden secuencial del paso (1-9) | NOT NULL, CHECK orden BETWEEN 1 AND 9 |
| `estado` | TEXT | Estado del paso | NOT NULL, CHECK en (pendiente, en_ejecucion, correcto, error) |
| `fecha_inicio` | TEXT | Fecha y hora de inicio (ISO 8601) | NOT NULL |
| `fecha_fin` | TEXT | Fecha y hora de finalización (ISO 8601) | NULL |
| `error_mensaje` | TEXT | Mensaje de error si el paso falló | NULL |
| `ruta_archivo_r2` | TEXT | Ruta del archivo Markdown en R2 | NULL |

**Índices:**
- `idx_ani_pasos_ejecucion` en `ejecucion_id`
- `idx_ani_pasos_tipo` en `tipo_paso`
- `idx_ani_pasos_orden` en `orden`

**Relaciones:**
- N:1 con `ani_ejecuciones` (ani_ejecuciones.id)

---

### 4. Atributo

**Tabla D1:** `ani_atributos`

| Campo | Tipo D1 | Descripción | Restricciones |
|-------|-----------|-------------|---------------|
| `id` | TEXT PRIMARY KEY | Identificador único del atributo (UUID) | NOT NULL |
| `nombre` | TEXT | Nombre del atributo | NOT NULL, UNIQUE |
| `descripcion` | TEXT | Descripción del atributo | NULL |

**Índices:**
- `idx_ani_atributos_nombre` en `nombre` (UNIQUE)

**Relaciones:**
- 1:N con `ani_valores` (ani_valores.atributo_id)

---

### 5. Valor

**Tabla D1:** `ani_valores`

| Campo | Tipo D1 | Descripción | Restricciones |
|-------|-----------|-------------|---------------|
| `id` | TEXT PRIMARY KEY | Identificador único del valor (UUID) | NOT NULL |
| `atributo_id` | TEXT | Referencia al atributo asociado | NOT NULL, FK ani_atributos.id |
| `valor` | TEXT | Valor del atributo | NOT NULL |
| `descripcion` | TEXT | Descripción del valor | NULL |

**Índices:**
- `idx_ani_valores_atributo` en `atributo_id`
- `idx_ani_valores_valor` en `valor`

**Relaciones:**
- N:1 con `ani_atributos` (ani_atributos.id)

---

## Almacenamiento en R2

### Estructura de Carpetas

```
r2-almacen/dir-api-inmo/{proyecto_id}/
├── {proyecto_id}.json          # I-JSON completo (se conserva entre reejecuciones)
├── resumen.md
├── datos_clave.md
├── activo_fisico.md
├── activo_estrategico.md
├── activo_financiero.md
├── activo_regulado.md
├── lectura_inversor.md
├── lectura_emprendedor.md
├── lectura_propietario.md
└── log.txt                      # Registro de errores si los hay
```

### Convención de Nombres

| Tipo de Archivo | Patrón de Nombre | Descripción |
|-----------------|-------------------|-------------|
| I-JSON | `{proyecto_id}.json` | Contenido completo del I-JSON |
| Informe | `{tipo_paso}.md` | Informe Markdown generado por cada paso |
| Log | `log.txt` | Registro de errores |

---

## Transformaciones de Datos

### Transformación I-JSON → Proyecto

**Entrada:** I-JSON (JSON completo del anuncio)

**Transformación:**
1. Extraer `nombre` desde `titulo_anuncio`
2. Extraer `descripcion` desde `descripcion`
3. Validar campos obligatorios
4. Convertir I-JSON a string para almacenar en `i_json`
5. Generar URL R2 para `i_json_url`

**Salida:** Registro en tabla `ani_proyectos`

---

### Transformación Proyecto → Ejecución

**Entrada:** `proyecto_id`, confirmación de reejecución

**Transformación:**
1. Validar estado del proyecto (`creado` o `analisis_con_error`)
2. Si hay análisis previos, validar confirmación
3. Crear registro en `ejecuciones`
4. Actualizar estado del proyecto a `procesando_analisis`

**Salida:** Registro en `ani_ejecuciones`, proyecto actualizado

---

### Transformación Ejecución → Pasos

**Entrada:** `ejecucion_id`, `proyecto_id`, I-JSON

**Transformación:**
1. Crear 9 registros en `pasos` (uno por cada tipo de paso)
2. Asignar orden secuencial (1-9)
3. Inicializar estado como `pendiente`

**Salida:** 9 registros en `ani_pasos`

---

### Transformación Paso → Informe Markdown

**Entrada:** `paso_id`, `tipo_paso`, I-JSON

**Transformación:**
1. Obtener prompt correspondiente al `tipo_paso`
2. Llamar a OpenAI API con prompt y I-JSON
3. Recibir respuesta en formato Markdown
4. Almacenar Markdown en R2 con nombre `{tipo_paso}.md`
5. Actualizar `ruta_archivo_r2` en `pasos`
6. Actualizar estado del paso a `correcto`

**Salida:** Archivo Markdown en R2, paso actualizado en `ani_pasos`

---

## Restricciones de Datos

### RD-DATA-01: Unicidad de Proyecto

No pueden existir dos proyectos con el mismo `id`.

**Implementación:** `id` es PRIMARY KEY en D1.

### RD-DATA-02: Integridad Referencial

Todo `proyecto_id` en `ani_ejecuciones`, `ani_pasos` e `ani_informes` debe existir en `ani_proyectos`.

**Implementación:** FOREIGN KEY en D1.

### RD-DATA-03: Integridad Referencial de Ejecución

Todo `ejecucion_id` en `ani_pasos` debe existir en `ani_ejecuciones`.

**Implementación:** FOREIGN KEY en D1.

### RD-DATA-04: Orden de Pasos

Los pasos de una ejecución deben tener `orden` único y secuencial (1-9).

**Implementación:** CHECK constraint en D1.

### RD-DATA-05: Unicidad de Informe por Tipo

No pueden existir dos informes del mismo `tipo` para el mismo `proyecto_id`.

**Implementación:** UNIQUE constraint en tabla `ani_informes`.

### RD-DATA-06: Integridad Referencial de Atributos

Todo `atributo_id` en `ani_valores` debe existir en `ani_atributos`.

**Implementación:** FOREIGN KEY en D1.

---

## Consideraciones de Almacenamiento

### D1 (Base de Datos)

**Ventajas:**
- Consultas estructuradas con SQL
- Transacciones ACID
- Índices para rendimiento
- Relaciones con FOREIGN KEY

**Desventajas:**
- Tamaño máximo de base de datos (500MB)
- No ideal para almacenar archivos grandes

**Uso Adecuado:**
- Metadatos de proyectos
- Historial de ejecuciones
- Pasos de workflows
- Atributos y valores del sistema

### R2 (Almacenamiento de Objetos)

**Ventajas:**
- Almacenamiento ilimitado
- Acceso vía HTTP
- Bajo costo
- Alta durabilidad

**Desventajas:**
- No es una base de datos relacional
- Consultas limitadas

**Uso Adecuado:**
- I-JSON de proyectos
- Informes Markdown generados
- Logs de errores

### KV (Almacenamiento Clave-Valor)

**Ventajas:**
- Acceso ultra rápido
- Bajo costo
- Integración nativa con Workers

**Desventajas:**
- Valor máximo de 1MB por clave
- Sin consultas complejas

**Uso Adecuado:**
- Secrets (OPENAI_API_KEY)
- Configuración temporal
- Caché de valores frecuentes

---

## Migraciones de Esquema

### Migración Inicial

```sql
-- Tabla de proyectos
CREATE TABLE IF NOT EXISTS ani_proyectos (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    i_json TEXT NOT NULL,
    estado TEXT NOT NULL CHECK (estado IN ('creado', 'procesando_analisis', 'analisis_con_error', 'analisis_finalizado')),
    asesor_responsable TEXT,
    fecha_creacion TEXT NOT NULL,
    fecha_actualizacion TEXT NOT NULL,
    fecha_analisis_inicio TEXT,
    fecha_analisis_fin TEXT,
    i_json_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_ani_proyectos_estado ON ani_proyectos(estado);
CREATE INDEX IF NOT EXISTS idx_ani_proyectos_asesor ON ani_proyectos(asesor_responsable);
CREATE INDEX IF NOT EXISTS idx_ani_proyectos_fecha_creacion ON ani_proyectos(fecha_creacion);

-- Tabla de ejecuciones
CREATE TABLE IF NOT EXISTS ani_ejecuciones (
    id TEXT PRIMARY KEY,
    proyecto_id TEXT NOT NULL,
    estado TEXT NOT NULL CHECK (estado IN ('iniciada', 'en_ejecucion', 'finalizada_correctamente', 'finalizada_con_error')),
    fecha_inicio TEXT NOT NULL,
    fecha_fin TEXT,
    error_mensaje TEXT,
    FOREIGN KEY (proyecto_id) REFERENCES ani_proyectos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ani_ejecuciones_proyecto ON ani_ejecuciones(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_ani_ejecuciones_estado ON ani_ejecuciones(estado);
CREATE INDEX IF NOT EXISTS idx_ani_ejecuciones_fecha_inicio ON ani_ejecuciones(fecha_inicio);

-- Tabla de pasos
CREATE TABLE IF NOT EXISTS ani_pasos (
    id TEXT PRIMARY KEY,
    ejecucion_id TEXT NOT NULL,
    tipo_paso TEXT NOT NULL CHECK (tipo_paso IN ('resumen', 'datos_clave', 'activo_fisico', 'activo_estrategico', 'activo_financiero', 'activo_regulado', 'lectura_inversor', 'lectura_emprendedor', 'lectura_propietario')),
    orden INTEGER NOT NULL CHECK (orden BETWEEN 1 AND 9),
    estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'en_ejecucion', 'correcto', 'error')),
    fecha_inicio TEXT NOT NULL,
    fecha_fin TEXT,
    error_mensaje TEXT,
    ruta_archivo_r2 TEXT,
    FOREIGN KEY (ejecucion_id) REFERENCES ani_ejecuciones(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ani_pasos_ejecucion ON ani_pasos(ejecucion_id);
CREATE INDEX IF NOT EXISTS idx_ani_pasos_tipo ON ani_pasos(tipo_paso);
CREATE INDEX IF NOT EXISTS idx_ani_pasos_orden ON ani_pasos(orden);

-- Tabla de atributos
CREATE TABLE IF NOT EXISTS ani_atributos (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE INDEX IF NOT EXISTS idx_ani_atributos_nombre ON ani_atributos(nombre);

-- Tabla de valores
CREATE TABLE IF NOT EXISTS ani_valores (
    id TEXT PRIMARY KEY,
    atributo_id TEXT NOT NULL,
    valor TEXT NOT NULL,
    descripcion TEXT,
    FOREIGN KEY (atributo_id) REFERENCES ani_atributos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ani_valores_atributo ON ani_valores(atributo_id);
CREATE INDEX IF NOT EXISTS idx_ani_valores_valor ON ani_valores(valor);

-- Insertar valores iniciales de atributos
INSERT OR IGNORE INTO atributos (id, nombre, descripcion) VALUES
    ('uuid-estado-proyecto-creado', 'estado_proyecto', 'Proyecto creado, listo para ejecutar análisis'),
    ('uuid-estado-proyecto-procesando_analisis', 'estado_proyecto', 'Análisis en ejecución'),
    ('uuid-estado-proyecto-analisis_con_error', 'estado_proyecto', 'Análisis completado con errores'),
    ('uuid-estado-proyecto-analisis_finalizado', 'estado_proyecto', 'Análisis completado exitosamente');

INSERT OR IGNORE INTO valores (id, atributo_id, valor, descripcion) VALUES
    ('val-estado-proyecto-creado', 'uuid-estado-proyecto-creado', 'creado', NULL),
    ('val-estado-proyecto-procesando_analisis', 'uuid-estado-proyecto-procesando_analisis', 'procesando_analisis', NULL),
    ('val-estado-proyecto-analisis_con_error', 'uuid-estado-proyecto-analisis_con_error', 'analisis_con_error', NULL),
    ('val-estado-proyecto-analisis_finalizado', 'uuid-estado-proyecto-analisis_finalizado', 'analisis_finalizado', NULL);
```

---

## Rendimiento y Optimización

### Estrategias de Consulta

1. **Usar índices apropiados** para filtrar por estado, fecha, etc.
2. **Evitar SELECT *** en consultas frecuentes**
3. **Usar paginación** para listados grandes
4. **Cachear valores frecuentes** en KV (estados, atributos)

### Consideraciones de Tamaño

- **I-JSON:** Puede ser grande (hasta varios KB), almacenar como TEXT en D1
- **Informes Markdown:** Almacenar en R2, no en D1
- **Logs:** Limitar tamaño de logs en R2, rotar si es necesario

---

> **Nota:** Este modelo de datos está basado en [`03 domain-model.md`](../fase02/03%20domain-model.md) y [`01 architecture.md`](./01%20architecture.md) como fuentes principales.
