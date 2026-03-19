/**
 * Hook para ejecución de workflows con TanStack Query
 * Configuración optimizada de caché
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as workflowService from '../services/workflowService';
import type {
  WorkflowExecution,
  StartWorkflowInput,
  WorkflowProgress,
} from '../types/workflow';
import {
  useWorkflowPolling,
  WorkflowExecutionState,
  type WorkflowPollingResult,
} from './useWorkflowPolling';
import { CACHE_CONFIG } from '../lib/queryClient';

/**
 * Hook para iniciar un workflow
 */
export function useStartWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: StartWorkflowInput) => workflowService.startWorkflow(input),
    onSuccess: (_, variables) => {
      // Invalidar las ejecuciones del proyecto
      queryClient.invalidateQueries({
        queryKey: ['projectExecutions', variables.projectId],
      });
      // Invalidar el proyecto para actualizar su estado
      queryClient.invalidateQueries({
        queryKey: ['project', variables.projectId],
      });
      // Invalidar la lista de proyectos
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

/**
 * Hook para obtener una ejecución de workflow
 */
export function useExecution(executionId: string, enabled = true) {
  return useQuery({
    queryKey: ['execution', executionId],
    queryFn: () => workflowService.getExecution(executionId),
    enabled: enabled && !!executionId,
    staleTime: CACHE_CONFIG.staleTime.workflow,
    gcTime: CACHE_CONFIG.gcTime.workflow,
    refetchInterval: (query) => {
      // Refrescar automáticamente mientras esté en ejecución
      const data = query.state.data as WorkflowExecution | undefined;
      if (data?.status === 'running' || data?.status === 'pending') {
        return 2000; // Refrescar cada 2 segundos
      }
      return false; // No refrescar si está completado o fallido
    },
  });
}

/**
 * Hook para obtener los pasos de una ejecución
 */
export function useExecutionSteps(executionId: string, enabled = true) {
  return useQuery({
    queryKey: ['executionSteps', executionId],
    queryFn: () => workflowService.getExecutionSteps(executionId),
    enabled: enabled && !!executionId,
    staleTime: CACHE_CONFIG.staleTime.workflow,
    gcTime: CACHE_CONFIG.gcTime.workflow,
  });
}

/**
 * Hook para obtener el progreso de una ejecución
 */
export function useExecutionProgress(executionId: string, enabled = true) {
  return useQuery({
    queryKey: ['executionProgress', executionId],
    queryFn: () => workflowService.getExecutionProgress(executionId),
    enabled: enabled && !!executionId,
    staleTime: CACHE_CONFIG.staleTime.workflow,
    gcTime: CACHE_CONFIG.gcTime.workflow,
    refetchInterval: (query) => {
      // Refrescar automáticamente mientras esté en ejecución
      const data = query.state.data as WorkflowProgress | undefined;
      if (data?.status === 'running' || data?.status === 'pending') {
        return 2000; // Refrescar cada 2 segundos
      }
      return false;
    },
  });
}

/**
 * Hook para cancelar una ejecución
 */
export function useCancelExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (executionId: string) => workflowService.cancelExecution(executionId),
    onSuccess: (_, executionId) => {
      // Invalidar la ejecución específica
      queryClient.invalidateQueries({ queryKey: ['execution', executionId] });
      queryClient.invalidateQueries({ queryKey: ['executionProgress', executionId] });
      queryClient.invalidateQueries({ queryKey: ['executionSteps', executionId] });
    },
  });
}

/**
 * Hook para obtener ejecuciones de un proyecto
 */
export function useProjectExecutions(projectId: string, enabled = true) {
  return useQuery({
    queryKey: ['projectExecutions', projectId],
    queryFn: () => workflowService.getProjectExecutions(projectId),
    enabled: enabled && !!projectId,
    staleTime: CACHE_CONFIG.staleTime.workflow,
    gcTime: CACHE_CONFIG.gcTime.workflow,
  });
}

/**
 * Hook para obtener la última ejecución de un proyecto
 */
export function useLatestExecution(projectId: string, enabled = true) {
  return useQuery({
    queryKey: ['latestExecution', projectId],
    queryFn: () => workflowService.getLatestExecution(projectId),
    enabled: enabled && !!projectId,
    staleTime: CACHE_CONFIG.staleTime.workflow,
    gcTime: CACHE_CONFIG.gcTime.workflow,
  });
}

/**
 * Hook para reintentar una ejecución fallida
 */
export function useRetryExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (executionId: string) => workflowService.retryExecution(executionId),
    onSuccess: (_, executionId) => {
      // Invalidar la ejecución específica
      queryClient.invalidateQueries({ queryKey: ['execution', executionId] });
      queryClient.invalidateQueries({ queryKey: ['executionProgress', executionId] });
      queryClient.invalidateQueries({ queryKey: ['executionSteps', executionId] });
    },
  });
}

/**
 * Hook combinado para monitorear una ejecución con su progreso
 */
export function useWorkflowMonitor(executionId: string, enabled = true) {
  const executionQuery = useExecution(executionId, enabled);
  const progressQuery = useExecutionProgress(executionId, enabled);
  const stepsQuery = useExecutionSteps(executionId, enabled);

  return {
    execution: executionQuery.data,
    progress: progressQuery.data,
    steps: stepsQuery.data,
    isLoading: executionQuery.isLoading || progressQuery.isLoading || stepsQuery.isLoading,
    isError: executionQuery.isError || progressQuery.isError || stepsQuery.isError,
    error: executionQuery.error || progressQuery.error || stepsQuery.error,
    refetch: () => {
      executionQuery.refetch();
      progressQuery.refetch();
      stepsQuery.refetch();
    },
  };
}

/**
 * Hook combinado para iniciar workflow y hacer polling de estado
 * Combina el inicio del workflow con el monitoreo automático de su estado
 */
export function useStartWorkflowWithPolling() {
  const startWorkflow = useStartWorkflow();

  return {
    ...startWorkflow,
    mutateAsync: async (
      input: StartWorkflowInput,
      callbacks?: {
        onStateChange?: (state: WorkflowExecutionState) => void;
        onError?: (error: string) => void;
        onComplete?: (result: WorkflowPollingResult) => void;
      }
    ) => {
      // Iniciar el workflow
      const execution = await startWorkflow.mutateAsync(input);
      
      // Iniciar polling del estado
      const polling = useWorkflowPolling({
        executionId: execution.id,
        enabled: true,
        onStateChange: callbacks?.onStateChange,
        onError: callbacks?.onError,
        onComplete: callbacks?.onComplete,
      });

      return {
        execution,
        polling,
      };
    },
  };
}
