/**
 * Hook personalizado para la creación de proyectos con estados de UI
 * Regla P3 - Opción B: Validación completa con Zod
 * Sprint 5 - Integración Frontend-Backend
 */

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as projectService from '../services/projectService';
import { validationMessages } from '../config/validation';
import { getErrorInfo, logError } from '../config/errors';
import {
  CreateProjectStatus,
  iJsonSchema,
  IJsonData
} from '../lib/schemas/projectSchema';
import type { ProjectInput } from '../types/project';

/**
 * Resultado de la validación de I-JSON
 */
export interface IJsonValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  data?: IJsonData;
}

/**
 * Estado del hook de creación de proyecto
 */
export interface UseCreateProjectWithUIState {
  status: CreateProjectStatus;
  error: string | null;
  validationErrors: Record<string, string>;
  iJsonValidationResult: IJsonValidationResult | null;
  isIdle: boolean;
  isValidating: boolean;
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * Hook para crear un proyecto con estados de UI y validación de I-JSON
 */
export function useCreateProjectWithUI() {
  const [status, setStatus] = useState<CreateProjectStatus>(CreateProjectStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [iJsonValidationResult, setIJsonValidationResult] = useState<IJsonValidationResult | null>(null);

  // Mutación para crear el proyecto
  const mutation = useMutation({
    mutationFn: (input: ProjectInput) => projectService.createProject(input),
    onSuccess: () => {
      setStatus(CreateProjectStatus.SUCCESS);
      setError(null);
      setValidationErrors({});
    },
    onError: (err: unknown) => {
      setStatus(CreateProjectStatus.ERROR);
      // Loggear el error
      logError(err, 'useCreateProjectWithUI');
      
      // Obtener mensaje de error amigable
      const errorInfo = getErrorInfo(err instanceof Error ? err : new Error(String(err)));
      setError(errorInfo.message);
    },
    onSettled: () => {
      // Resetear el estado de envío después de un tiempo
      if (status === CreateProjectStatus.SUCCESS || status === CreateProjectStatus.ERROR) {
        setTimeout(() => {
          setStatus(CreateProjectStatus.IDLE);
        }, 3000);
      }
    }
  });

  /**
   * Validar I-JSON usando Zod
   */
  const validateIJson = useCallback((iJsonString: string): IJsonValidationResult => {
    setStatus(CreateProjectStatus.VALIDATING);
    setError(null);

    try {
      // Intentar parsear el JSON
      let parsedJson;
      try {
        parsedJson = JSON.parse(iJsonString);
      } catch (parseError) {
        setStatus(CreateProjectStatus.ERROR);
        return {
          isValid: false,
          errors: {
            json: validationMessages.iJson.jsonInvalid
          }
        };
      }

      // Validar con el esquema Zod
      const result = iJsonSchema.safeParse(parsedJson);

      if (!result.success) {
        // Convertir errores de Zod a un formato simple
        const errors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });

        setStatus(CreateProjectStatus.ERROR);
        return {
          isValid: false,
          errors
        };
      }

      setStatus(CreateProjectStatus.IDLE);
      return {
        isValid: true,
        errors: {},
        data: result.data
      };
    } catch (err) {
      setStatus(CreateProjectStatus.ERROR);
      return {
        isValid: false,
        errors: {
          general: validationMessages.iJson.jsonStructureInvalid
        }
      };
    }
  }, []);

  /**
   * Validar el formulario completo
   */
  const validateForm = useCallback((name: string, description: string): boolean => {
    const errors: Record<string, string> = {};

    // Validar nombre
    if (!name.trim()) {
      errors.name = validationMessages.projectName.required;
    } else if (name.length < 3) {
      errors.name = validationMessages.projectName.tooShort;
    } else if (name.length > 100) {
      errors.name = validationMessages.projectName.tooLong;
    }

    // Validar descripción
    if (!description.trim()) {
      errors.description = validationMessages.projectDescription.required;
    } else if (description.length < 10) {
      errors.description = validationMessages.projectDescription.tooShort;
    } else if (description.length > 1000) {
      errors.description = validationMessages.projectDescription.tooLong;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  /**
   * Crear un proyecto nuevo
   */
  const createProject = useCallback(async (input: ProjectInput) => {
    setStatus(CreateProjectStatus.SUBMITTING);
    setError(null);

    try {
      await mutation.mutateAsync(input);
      return true;
    } catch (err) {
      return false;
    }
  }, [mutation]);

  /**
   * Resetear el estado del hook
   */
  const reset = useCallback(() => {
    setStatus(CreateProjectStatus.IDLE);
    setError(null);
    setValidationErrors({});
    setIJsonValidationResult(null);
  }, []);

  return {
    // Estado
    status,
    error,
    validationErrors,
    iJsonValidationResult,
    isIdle: status === CreateProjectStatus.IDLE,
    isValidating: status === CreateProjectStatus.VALIDATING,
    isSubmitting: status === CreateProjectStatus.SUBMITTING,
    isSuccess: status === CreateProjectStatus.SUCCESS,
    isError: status === CreateProjectStatus.ERROR,

    // Métodos
    validateIJson,
    validateForm,
    createProject,
    reset,

    // Estado de la mutación
    isLoading: mutation.isPending,
    data: mutation.data
  };
}

export type UseCreateProjectWithUIReturn = ReturnType<typeof useCreateProjectWithUI>;
