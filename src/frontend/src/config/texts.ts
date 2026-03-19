/**
 * Catálogo centralizado de textos de UI
 * Regla R2: Cero hardcoding - todos los textos deben estar centralizados
 */

export const uiTexts = {
  // Header
  header: {
    searchPlaceholder: 'Buscar...',
    menuButtonLabel: 'Abrir menú',
    notificationsLabel: 'Notificaciones',
    userMenuLabel: 'Menú de usuario',
    profile: 'Perfil',
    settings: 'Configuración',
    logout: 'Cerrar sesión'
  },

  // Sidebar
  sidebar: {
    appName: 'VaaIA'
  },

  // Dashboard
  dashboard: {
    title: 'Panel de Control',
    subtitle: 'Resumen general de proyectos',
    stats: {
      totalProjects: 'Total de Proyectos',
      inProgress: 'En Progreso',
      completed: 'Completados',
      failed: 'Fallidos',
      pending: 'Pendientes',
      cancelled: 'Cancelados'
    },
    recentProjects: 'Proyectos Recientes',
    updated: 'Actualizado:'
  },

  // Projects
  projects: {
    title: 'Proyectos',
    subtitle: 'Gestiona tus proyectos de análisis',
    newProject: 'Nuevo Proyecto',
    listView: 'Vista de lista',
    gridView: 'Vista de cuadrícula'
  },

  // Create Project
  createProject: {
    title: 'Crear Nuevo Proyecto',
    subtitle: 'Completa el formulario para crear un nuevo proyecto de análisis',
    back: 'Volver',
    createError: 'Error al crear el proyecto. Por favor, intenta nuevamente.',
    validating: 'Validando I-JSON...',
    submitting: 'Creando proyecto...',
    success: 'Proyecto creado exitosamente',
    error: 'Error al crear el proyecto',
    validationError: 'Error de validación en el I-JSON'
  },

  // Project Detail
  projectDetail: {
    backToProjects: 'Volver a Proyectos',
    loading: 'Cargando proyecto...',
    notFound: 'No se encontró el proyecto.',
    loadError: 'Error al cargar el proyecto. Por favor, intenta nuevamente.',
    deleteError: 'Error al eliminar el proyecto. Por favor, intenta nuevamente.',
    deleteConfirm: '¿Estás seguro de que deseas eliminar este proyecto?',
    runAnalysisError: 'Error al ejecutar el análisis. Por favor, intenta nuevamente.'
  },

  // Results
  results: {
    title: 'Resultados del Análisis',
    subtitle: 'Informes detallados del análisis de negocio',
    back: 'Volver',
    backToProject: 'Volver al Proyecto',
    loading: 'Cargando informes...',
    loadError: 'Error al cargar los informes. Por favor, intenta nuevamente.',
    download: 'Descargar',
    downloadReport: 'Descargar Informe',
    downloadAll: 'Descargar Todos',
    downloadAllReports: 'Descargar Todos los Informes',
    reports: {
      resumen: {
        title: 'Resumen Ejecutivo',
        description: 'Resumen general del análisis con puntos clave y conclusiones principales.'
      },
      datos_clave: {
        title: 'Datos Clave del Negocio',
        description: 'Información fundamental y métricas clave del negocio analizado.'
      },
      activo_fisico: {
        title: 'Análisis del Activo Físico',
        description: 'Evaluación detallada de los activos físicos del negocio.'
      },
      activo_estrategico: {
        title: 'Análisis del Activo Estratégico',
        description: 'Análisis de posicionamiento estratégico y ventajas competitivas.'
      },
      activo_financiero: {
        title: 'Análisis del Activo Financiero',
        description: 'Evaluación de la situación financiera y proyecciones.'
      },
      activo_regulado: {
        title: 'Análisis del Activo Regulado',
        description: 'Análisis del marco regulatorio y cumplimiento.'
      },
      lectura_inversor: {
        title: 'Lectura para Inversores',
        description: 'Análisis desde la perspectiva de un inversor potencial.'
      },
      lectura_emprendedor: {
        title: 'Lectura para Emprendedores',
        description: 'Análisis desde la perspectiva de un emprendedor.'
      },
      lectura_propietario: {
        title: 'Lectura para Propietarios',
        description: 'Análisis desde la perspectiva del propietario actual.'
      }
    },
    status: {
      loading: 'Cargando informe...',
      ready: 'Listo',
      error: 'Error',
      pending: 'Pendiente'
    },
    tabs: {
      all: 'Todos',
      available: 'Disponibles',
      loading: 'Cargando'
    },
    actions: {
      refresh: 'Actualizar',
      print: 'Imprimir',
      share: 'Compartir',
      export: 'Exportar'
    }
  },

  // Loading States
  loading: {
    default: 'Cargando...',
    report: 'Cargando informe...'
  },

  // Buttons
  buttons: {
    cancel: 'Cancelar',
    save: 'Guardar',
    create: 'Crear',
    update: 'Actualizar',
    delete: 'Eliminar',
    edit: 'Editar',
    view: 'Ver',
    retry: 'Reintentar',
    close: 'Cerrar',
    back: 'Volver'
  },

  // Actions
  actions: {
    creating: 'Creando...',
    updating: 'Actualizando...',
    deleting: 'Eliminando...',
    retrying: 'Reintentando...',
    submitting: 'Enviando...'
  },

  // Project Form
  projectForm: {
    nameLabel: 'Nombre del Proyecto',
    namePlaceholder: 'Ej: Análisis de mercado residencial',
    descriptionLabel: 'Descripción',
    descriptionPlaceholder: 'Describe el propósito y objetivos del proyecto...',
    characterCount: 'caracteres',
    createProject: 'Crear Proyecto',
    updateProject: 'Actualizar Proyecto'
  },

  // Status
  status: {
    pending: 'Pendiente',
    inProgress: 'En Progreso',
    completed: 'Completado',
    failed: 'Fallido',
    cancelled: 'Cancelado'
  },

  // Workflow
  workflow: {
    runAnalysis: 'Ejecutar Análisis',
    running: 'Ejecutando...',
    reRunAnalysis: 'Reejecutar Análisis',
    confirmReRun: 'Ya existe un análisis previo para este proyecto. ¿Deseas ejecutar un nuevo análisis?',
    executionStatus: {
      notStarted: 'No iniciado',
      initiated: 'Iniciado',
      running: 'En ejecución',
      completedSuccess: 'Completado correctamente',
      completedError: 'Completado con errores',
    },
    progress: {
      label: 'Progreso',
      currentStep: 'Paso actual',
      stepsCompleted: 'Pasos completados',
      of: 'de',
    },
    errors: {
      maxAttemptsExceeded: 'Se excedió el máximo de intentos de verificación',
      executionFailed: 'La ejecución del workflow falló',
      networkError: 'Error de conexión al verificar el estado',
    },
    polling: {
      checking: 'Verificando estado...',
      attempt: 'Intento',
      of: 'de',
    },
  }
} as const;

export type UITexts = typeof uiTexts;
