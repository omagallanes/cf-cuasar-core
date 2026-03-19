/**
 * Hook para polling de estado de workflow
 * Configuración de polling basada en variables de entorno
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { WorkflowStatus } from '../types/workflow';
import { getErrorInfo, logError } from '../config/errors';

/**
 * Configuración de polling desde variables de entorno
 */
const POLLING_CONFIG = {
  interval: Number(import.meta.env.VITE_WORKFLOW_POLLING_INTERVAL) || 10000, // 10 segundos por defecto
  maxAttempts: Number(import.meta.env.VITE_WORKFLOW_POLLING_MAX_ATTEMPTS) || 3,
  backoff: import.meta.env.VITE_WORKFLOW_POLLING_BACKOFF === 'true', // false por defecto
} as const;

/**
 * Estados de ejecución del workflow para la UI
 */
export enum WorkflowExecutionState {
  NOT_STARTED = 'not_started',
  INITIATED = 'iniciada',
  RUNNING = 'en_ejecucion',
  COMPLETED_SUCCESS = 'finalizada_correctamente',
  COMPLETED_ERROR = 'finalizada_con_error',
}

/**
 * Resultado del polling
 */
export interface WorkflowPollingResult {
  state: WorkflowExecutionState;
  progress: number;
  currentStep?: string;
  error?: string;
  isPolling: boolean;
  attempt: number;
}

/**
 * Opciones para el hook de polling
 */
export interface WorkflowPollingOptions {
  executionId?: string;
  enabled?: boolean;
  onStateChange?: (state: WorkflowExecutionState) => void;
  onError?: (error: string) => void;
  onComplete?: (result: WorkflowPollingResult) => void;
}

/**
 * Hook para polling de estado de workflow
 * @param options Opciones de configuración del polling
 * @returns Estado y resultado del polling
 */
export function useWorkflowPolling(options: WorkflowPollingOptions = {}) {
  const {
    executionId,
    enabled = true,
    onStateChange,
    onError,
    onComplete,
  } = options;

  const [result, setResult] = useState<WorkflowPollingResult>({
    state: WorkflowExecutionState.NOT_STARTED,
    progress: 0,
    isPolling: false,
    attempt: 0,
  });

  const [currentExecutionId, setCurrentExecutionId] = useState<string | undefined>(executionId);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const attemptRef = useRef(0);

  /**
   * Mapea el estado del workflow al estado de ejecución de la UI
   */
  const mapWorkflowState = useCallback((status: WorkflowStatus): WorkflowExecutionState => {
    switch (status) {
      case WorkflowStatus.PENDING:
        return WorkflowExecutionState.INITIATED;
      case WorkflowStatus.RUNNING:
        return WorkflowExecutionState.RUNNING;
      case WorkflowStatus.COMPLETED:
        return WorkflowExecutionState.COMPLETED_SUCCESS;
      case WorkflowStatus.FAILED:
      case WorkflowStatus.CANCELLED:
        return WorkflowExecutionState.COMPLETED_ERROR;
      default:
        return WorkflowExecutionState.NOT_STARTED;
    }
  }, []);

  /**
   * Obtiene el estado actual del workflow desde la API
   */
  const fetchWorkflowStatus = useCallback(async (): Promise<WorkflowPollingResult> => {
    if (!currentExecutionId) {
      return result;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/workflows/ejecuciones/${currentExecutionId}`
      );

      if (!response.ok) {
        throw new Error(`Error al obtener estado: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.data) {
        throw new Error('Respuesta inválida de la API');
      }

      const workflowExecution = data.data;
      const state = mapWorkflowState(workflowExecution.status);

      return {
        state,
        progress: workflowExecution.progress || 0,
        currentStep: workflowExecution.currentStep,
        error: workflowExecution.error,
        isPolling: true,
        attempt: attemptRef.current,
      };
    } catch (error) {
      // Loggear el error
      logError(error, 'useWorkflowPolling');
      
      // Obtener mensaje de error amigable
      const errorInfo = getErrorInfo(error instanceof Error ? error : new Error(String(error)));
      
      return {
        state: WorkflowExecutionState.COMPLETED_ERROR,
        progress: result.progress,
        error: errorInfo.message,
        isPolling: false,
        attempt: attemptRef.current,
      };
    }
  }, [currentExecutionId, mapWorkflowState, result.progress]);

  /**
   * Inicia el polling
   */
  const startPolling = useCallback((execId: string) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setCurrentExecutionId(execId);
    attemptRef.current = 0;
    setResult({
      state: WorkflowExecutionState.INITIATED,
      progress: 0,
      isPolling: true,
      attempt: 0,
    });

    const poll = async () => {
      attemptRef.current++;

      if (attemptRef.current > POLLING_CONFIG.maxAttempts) {
        stopPolling();
        const errorResult = {
          state: WorkflowExecutionState.COMPLETED_ERROR,
          progress: result.progress,
          error: `Se excedió el máximo de intentos (${POLLING_CONFIG.maxAttempts})`,
          isPolling: false,
          attempt: attemptRef.current,
        };
        setResult(errorResult);
        onError?.(errorResult.error!);
        onComplete?.(errorResult);
        return;
      }

      const newResult = await fetchWorkflowStatus();
      setResult(newResult);

      // Notificar cambio de estado
      if (newResult.state !== result.state) {
        onStateChange?.(newResult.state);
      }

      // Manejar errores
      if (newResult.error) {
        onError?.(newResult.error);
      }

      // Detener polling si el workflow se completó
      if (
        newResult.state === WorkflowExecutionState.COMPLETED_SUCCESS ||
        newResult.state === WorkflowExecutionState.COMPLETED_ERROR
      ) {
        stopPolling();
        onComplete?.(newResult);
      }
    };

    // Primera verificación inmediata
    poll();

    // Configurar intervalo de polling
    intervalRef.current = setInterval(poll, POLLING_CONFIG.interval);
  }, [fetchWorkflowStatus, result.state, result.progress, onStateChange, onError, onComplete]);

  /**
   * Detiene el polling
   */
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setResult((prev) => ({
      ...prev,
      isPolling: false,
    }));
  }, []);

  /**
   * Reinicia el polling
   */
  const resetPolling = useCallback(() => {
    stopPolling();
    setCurrentExecutionId(undefined);
    attemptRef.current = 0;
    setResult({
      state: WorkflowExecutionState.NOT_STARTED,
      progress: 0,
      isPolling: false,
      attempt: 0,
    });
  }, [stopPolling]);

  /**
   * Efecto para iniciar polling cuando cambia el executionId
   */
  useEffect(() => {
    if (enabled && executionId && executionId !== currentExecutionId) {
      startPolling(executionId);
    }

    return () => {
      stopPolling();
    };
  }, [enabled, executionId, currentExecutionId, startPolling, stopPolling]);

  return {
    ...result,
    startPolling,
    stopPolling,
    resetPolling,
  };
}
