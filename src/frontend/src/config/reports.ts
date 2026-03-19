/**
 * Configuración centralizada de reportes
 * Regla R2: Cero hardcoding - todos los textos de reportes deben estar centralizados
 */

export interface ReportConfig {
  id: string;
  label: string;
  title: string;
  description: string;
  icon?: string;
}

export const reportConfigs: ReportConfig[] = [
  {
    id: 'resumen',
    label: 'Resumen',
    title: 'Resumen Ejecutivo',
    description: 'Resumen general del análisis con puntos clave y conclusiones principales.',
    icon: 'FileText'
  },
  {
    id: 'datos_clave',
    label: 'Datos Clave',
    title: 'Datos Clave del Negocio',
    description: 'Información fundamental y métricas clave del negocio analizado.',
    icon: 'Key'
  },
  {
    id: 'activo_fisico',
    label: 'Activo Físico',
    title: 'Análisis del Activo Físico',
    description: 'Evaluación detallada de los activos físicos del negocio.',
    icon: 'Building2'
  },
  {
    id: 'activo_estrategico',
    label: 'Activo Estratégico',
    title: 'Análisis del Activo Estratégico',
    description: 'Análisis de posicionamiento estratégico y ventajas competitivas.',
    icon: 'Target'
  },
  {
    id: 'activo_financiero',
    label: 'Activo Financiero',
    title: 'Análisis del Activo Financiero',
    description: 'Evaluación de la situación financiera y proyecciones.',
    icon: 'DollarSign'
  },
  {
    id: 'activo_regulado',
    label: 'Activo Regulado',
    title: 'Análisis del Activo Regulado',
    description: 'Análisis del marco regulatorio y cumplimiento.',
    icon: 'Scale'
  },
  {
    id: 'lectura_inversor',
    label: 'Lectura Inversor',
    title: 'Lectura para Inversores',
    description: 'Análisis desde la perspectiva de un inversor potencial.',
    icon: 'TrendingUp'
  },
  {
    id: 'lectura_emprendedor',
    label: 'Lectura Emprendedor',
    title: 'Lectura para Emprendedores',
    description: 'Análisis desde la perspectiva de un emprendedor.',
    icon: 'Lightbulb'
  },
  {
    id: 'lectura_propietario',
    label: 'Lectura Propietario',
    title: 'Lectura para Propietarios',
    description: 'Análisis desde la perspectiva del propietario actual.',
    icon: 'User'
  }
];

export const reportsConfig = {
  reports: reportConfigs,
  defaultReportId: 'resumen',
  loadingMessage: 'Cargando informe...',
  errorMessage: 'Error al cargar el informe',
  retryMessage: 'Reintentar',
  retryingMessage: 'Reintentando...'
} as const;

export type ReportsConfig = typeof reportsConfig;
export type ReportConfigType = ReportConfig;
