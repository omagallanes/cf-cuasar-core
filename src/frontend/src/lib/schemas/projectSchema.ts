/**
 * Esquema Zod para validación de I-JSON (Information JSON)
 * Regla R2: Cero hardcoding - usar variables de entorno para URLs
 * Regla P3 - Opción B: Validación completa con Zod
 */

import { z } from 'zod';

/**
 * Esquema para validar la estructura completa del I-JSON
 * Basado en el modelo de información del extractor inmobiliario
 */
export const iJsonSchema = z.object({
  // Información básica del anuncio
  url_fuente: z.string().url('La URL de fuente no es válida').optional(),
  portal_inmobiliario: z.string().min(1, 'El portal inmobiliario es requerido').optional(),
  id_anuncio: z.string().min(1, 'El ID del anuncio es requerido').optional(),
  titulo_anuncio: z.string().min(1, 'El título del anuncio es requerido').optional(),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').optional(),

  // Tipo de operación e inmueble
  tipo_operacion: z.enum(['venta', 'alquiler', 'traspaso', 'compartir', 'obra nueva'], {
    errorMap: () => ({ message: 'El tipo de operación no es válido' })
  }).optional(),
  tipo_inmueble: z.enum(['vivienda', 'local', 'nave', 'oficina', 'garaje', 'trastero', 'solar', 'chalet', 'atico', 'piso', 'estudio', 'duplex', 'hotel', 'hostal', 'casa_rural'], {
    errorMap: () => ({ message: 'El tipo de inmueble no es válido' })
  }).optional(),
  subtipo_inmueble: z.string().optional(),

  // Ubicación
  titulo_ubicacion: z.string().optional(),
  direccion: z.string().optional(),
  barrio: z.string().optional(),
  distrito: z.string().optional(),
  ciudad: z.string().optional(),
  provincia: z.string().optional(),
  pais: z.string().optional(),
  codigo_postal: z.string().regex(/^\d{4,10}$/, 'El código postal no es válido').optional(),
  latitud: z.string().regex(/^-?\d+\.?\d*$/, 'La latitud no es válida').optional(),
  longitud: z.string().regex(/^-?\d+\.?\d*$/, 'La longitud no es válida').optional(),
  ubicacion_resumida: z.string().optional(),

  // Precio
  precio: z.string().regex(/^\d+$/, 'El precio debe ser un número válido').optional(),
  precio_anterior: z.string().regex(/^\d*$/, 'El precio anterior debe ser un número válido').optional(),
  rebaja_porcentaje: z.string().regex(/^\d*\.?\d*$/, 'El porcentaje de rebaja no es válido').optional(),
  moneda: z.enum(['EUR', 'USD', 'GBP', 'CHF', 'JPY'], {
    errorMap: () => ({ message: 'La moneda no es válida' })
  }).optional(),
  precio_periodicidad: z.enum(['mes', 'año', 'dia', 'semana', 'trimestre', ''], {
    errorMap: () => ({ message: 'La periodicidad del precio no es válida' })
  }).optional(),
  precio_por_m2: z.string().regex(/^\d+$/, 'El precio por m² debe ser un número válido').optional(),

  // Superficie
  superficie_total_m2: z.string().regex(/^\d*$/, 'La superficie total debe ser un número válido').optional(),
  superficie_construida_m2: z.string().regex(/^\d*$/, 'La superficie construida debe ser un número válido').optional(),
  superficie_util_m2: z.string().regex(/^\d*$/, 'La superficie útil debe ser un número válido').optional(),
  superficie_anunciada_m2: z.string().regex(/^\d*$/, 'La superficie anunciada debe ser un número válido').optional(),
  terraza_m2: z.string().regex(/^\d*$/, 'La terraza debe ser un número válido').optional(),
  numero_terrazas: z.string().regex(/^\d*$/, 'El número de terrazas debe ser un número válido').optional(),
  terrazas_interiores: z.string().optional(),

  // Características del inmueble
  dormitorios: z.string().regex(/^\d*$/, 'El número de dormitorios debe ser un número válido').optional(),
  banos: z.string().regex(/^\d*$/, 'El número de baños debe ser un número válido').optional(),
  aseos: z.string().regex(/^\d*$/, 'El número de aseos debe ser un número válido').optional(),
  plazas_garaje: z.string().regex(/^\d*$/, 'El número de plazas de garaje debe ser un número válido').optional(),
  garaje_incluido: z.enum(['si', 'no', ''], {
    errorMap: () => ({ message: 'El valor de garaje incluido no es válido' })
  }).optional(),
  garaje_descripcion: z.string().optional(),

  // Edificio
  planta: z.string().optional(),
  plantas_edificio: z.string().regex(/^\d*$/, 'El número de plantas debe ser un número válido').optional(),
  viviendas_por_planta: z.string().regex(/^\d*$/, 'El número de viviendas por planta debe ser un número válido').optional(),
  ascensor: z.enum(['si', 'no', ''], {
    errorMap: () => ({ message: 'El valor de ascensor no es válido' })
  }).optional(),
  acceso_discapacitados: z.enum(['si', 'no', ''], {
    errorMap: () => ({ message: 'El valor de acceso para discapacitados no es válido' })
  }).optional(),
  duplex: z.enum(['si', 'no', ''], {
    errorMap: () => ({ message: 'El valor de dúplex no es válido' })
  }).optional(),

  // Estado y características adicionales
  anio_construccion: z.string().regex(/^\d{4}$/, 'El año de construcción debe tener 4 dígitos').optional(),
  estado_conservacion: z.string().optional(),
  calificacion_energetica: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'En trámite', 'Exento', ''], {
    errorMap: () => ({ message: 'La calificación energética no es válida' })
  }).optional(),
  calefaccion: z.string().optional(),
  aire_acondicionado: z.string().optional(),
  armarios_empotrados: z.enum(['si', 'no', ''], {
    errorMap: () => ({ message: 'El valor de armarios empotrados no es válido' })
  }).optional(),

  // Listas de características
  caracteristicas: z.array(z.string()).default([]),
  equipamiento: z.array(z.string()).default([]),
  distribucion: z.array(z.string()).default([]),
  entorno_y_comunicaciones: z.array(z.string()).default([]),
  entorno_literal: z.string().optional(),

  // Distribución por plantas
  distribucion_por_plantas: z.array(
    z.object({
      planta: z.string().optional(),
      descripcion_literal: z.string().optional()
    })
  ).default([]),

  // Recursos multimedia
  imagenes: z.array(z.any()).default([]),
  planos: z.array(z.any()).default([]),
  mapas: z.array(z.any()).default([]),
  videos: z.array(z.any()).default([]),
  documentos: z.array(z.any()).default([]),

  // Recursos disponibles
  recursos_disponibles_en_anuncio: z.array(z.string()).default([]),
  numero_imagenes_indicado: z.string().regex(/^\d*$/, 'El número de imágenes debe ser un número válido').optional(),
  numero_imagenes_visibles: z.string().regex(/^\d*$/, 'El número de imágenes visibles debe ser un número válido').optional(),
  vista_3d_indicada: z.enum(['si', 'no', ''], {
    errorMap: () => ({ message: 'El valor de vista 3D no es válido' })
  }).optional(),
  video_indicado: z.enum(['si', 'no', ''], {
    errorMap: () => ({ message: 'El valor de video no es válido' })
  }).optional(),
  planos_indicados: z.enum(['si', 'no', ''], {
    errorMap: () => ({ message: 'El valor de planos no es válido' })
  }).optional(),
  virtual_tour_indicado: z.enum(['si', 'no', ''], {
    errorMap: () => ({ message: 'El valor de tour virtual no es válido' })
  }).optional(),
  home_staging_indicado: z.enum(['si', 'no', ''], {
    errorMap: () => ({ message: 'El valor de home staging no es válido' })
  }).optional(),
  visita_guiada_virtual_disponible: z.enum(['si', 'no', ''], {
    errorMap: () => ({ message: 'El valor de visita guiada virtual no es válido' })
  }).optional(),
  multimedia_realizado_por_idealista: z.string().optional(),
  vistas_mencionadas: z.array(z.string()).default([]),

  // Información del anunciante
  anunciante_tipo: z.enum(['particular', 'profesional', ''], {
    errorMap: () => ({ message: 'El tipo de anunciante no es válido' })
  }).optional(),
  anunciante_nombre: z.string().optional(),
  empresa_agencia: z.string().optional(),
  telefono_contacto: z.array(z.string()).default([]),
  email_contacto: z.array(z.string()).default([]),
  horario_contacto: z.string().optional(),
  formulario_contacto: z.enum(['si', 'no', ''], {
    errorMap: () => ({ message: 'El valor de formulario de contacto no es válido' })
  }).optional(),
  url_contacto: z.string().url('La URL de contacto no es válida').optional(),
  enlaces_identificados_en_pagina: z.array(z.string()).default([]),

  // Fechas
  fecha_publicacion: z.string().optional(),
  fecha_actualizacion: z.string().optional(),
  referencia_interna: z.string().optional(),

  // Información adicional del edificio
  tipo_edificio: z.string().optional(),
  orientacion: z.string().optional(),
  exterior: z.enum(['si', 'no', ''], {
    errorMap: () => ({ message: 'El valor de exterior no es válido' })
  }).optional(),

  // Gastos e impuestos
  gastos_comunidad: z.string().regex(/^\d*$/, 'Los gastos de comunidad deben ser un número válido').optional(),
  fianza: z.string().regex(/^\d*$/, 'La fianza debe ser un número válido').optional(),
  consumo_energia: z.string().optional(),
  emisiones_co2: z.string().optional(),
  gastos_e_impuestos_incluidos: z.string().optional(),

  // Otras características
  capacidad_personas: z.string().regex(/^\d*$/, 'La capacidad de personas debe ser un número válido').optional(),
  disponibilidad: z.string().optional(),
  numero_estancias: z.string().regex(/^\d*$/, 'El número de estancias debe ser un número válido').optional(),
  escaparates: z.string().optional(),
  fachada_lineal_m: z.string().regex(/^\d*$/, 'La fachada lineal debe ser un número válido').optional(),
  situado_a_pie_de_calle: z.enum(['si', 'no', ''], {
    errorMap: () => ({ message: 'El valor de situado a pie de calle no es válido' })
  }).optional(),
  oficina: z.enum(['si', 'no', ''], {
    errorMap: () => ({ message: 'El valor de oficina no es válido' })
  }).optional(),
  luz_natural: z.string().optional(),
  ventilacion: z.string().optional(),
  tragaluz: z.string().optional(),

  // Posibles usos
  posibles_usos_mencionados: z.array(z.string()).default([]),
  entrada_desde_calle: z.enum(['si', 'no', ''], {
    errorMap: () => ({ message: 'El valor de entrada desde calle no es válido' })
  }).optional(),
  entrada_desde_patio_edificio: z.enum(['si', 'no', ''], {
    errorMap: () => ({ message: 'El valor de entrada desde patio no es válido' })
  }).optional(),
  posibilidad_cambio_uso_vivienda: z.string().optional(),
  uso_actual: z.string().optional(),
  situacion_arrendamiento: z.string().optional(),
  dividido_en_dos_locales: z.enum(['si', 'no', ''], {
    errorMap: () => ({ message: 'El valor de dividido en dos locales no es válido' })
  }).optional(),
  persiana_metalica: z.string().optional(),
  actividad_comercial_indicada: z.string().optional(),
  zona_descrita_como: z.string().optional(),
  proximidad_lugares_interes: z.array(z.string()).default([]),
  gastos_compra_no_incluidos: z.array(z.string()).default([]),

  // Detalle de superficie
  detalle_superficie: z.array(
    z.object({
      unidad: z.string().optional(),
      planta: z.string().optional(),
      superficie_m2: z.string().optional(),
      coeficiente: z.string().optional(),
      tipo_superficie: z.string().optional(),
      superficie_construida_m2: z.string().optional()
    })
  ).default([]),

  // Observaciones
  nota_anuncio: z.string().optional(),
  aviso_imagenes: z.string().optional(),
  observaciones: z.string().optional()
});

/**
 * Tipo inferido del esquema I-JSON
 */
export type IJsonData = z.infer<typeof iJsonSchema>;

/**
 * Esquema para crear un proyecto con I-JSON
 */
export const createProjectSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(1000, 'La descripción no puede exceder 1000 caracteres'),
  iJson: iJsonSchema.optional()
});

/**
 * Tipo inferido del esquema de creación de proyecto
 */
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

/**
 * Estados de validación del I-JSON
 */
export enum IJsonValidationStatus {
  IDLE = 'idle',
  VALIDATING = 'validating',
  VALID = 'valid',
  INVALID = 'invalid'
}

/**
 * Estados del flujo de creación de proyecto
 */
export enum CreateProjectStatus {
  IDLE = 'idle',           // Formulario vacío
  VALIDATING = 'validating', // Validando I-JSON
  SUBMITTING = 'submitting', // Enviando a API
  SUCCESS = 'success',       // Proyecto creado
  ERROR = 'error'            // Error en el proceso
}
