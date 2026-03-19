/**
 * Catálogo centralizado de mensajes de error
 * Regla R2: Cero hardcoding - todos los mensajes de error deben estar centralizados
 */

import { SuggestedAction } from '../types/errors';

export const errorMessages = {
  // Errores generales
  general: {
    unknown: {
      title: 'Error inesperado',
      message: 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
      suggestedAction: 'retry' as SuggestedAction,
      actionLabel: 'Intentar nuevamente',
      isRecoverable: true
    },
    network: {
      title: 'Error de conexión',
      message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      suggestedAction: 'check_connection' as SuggestedAction,
      actionLabel: 'Verificar conexión',
      isRecoverable: true
    },
    timeout: {
      title: 'Tiempo de espera excedido',
      message: 'La solicitud tardó más de lo esperado. Por favor, intenta nuevamente.',
      suggestedAction: 'retry' as SuggestedAction,
      actionLabel: 'Intentar nuevamente',
      isRecoverable: true
    },
    unauthorized: {
      title: 'No autorizado',
      message: 'No tienes autorización para realizar esta acción. Por favor, inicia sesión.',
      suggestedAction: 'login' as SuggestedAction,
      actionLabel: 'Iniciar sesión',
      isRecoverable: true
    },
    forbidden: {
      title: 'Acceso denegado',
      message: 'No tienes permisos para acceder a este recurso.',
      suggestedAction: 'go_back' as SuggestedAction,
      actionLabel: 'Volver',
      isRecoverable: true
    },
    notFound: {
      title: 'Recurso no encontrado',
      message: 'El recurso solicitado no fue encontrado.',
      suggestedAction: 'go_back' as SuggestedAction,
      actionLabel: 'Volver',
      isRecoverable: true
    }
  },

  // Errores de proyectos
  projects: {
    createFailed: {
      title: 'Error al crear proyecto',
      message: 'No se pudo crear el proyecto. Por favor, verifica los datos e intenta nuevamente.',
      suggestedAction: 'retry' as SuggestedAction,
      actionLabel: 'Intentar nuevamente',
      isRecoverable: true
    },
    updateFailed: {
      title: 'Error al actualizar proyecto',
      message: 'No se pudo actualizar el proyecto. Por favor, intenta nuevamente.',
      suggestedAction: 'retry' as SuggestedAction,
      actionLabel: 'Intentar nuevamente',
      isRecoverable: true
    },
    deleteFailed: {
      title: 'Error al eliminar proyecto',
      message: 'No se pudo eliminar el proyecto. Por favor, intenta nuevamente.',
      suggestedAction: 'retry' as SuggestedAction,
      actionLabel: 'Intentar nuevamente',
      isRecoverable: true
    },
    loadFailed: {
      title: 'Error al cargar proyecto',
      message: 'No se pudo cargar el proyecto. Por favor, intenta nuevamente.',
      suggestedAction: 'retry' as SuggestedAction,
      actionLabel: 'Intentar nuevamente',
      isRecoverable: true
    },
    listFailed: {
      title: 'Error al cargar proyectos',
      message: 'No se pudo cargar la lista de proyectos. Por favor, intenta nuevamente.',
      suggestedAction: 'retry' as SuggestedAction,
      actionLabel: 'Intentar nuevamente',
      isRecoverable: true
    },
    notFound: {
      title: 'Proyecto no encontrado',
      message: 'No se encontró el proyecto solicitado.',
      suggestedAction: 'go_back' as SuggestedAction,
      actionLabel: 'Volver',
      isRecoverable: true
    },
    deleteConfirm: {
      title: 'Eliminar proyecto',
      message: '¿Estás seguro de que deseas eliminar este proyecto?',
      suggestedAction: 'none' as SuggestedAction,
      actionLabel: '',
      isRecoverable: false
    }
  },

  // Errores de resultados/informes
  results: {
    loadFailed: {
      title: 'Error al cargar informes',
      message: 'No se pudieron cargar los informes. Por favor, intenta nuevamente.',
      suggestedAction: 'retry' as SuggestedAction,
      actionLabel: 'Intentar nuevamente',
      isRecoverable: true
    },
    reportLoadFailed: {
      title: 'Error al cargar informe',
      message: 'No se pudo cargar el informe. Por favor, intenta nuevamente.',
      suggestedAction: 'retry' as SuggestedAction,
      actionLabel: 'Intentar nuevamente',
      isRecoverable: true
    },
    reportGenerateFailed: {
      title: 'Error al generar informe',
      message: 'No se pudo generar el informe. Por favor, intenta nuevamente.',
      suggestedAction: 'retry' as SuggestedAction,
      actionLabel: 'Intentar nuevamente',
      isRecoverable: true
    },
    retryFailed: {
      title: 'Error al reintentar',
      message: 'No se pudo completar la operación. Por favor, intenta nuevamente.',
      suggestedAction: 'retry' as SuggestedAction,
      actionLabel: 'Intentar nuevamente',
      isRecoverable: true
    },
    notReady: {
      title: 'Informe en proceso',
      message: 'El informe aún está siendo generado. Por favor, espera unos minutos.',
      suggestedAction: 'refresh' as SuggestedAction,
      actionLabel: 'Actualizar',
      isRecoverable: true
    }
  },

  // Errores de workflow
  workflow: {
    startFailed: {
      title: 'Error al iniciar análisis',
      message: 'No se pudo iniciar el análisis. Por favor, verifica los datos e intenta nuevamente.',
      suggestedAction: 'retry' as SuggestedAction,
      actionLabel: 'Intentar nuevamente',
      isRecoverable: true
    },
    executionFailed: {
      title: 'Error en el análisis',
      message: 'Ocurrió un error durante la ejecución del análisis. Por favor, intenta nuevamente.',
      suggestedAction: 'retry' as SuggestedAction,
      actionLabel: 'Intentar nuevamente',
      isRecoverable: true
    },
    statusCheckFailed: {
      title: 'Error al verificar estado',
      message: 'No se pudo verificar el estado del análisis. Por favor, actualiza la página.',
      suggestedAction: 'refresh' as SuggestedAction,
      actionLabel: 'Actualizar',
      isRecoverable: true
    },
    timeout: {
      title: 'Análisis en proceso',
      message: 'El análisis está tardando más de lo esperado. Por favor, espera unos minutos.',
      suggestedAction: 'refresh' as SuggestedAction,
      actionLabel: 'Actualizar',
      isRecoverable: true
    },
    stepFailed: {
      title: 'Error en paso del análisis',
      message: 'Ocurrió un error en un paso del análisis. Por favor, intenta nuevamente.',
      suggestedAction: 'retry' as SuggestedAction,
      actionLabel: 'Intentar nuevamente',
      isRecoverable: true
    }
  },

  // Errores de validación
  validation: {
    required: {
      title: 'Campo requerido',
      message: 'Este campo es requerido',
      suggestedAction: 'none' as SuggestedAction,
      actionLabel: '',
      isRecoverable: true
    },
    invalidFormat: {
      title: 'Formato inválido',
      message: 'El formato del campo es inválido',
      suggestedAction: 'none' as SuggestedAction,
      actionLabel: '',
      isRecoverable: true
    },
    tooShort: {
      title: 'Valor muy corto',
      message: 'El valor es demasiado corto',
      suggestedAction: 'none' as SuggestedAction,
      actionLabel: '',
      isRecoverable: true
    },
    tooLong: {
      title: 'Valor muy largo',
      message: 'El valor es demasiado largo',
      suggestedAction: 'none' as SuggestedAction,
      actionLabel: '',
      isRecoverable: true
    },
    invalidEmail: {
      title: 'Correo inválido',
      message: 'El correo electrónico no es válido',
      suggestedAction: 'none' as SuggestedAction,
      actionLabel: '',
      isRecoverable: true
    },
    invalidUrl: {
      title: 'URL inválida',
      message: 'La URL no es válida',
      suggestedAction: 'none' as SuggestedAction,
      actionLabel: '',
      isRecoverable: true
    },
    invalidNumber: {
      title: 'Número inválido',
      message: 'El valor debe ser un número válido',
      suggestedAction: 'none' as SuggestedAction,
      actionLabel: '',
      isRecoverable: true
    },
    minValue: {
      title: 'Valor muy bajo',
      message: 'El valor debe ser mayor o igual a {min}',
      suggestedAction: 'none' as SuggestedAction,
      actionLabel: '',
      isRecoverable: true
    },
    maxValue: {
      title: 'Valor muy alto',
      message: 'El valor debe ser menor o igual a {max}',
      suggestedAction: 'none' as SuggestedAction,
      actionLabel: '',
      isRecoverable: true
    },
    minItems: {
      title: 'Mínimo requerido',
      message: 'Debe seleccionar al menos {min} elementos',
      suggestedAction: 'none' as SuggestedAction,
      actionLabel: '',
      isRecoverable: true
    },
    maxItems: {
      title: 'Máximo excedido',
      message: 'Debe seleccionar como máximo {max} elementos',
      suggestedAction: 'none' as SuggestedAction,
      actionLabel: '',
      isRecoverable: true
    }
  },

  // Errores de formulario
  form: {
    nameRequired: {
      title: 'Nombre requerido',
      message: 'El nombre es requerido',
      suggestedAction: 'none' as SuggestedAction,
      actionLabel: '',
      isRecoverable: true
    },
    nameTooShort: {
      title: 'Nombre muy corto',
      message: 'El nombre debe tener al menos 3 caracteres',
      suggestedAction: 'none' as SuggestedAction,
      actionLabel: '',
      isRecoverable: true
    },
    nameTooLong: {
      title: 'Nombre muy largo',
      message: 'El nombre no puede exceder 100 caracteres',
      suggestedAction: 'none' as SuggestedAction,
      actionLabel: '',
      isRecoverable: true
    },
    descriptionRequired: {
      title: 'Descripción requerida',
      message: 'La descripción es requerida',
      suggestedAction: 'none' as SuggestedAction,
      actionLabel: '',
      isRecoverable: true
    },
    descriptionTooShort: {
      title: 'Descripción muy corta',
      message: 'La descripción debe tener al menos 10 caracteres',
      suggestedAction: 'none' as SuggestedAction,
      actionLabel: '',
      isRecoverable: true
    },
    descriptionTooLong: {
      title: 'Descripción muy larga',
      message: 'La descripción no puede exceder 1000 caracteres',
      suggestedAction: 'none' as SuggestedAction,
      actionLabel: '',
      isRecoverable: true
    }
  },

  // Errores de API
  api: {
    serverError: {
      title: 'Error del servidor',
      message: 'Error del servidor. Por favor, intenta nuevamente más tarde.',
      suggestedAction: 'retry' as SuggestedAction,
      actionLabel: 'Intentar nuevamente',
      isRecoverable: true
    },
    badRequest: {
      title: 'Solicitud inválida',
      message: 'La solicitud es inválida. Por favor, verifica los datos.',
      suggestedAction: 'retry' as SuggestedAction,
      actionLabel: 'Intentar nuevamente',
      isRecoverable: true
    },
    conflict: {
      title: 'Conflicto de datos',
      message: 'Ya existe un recurso con estos datos.',
      suggestedAction: 'go_back' as SuggestedAction,
      actionLabel: 'Volver',
      isRecoverable: true
    },
    rateLimitExceeded: {
      title: 'Límite excedido',
      message: 'Has excedido el límite de solicitudes. Por favor, espera unos minutos.',
      suggestedAction: 'none' as SuggestedAction,
      actionLabel: '',
      isRecoverable: true
    },
    serviceUnavailable: {
      title: 'Servicio no disponible',
      message: 'El servicio no está disponible en este momento.',
      suggestedAction: 'refresh' as SuggestedAction,
      actionLabel: 'Actualizar',
      isRecoverable: true
    }
  },

  // Errores de almacenamiento
  storage: {
    quotaExceeded: {
      title: 'Espacio excedido',
      message: 'Se ha excedido el espacio de almacenamiento.',
      suggestedAction: 'contact_support' as SuggestedAction,
      actionLabel: 'Contactar soporte',
      isRecoverable: false
    },
    saveFailed: {
      title: 'Error al guardar',
      message: 'Error al guardar los datos. Por favor, intenta nuevamente.',
      suggestedAction: 'retry' as SuggestedAction,
      actionLabel: 'Intentar nuevamente',
      isRecoverable: true
    },
    loadFailed: {
      title: 'Error al cargar',
      message: 'Error al cargar los datos. Por favor, intenta nuevamente.',
      suggestedAction: 'retry' as SuggestedAction,
      actionLabel: 'Intentar nuevamente',
      isRecoverable: true
    },
    deleteFailed: {
      title: 'Error al eliminar',
      message: 'Error al eliminar los datos. Por favor, intenta nuevamente.',
      suggestedAction: 'retry' as SuggestedAction,
      actionLabel: 'Intentar nuevamente',
      isRecoverable: true
    }
  }
} as const;

export type ErrorMessages = typeof errorMessages;

/**
 * Función para obtener información de error amigable basada en el tipo de error
 */
export function getErrorInfo(error: unknown): {
  title: string;
  message: string;
  suggestedAction: SuggestedAction;
  actionLabel: string;
  isRecoverable: boolean;
} {
  // Errores de red
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (error.name === 'NetworkError' || message.includes('network') || message.includes('fetch')) {
      return errorMessages.general.network;
    }
    
    if (error.name === 'TimeoutError' || message.includes('timeout')) {
      return errorMessages.general.timeout;
    }
    
    if (error.name === 'NotFoundError' || message.includes('not found')) {
      return errorMessages.general.notFound;
    }
    
    if (error.name === 'ConflictError' || message.includes('conflict')) {
      return errorMessages.api.conflict;
    }
    
    if (error.name === 'UnauthorizedError' || message.includes('unauthorized')) {
      return errorMessages.general.unauthorized;
    }
    
    if (error.name === 'ForbiddenError' || message.includes('forbidden')) {
      return errorMessages.general.forbidden;
    }
    
    if (error.name === 'WorkflowError') {
      return errorMessages.workflow.executionFailed;
    }
  }
  
  // Error genérico
  return errorMessages.general.unknown;
}

/**
 * Función para loggear errores de forma consistente
 */
export function logError(error: unknown, context?: string) {
  const prefix = context ? `[${context}]` : '[Error]';
  
  if (error instanceof Error) {
    console.error(`${prefix} ${error.name}: ${error.message}`, error);
  } else {
    console.error(`${prefix}`, error);
  }
}
