/**
 * Catálogo centralizado de mensajes de validación
 * Regla R2: Cero hardcoding - todos los mensajes de validación deben estar centralizados
 */

export const validationMessages = {
  // Mensajes generales
  required: 'Este campo es requerido',
  optional: 'Campo opcional',

  // Longitud
  minLength: (min: number) => `Debe tener al menos ${min} caracteres`,
  maxLength: (max: number) => `No puede exceder ${max} caracteres`,
  exactLength: (length: number) => `Debe tener exactamente ${length} caracteres`,

  // Números
  minNumber: (min: number) => `Debe ser mayor o igual a ${min}`,
  maxNumber: (max: number) => `Debe ser menor o igual a ${max}`,
  positiveNumber: 'Debe ser un número positivo',
  integer: 'Debe ser un número entero',

  // Email
  emailInvalid: 'El correo electrónico no es válido',
  emailRequired: 'El correo electrónico es requerido',

  // URL
  urlInvalid: 'La URL no es válida',

  // Patrones
  patternMismatch: 'El formato no es válido',

  // Selección
  minItems: (min: number) => `Debe seleccionar al menos ${min} elementos`,
  maxItems: (max: number) => `Debe seleccionar como máximo ${max} elementos`,

  // Fechas
  dateInvalid: 'La fecha no es válida',
  dateMin: 'La fecha debe ser posterior a la fecha mínima',
  dateMax: 'La fecha debe ser anterior a la fecha máxima',
  dateRangeInvalid: 'El rango de fechas no es válido',

  // Archivos
  fileRequired: 'Debe seleccionar un archivo',
  fileInvalidType: 'El tipo de archivo no es válido',
  fileTooLarge: (maxSize: string) => `El archivo excede el tamaño máximo de ${maxSize}`,
  fileTooSmall: (minSize: string) => `El archivo es menor que el tamaño mínimo de ${minSize}`,

  // Contraseñas
  passwordTooShort: (min: number) => `La contraseña debe tener al menos ${min} caracteres`,
  passwordTooWeak: 'La contraseña debe incluir mayúsculas, minúsculas y números',
  passwordMismatch: 'Las contraseñas no coinciden',

  // Campos específicos del proyecto
  projectName: {
    required: 'El nombre es requerido',
    tooShort: 'El nombre debe tener al menos 3 caracteres',
    tooLong: 'El nombre no puede exceder 100 caracteres'
  },
  projectDescription: {
    required: 'La descripción es requerida',
    tooShort: 'La descripción debe tener al menos 10 caracteres',
    tooLong: 'La descripción no puede exceder 1000 caracteres'
  },

  // Validación de I-JSON
  iJson: {
    // Información básica
    urlFuenteInvalid: 'La URL de fuente no es válida',
    portalInmobiliarioRequired: 'El portal inmobiliario es requerido',
    idAnuncioRequired: 'El ID del anuncio es requerido',
    tituloAnuncioRequired: 'El título del anuncio es requerido',
    descripcionTooShort: 'La descripción debe tener al menos 10 caracteres',
    
    // Tipo de operación e inmueble
    tipoOperacionInvalid: 'El tipo de operación no es válido (venta, alquiler, traspaso, compartir, obra nueva)',
    tipoInmuebleInvalid: 'El tipo de inmueble no es válido',
    
    // Ubicación
    codigoPostalInvalid: 'El código postal debe contener solo dígitos (4-10 caracteres)',
    latitudInvalid: 'La latitud no es válida',
    longitudInvalid: 'La longitud no es válida',
    
    // Precio
    precioInvalid: 'El precio debe ser un número válido',
    precioAnteriorInvalid: 'El precio anterior debe ser un número válido',
    rebajaPorcentajeInvalid: 'El porcentaje de rebaja no es válido',
    monedaInvalid: 'La moneda no es válida (EUR, USD, GBP, CHF, JPY)',
    precioPeriodicidadInvalid: 'La periodicidad del precio no es válida',
    precioPorM2Invalid: 'El precio por m² debe ser un número válido',
    
    // Superficie
    superficieInvalid: 'La superficie debe ser un número válido',
    terrazaInvalid: 'La terraza debe ser un número válido',
    numeroTerrazasInvalid: 'El número de terrazas debe ser un número válido',
    
    // Características
    numeroInvalid: 'El valor debe ser un número válido',
    garajeIncluidoInvalid: 'El valor de garaje incluido debe ser: si, no o vacío',
    ascensorInvalid: 'El valor de ascensor debe ser: si, no o vacío',
    accesoDiscapacitadosInvalid: 'El valor de acceso para discapacitados debe ser: si, no o vacío',
    duplexInvalid: 'El valor de dúplex debe ser: si, no o vacío',
    
    // Estado y características
    anioConstruccionInvalid: 'El año de construcción debe tener 4 dígitos',
    calificacionEnergeticaInvalid: 'La calificación energética no es válida (A-G, En trámite, Exento)',
    armariosEmpotradosInvalid: 'El valor de armarios empotrados debe ser: si, no o vacío',
    
    // Recursos
    numeroImagenesInvalid: 'El número de imágenes debe ser un número válido',
    vista3dInvalid: 'El valor de vista 3D debe ser: si, no o vacío',
    videoIndicadoInvalid: 'El valor de video debe ser: si, no o vacío',
    planosIndicadosInvalid: 'El valor de planos debe ser: si, no o vacío',
    virtualTourInvalid: 'El valor de tour virtual debe ser: si, no o vacío',
    homeStagingInvalid: 'El valor de home staging debe ser: si, no o vacío',
    visitaGuiadaVirtualInvalid: 'El valor de visita guiada virtual debe ser: si, no o vacío',
    
    // Anunciante
    anuncianteTipoInvalid: 'El tipo de anunciante debe ser: particular, profesional o vacío',
    formularioContactoInvalid: 'El valor de formulario de contacto debe ser: si, no o vacío',
    urlContactoInvalid: 'La URL de contacto no es válida',
    
    // Gastos
    gastosComunidadInvalid: 'Los gastos de comunidad deben ser un número válido',
    fianzaInvalid: 'La fianza debe ser un número válido',
    
    // Otras características
    capacidadPersonasInvalid: 'La capacidad de personas debe ser un número válido',
    numeroEstanciasInvalid: 'El número de estancias debe ser un número válido',
    fachadaLinealInvalid: 'La fachada lineal debe ser un número válido',
    situadoPieCalleInvalid: 'El valor de situado a pie de calle debe ser: si, no o vacío',
    oficinaInvalid: 'El valor de oficina debe ser: si, no o vacío',
    
    // Usos
    entradaDesdeCalleInvalid: 'El valor de entrada desde calle debe ser: si, no o vacío',
    entradaDesdePatioInvalid: 'El valor de entrada desde patio debe ser: si, no o vacío',
    divididoDosLocalesInvalid: 'El valor de dividido en dos locales debe ser: si, no o vacío',
    
    // JSON general
    jsonInvalid: 'El JSON no es válido',
    jsonStructureInvalid: 'La estructura del JSON no es válida',
    jsonRequiredFields: 'Faltan campos requeridos en el JSON',
    jsonTypeMismatch: 'Tipo de dato incorrecto en el JSON'
  },

  // Estados del flujo de creación
  createProject: {
    validating: 'Validando I-JSON...',
    submitting: 'Creando proyecto...',
    success: 'Proyecto creado exitosamente',
    error: 'Error al crear el proyecto',
    validationError: 'Error de validación en el I-JSON'
  },

  // Etiquetas de formulario
  labels: {
    required: 'Campo requerido',
    optional: 'Opcional'
  },

  // Caracteres
  characterCount: (current: number, max: number) => `${current} / ${max} caracteres`
} as const;

export type ValidationMessages = typeof validationMessages;
