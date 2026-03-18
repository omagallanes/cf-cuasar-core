-- ============================================================================
-- VaaIA - Database Schema
-- ============================================================================
-- Migration: 001_initial_schema
-- Description: Initial database schema for VaaIA project
-- Database: Cloudflare D1 (SQLite compatible)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: ani_proyectos
-- Description: Stores project data including I-JSON and analysis status
-- ----------------------------------------------------------------------------
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

-- Indexes for ani_proyectos
CREATE INDEX IF NOT EXISTS idx_ani_proyectos_estado ON ani_proyectos(estado);
CREATE INDEX IF NOT EXISTS idx_ani_proyectos_asesor ON ani_proyectos(asesor_responsable);
CREATE INDEX IF NOT EXISTS idx_ani_proyectos_fecha_creacion ON ani_proyectos(fecha_creacion);

-- ----------------------------------------------------------------------------
-- Table: ani_ejecuciones
-- Description: Stores workflow execution history for each project
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ani_ejecuciones (
    id TEXT PRIMARY KEY,
    proyecto_id TEXT NOT NULL,
    estado TEXT NOT NULL CHECK (estado IN ('iniciada', 'en_ejecucion', 'finalizada_correctamente', 'finalizada_con_error')),
    fecha_inicio TEXT NOT NULL,
    fecha_fin TEXT,
    error_mensaje TEXT,
    FOREIGN KEY (proyecto_id) REFERENCES ani_proyectos(id) ON DELETE CASCADE
);

-- Indexes for ani_ejecuciones
CREATE INDEX IF NOT EXISTS idx_ani_ejecuciones_proyecto ON ani_ejecuciones(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_ani_ejecuciones_estado ON ani_ejecuciones(estado);
CREATE INDEX IF NOT EXISTS idx_ani_ejecuciones_fecha_inicio ON ani_ejecuciones(fecha_inicio);

-- ----------------------------------------------------------------------------
-- Table: ani_pasos
-- Description: Stores individual workflow steps for each execution
-- ----------------------------------------------------------------------------
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

-- Indexes for ani_pasos
CREATE INDEX IF NOT EXISTS idx_ani_pasos_ejecucion ON ani_pasos(ejecucion_id);
CREATE INDEX IF NOT EXISTS idx_ani_pasos_tipo ON ani_pasos(tipo_paso);
CREATE INDEX IF NOT EXISTS idx_ani_pasos_orden ON ani_pasos(orden);

-- ----------------------------------------------------------------------------
-- Table: ani_atributos
-- Description: Stores generic system attributes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ani_atributos (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT
);

-- Indexes for ani_atributos
CREATE INDEX IF NOT EXISTS idx_ani_atributos_nombre ON ani_atributos(nombre);

-- ----------------------------------------------------------------------------
-- Table: ani_valores
-- Description: Stores possible values for system attributes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ani_valores (
    id TEXT PRIMARY KEY,
    atributo_id TEXT NOT NULL,
    valor TEXT NOT NULL,
    descripcion TEXT,
    FOREIGN KEY (atributo_id) REFERENCES ani_atributos(id) ON DELETE CASCADE
);

-- Indexes for ani_valores
CREATE INDEX IF NOT EXISTS idx_ani_valores_atributo ON ani_valores(atributo_id);
CREATE INDEX IF NOT EXISTS idx_ani_valores_valor ON ani_valores(valor);

-- ----------------------------------------------------------------------------
-- Initial Data: System Attributes
-- Description: Insert initial attributes and values for project states
-- ----------------------------------------------------------------------------

-- Insert project state attributes
INSERT OR IGNORE INTO ani_atributos (id, nombre, descripcion) VALUES
    ('attr-estado-proyecto-creado', 'estado_proyecto', 'Proyecto creado, listo para ejecutar análisis'),
    ('attr-estado-proyecto-procesando_analisis', 'estado_proyecto', 'Análisis en ejecución'),
    ('attr-estado-proyecto-analisis_con_error', 'estado_proyecto', 'Análisis completado con errores'),
    ('attr-estado-proyecto-analisis_finalizado', 'estado_proyecto', 'Análisis completado exitosamente');

-- Insert project state values
INSERT OR IGNORE INTO ani_valores (id, atributo_id, valor, descripcion) VALUES
    ('val-estado-proyecto-creado', 'attr-estado-proyecto-creado', 'creado', 'Estado inicial del proyecto'),
    ('val-estado-proyecto-procesando_analisis', 'attr-estado-proyecto-procesando_analisis', 'procesando_analisis', 'Análisis en progreso'),
    ('val-estado-proyecto-analisis_con_error', 'attr-estado-proyecto-analisis_con_error', 'analisis_con_error', 'Análisis finalizado con errores'),
    ('val-estado-proyecto-analisis_finalizado', 'attr-estado-proyecto-analisis_finalizado', 'analisis_finalizado', 'Análisis completado exitosamente');

-- Insert execution state attributes
INSERT OR IGNORE INTO ani_atributos (id, nombre, descripcion) VALUES
    ('attr-estado-ejecucion-iniciada', 'estado_ejecucion', 'Ejecución iniciada'),
    ('attr-estado-ejecucion-en_ejecucion', 'estado_ejecucion', 'Ejecución en progreso'),
    ('attr-estado-ejecucion-finalizada_correctamente', 'estado_ejecucion', 'Ejecución finalizada correctamente'),
    ('attr-estado-ejecucion-finalizada_con_error', 'estado_ejecucion', 'Ejecución finalizada con error');

-- Insert execution state values
INSERT OR IGNORE INTO ani_valores (id, atributo_id, valor, descripcion) VALUES
    ('val-estado-ejecucion-iniciada', 'attr-estado-ejecucion-iniciada', 'iniciada', 'Ejecución iniciada'),
    ('val-estado-ejecucion-en_ejecucion', 'attr-estado-ejecucion-en_ejecucion', 'en_ejecucion', 'Ejecución en progreso'),
    ('val-estado-ejecucion-finalizada_correctamente', 'attr-estado-ejecucion-finalizada_correctamente', 'finalizada_correctamente', 'Ejecución finalizada correctamente'),
    ('val-estado-ejecucion-finalizada_con_error', 'attr-estado-ejecucion-finalizada_con_error', 'finalizada_con_error', 'Ejecución finalizada con error');

-- Insert step state attributes
INSERT OR IGNORE INTO ani_atributos (id, nombre, descripcion) VALUES
    ('attr-estado-paso-pendiente', 'estado_paso', 'Paso pendiente de ejecución'),
    ('attr-estado-paso-en_ejecucion', 'estado_paso', 'Paso en ejecución'),
    ('attr-estado-paso-correcto', 'estado_paso', 'Paso completado correctamente'),
    ('attr-estado-paso-error', 'estado_paso', 'Paso completado con error');

-- Insert step state values
INSERT OR IGNORE INTO ani_valores (id, atributo_id, valor, descripcion) VALUES
    ('val-estado-paso-pendiente', 'attr-estado-paso-pendiente', 'pendiente', 'Paso pendiente de ejecución'),
    ('val-estado-paso-en_ejecucion', 'attr-estado-paso-en_ejecucion', 'en_ejecucion', 'Paso en ejecución'),
    ('val-estado-paso-correcto', 'attr-estado-paso-correcto', 'correcto', 'Paso completado correctamente'),
    ('val-estado-paso-error', 'attr-estado-paso-error', 'error', 'Paso completado con error');

-- Insert step type attributes
INSERT OR IGNORE INTO ani_atributos (id, nombre, descripcion) VALUES
    ('attr-tipo-paso-resumen', 'tipo_paso', 'Generar resumen del proyecto'),
    ('attr-tipo-paso-datos_clave', 'tipo_paso', 'Extraer datos clave del proyecto'),
    ('attr-tipo-paso-activo_fisico', 'tipo_paso', 'Analizar activo físico'),
    ('attr-tipo-paso-activo_estrategico', 'tipo_paso', 'Analizar activo estratégico'),
    ('attr-tipo-paso-activo_financiero', 'tipo_paso', 'Analizar activo financiero'),
    ('attr-tipo-paso-activo_regulado', 'tipo_paso', 'Analizar activo regulado'),
    ('attr-tipo-paso-lectura_inversor', 'tipo_paso', 'Generar lectura para inversor'),
    ('attr-tipo-paso-lectura_emprendedor', 'tipo_paso', 'Generar lectura para emprendedor'),
    ('attr-tipo-paso-lectura_propietario', 'tipo_paso', 'Generar lectura para propietario');

-- Insert step type values
INSERT OR IGNORE INTO ani_valores (id, atributo_id, valor, descripcion) VALUES
    ('val-tipo-paso-resumen', 'attr-tipo-paso-resumen', 'resumen', 'Generar resumen del proyecto'),
    ('val-tipo-paso-datos_clave', 'attr-tipo-paso-datos_clave', 'datos_clave', 'Extraer datos clave del proyecto'),
    ('val-tipo-paso-activo_fisico', 'attr-tipo-paso-activo_fisico', 'activo_fisico', 'Analizar activo físico'),
    ('val-tipo-paso-activo_estrategico', 'attr-tipo-paso-activo_estrategico', 'activo_estrategico', 'Analizar activo estratégico'),
    ('val-tipo-paso-activo_financiero', 'attr-tipo-paso-activo_financiero', 'activo_financiero', 'Analizar activo financiero'),
    ('val-tipo-paso-activo_regulado', 'attr-tipo-paso-activo_regulado', 'activo_regulado', 'Analizar activo regulado'),
    ('val-tipo-paso-lectura_inversor', 'attr-tipo-paso-lectura_inversor', 'lectura_inversor', 'Generar lectura para inversor'),
    ('val-tipo-paso-lectura_emprendedor', 'attr-tipo-paso-lectura_emprendedor', 'lectura_emprendedor', 'Generar lectura para emprendedor'),
    ('val-tipo-paso-lectura_propietario', 'attr-tipo-paso-lectura_propietario', 'lectura_propietario', 'Generar lectura para propietario');

-- ============================================================================
-- End of Migration: 001_initial_schema
-- ============================================================================
