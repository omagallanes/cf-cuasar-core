/**
 * Hook para recuperación de resultados con TanStack Query
 * Incluye lazy loading de informes Markdown
 * Configuración optimizada de caché
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as resultsService from '../services/resultsService';
import type { ReportFilters } from '../services/resultsService';
import { logError } from '../config/errors';
import { CACHE_CONFIG } from '../lib/queryClient';

/**
 * Hook para obtener un reporte por su ID
 */
export function useReport(reportId: string, enabled = true) {
  return useQuery({
    queryKey: ['report', reportId],
    queryFn: () => resultsService.getReport(reportId),
    enabled: enabled && !!reportId,
    staleTime: CACHE_CONFIG.staleTime.reports,
    gcTime: CACHE_CONFIG.gcTime.reports,
  });
}

/**
 * Hook para obtener todos los reportes
 */
export function useAllReports(filters?: ReportFilters, enabled = true) {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => resultsService.getAllReports(filters),
    enabled,
    staleTime: CACHE_CONFIG.staleTime.reports,
    gcTime: CACHE_CONFIG.gcTime.reports,
  });
}

/**
 * Hook para obtener reportes de un proyecto
 */
export function useProjectReports(projectId: string, enabled = true) {
  return useQuery({
    queryKey: ['projectReports', projectId],
    queryFn: () => resultsService.getProjectReports(projectId),
    enabled: enabled && !!projectId,
    staleTime: CACHE_CONFIG.staleTime.reports,
    gcTime: CACHE_CONFIG.gcTime.reports,
  });
}

/**
 * Hook para obtener el último reporte de un proyecto
 */
export function useLatestReport(projectId: string, enabled = true) {
  return useQuery({
    queryKey: ['latestReport', projectId],
    queryFn: () => resultsService.getLatestReport(projectId),
    enabled: enabled && !!projectId,
    staleTime: CACHE_CONFIG.staleTime.reports,
    gcTime: CACHE_CONFIG.gcTime.reports,
  });
}

/**
 * Hook para descargar un reporte
 */
export function useDownloadReport() {
  return useMutation({
    mutationFn: ({ reportId, format }: { reportId: string; format: 'markdown' | 'html' | 'pdf' }) =>
      resultsService.downloadReport(reportId, format),
  });
}

/**
 * Hook para obtener el resumen de resultados de un proyecto
 */
export function useProjectResultsSummary(projectId: string, enabled = true) {
  return useQuery({
    queryKey: ['projectResultsSummary', projectId],
    queryFn: () => resultsService.getProjectResultsSummary(projectId),
    enabled: enabled && !!projectId,
    staleTime: CACHE_CONFIG.staleTime.stats,
    gcTime: CACHE_CONFIG.gcTime.stats,
  });
}

/**
 * Hook combinado para obtener resultados completos de un proyecto
 */
export function useProjectResults(projectId: string, enabled = true) {
  const reportsQuery = useProjectReports(projectId, enabled);
  const latestReportQuery = useLatestReport(projectId, enabled);
  const summaryQuery = useProjectResultsSummary(projectId, enabled);

  return {
    reports: reportsQuery.data || [],
    latestReport: latestReportQuery.data,
    summary: summaryQuery.data,
    isLoading: reportsQuery.isLoading || latestReportQuery.isLoading || summaryQuery.isLoading,
    isError: reportsQuery.isError || latestReportQuery.isError || summaryQuery.isError,
    error: reportsQuery.error || latestReportQuery.error || summaryQuery.error,
    refetch: () => {
      reportsQuery.refetch();
      latestReportQuery.refetch();
      summaryQuery.refetch();
    },
  };
}

/**
 * Hook para lazy loading de un reporte específico con caché
 * Solo carga el contenido del reporte cuando se solicita
 */
export function useLazyReport(projectId: string, reportId: string, enabled = true) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['projectReport', projectId, reportId],
    queryFn: async () => {
      // Primero verificar si ya tenemos el reporte en caché
      const cachedReports = queryClient.getQueryData(['projectReports', projectId]) as any[];
      if (cachedReports) {
        const cachedReport = cachedReports.find((r: any) => r.id === reportId);
        if (cachedReport && cachedReport.content) {
          return cachedReport;
        }
      }
      
      // Si no está en caché, cargarlo desde el servicio
      return resultsService.getReport(reportId);
    },
    enabled: enabled && !!projectId && !!reportId,
    staleTime: CACHE_CONFIG.staleTime.reports,
    gcTime: CACHE_CONFIG.gcTime.reports,
  });
}

/**
 * Hook para lazy loading de múltiples reportes
 * Carga los reportes bajo demanda
 */
export function useLazyReports(projectId: string, reportIds: string[], enabled = true) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['projectReportsLazy', projectId, reportIds],
    queryFn: async () => {
      const reports: any[] = [];
      
      // Verificar caché primero
      const cachedReports = queryClient.getQueryData(['projectReports', projectId]) as any[];
      
      for (const reportId of reportIds) {
        if (cachedReports) {
          const cachedReport = cachedReports.find((r: any) => r.id === reportId);
          if (cachedReport && cachedReport.content) {
            reports.push(cachedReport);
            continue;
          }
        }
        
        // Si no está en caché, cargarlo
        try {
          const report = await resultsService.getReport(reportId);
          reports.push(report);
        } catch (error) {
          // Loggear el error
          logError(error, `useLazyReports - Report ${reportId}`);
          console.error(`Error loading report ${reportId}:`, error);
        }
      }
      
      return reports;
    },
    enabled: enabled && !!projectId && reportIds.length > 0,
    staleTime: CACHE_CONFIG.staleTime.reports,
    gcTime: CACHE_CONFIG.gcTime.reports,
  });
}

/**
 * Hook para precargar reportes en caché
 * Útil para cargar reportes que se sabrá que se necesitarán pronto
 */
export function usePrefetchReports() {
  const queryClient = useQueryClient();
  
  const prefetchProjectReports = async (projectId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['projectReports', projectId],
      queryFn: () => resultsService.getProjectReports(projectId),
      staleTime: CACHE_CONFIG.staleTime.reports,
    });
  };
  
  const prefetchReport = async (reportId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['report', reportId],
      queryFn: () => resultsService.getReport(reportId),
      staleTime: CACHE_CONFIG.staleTime.reports,
    });
  };
  
  return {
    prefetchProjectReports,
    prefetchReport,
  };
}

/**
 * Hook para invalidar caché de reportes
 * Útil después de actualizar o crear nuevos reportes
 */
export function useInvalidateReports() {
  const queryClient = useQueryClient();
  
  const invalidateProjectReports = (projectId: string) => {
    queryClient.invalidateQueries({ queryKey: ['projectReports', projectId] });
    queryClient.invalidateQueries({ queryKey: ['projectReportsLazy', projectId] });
    queryClient.invalidateQueries({ queryKey: ['projectResultsSummary', projectId] });
  };
  
  const invalidateReport = (reportId: string) => {
    queryClient.invalidateQueries({ queryKey: ['report', reportId] });
  };
  
  const invalidateAllReports = () => {
    queryClient.invalidateQueries({ queryKey: ['reports'] });
  };
  
  return {
    invalidateProjectReports,
    invalidateReport,
    invalidateAllReports,
  };
}
