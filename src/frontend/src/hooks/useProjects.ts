/**
 * Hook para gestión de proyectos con TanStack Query
 * Configuración optimizada de caché
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as projectService from '../services/projectService';
import type {
  ProjectInput,
  ProjectUpdateInput,
  ProjectFilters,
} from '../types/project';
import type { PaginationParams } from '../types/api';
import { CACHE_CONFIG } from '../lib/queryClient';

/**
 * Hook para obtener todos los proyectos
 * Optimizado con caché de 5 minutos
 */
export function useProjects(
  filters?: ProjectFilters,
  pagination?: PaginationParams,
  enabled = true
) {
  return useQuery({
    queryKey: ['projects', filters, pagination],
    queryFn: () => projectService.getAllProjects(filters, pagination),
    enabled,
    staleTime: CACHE_CONFIG.staleTime.projects,
    gcTime: CACHE_CONFIG.gcTime.projects,
  });
}

/**
 * Hook para obtener un proyecto por su ID
 * Optimizado con caché de 5 minutos
 */
export function useProject(id: string, enabled = true) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProjectById(id),
    enabled: enabled && !!id,
    staleTime: CACHE_CONFIG.staleTime.projects,
    gcTime: CACHE_CONFIG.gcTime.projects,
  });
}

/**
 * Hook para crear un nuevo proyecto
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProjectInput) => projectService.createProject(input),
    onSuccess: () => {
      // Invalidar la caché de proyectos para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projectStats'] });
    },
  });
}

/**
 * Hook para actualizar un proyecto
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProjectUpdateInput }) =>
      projectService.updateProject(id, input),
    onSuccess: (data, variables) => {
      // Actualizar el proyecto específico en la caché
      queryClient.setQueryData(['project', variables.id], data);
      // Invalidar la lista de proyectos
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

/**
 * Hook para eliminar un proyecto
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: (_, id) => {
      // Eliminar el proyecto de la caché
      queryClient.removeQueries({ queryKey: ['project', id] });
      // Invalidar la lista de proyectos
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projectStats'] });
    },
  });
}

/**
 * Hook para obtener estadísticas de proyectos
 * Optimizado con caché de 1 minuto
 */
export function useProjectStats(enabled = true) {
  return useQuery({
    queryKey: ['projectStats'],
    queryFn: () => projectService.getProjectStats(),
    enabled,
    staleTime: CACHE_CONFIG.staleTime.stats,
    gcTime: CACHE_CONFIG.gcTime.stats,
  });
}

/**
 * Hook para obtener proyectos por estado
 */
export function useProjectsByStatus(status: string, pagination?: PaginationParams) {
  return useQuery({
    queryKey: ['projects', 'status', status, pagination],
    queryFn: () => projectService.getProjectsByStatus(status, pagination),
    enabled: !!status,
  });
}

/**
 * Hook para buscar proyectos
 */
export function useSearchProjects(query: string, pagination?: PaginationParams) {
  return useQuery({
    queryKey: ['projects', 'search', query, pagination],
    queryFn: () => projectService.searchProjects(query, pagination),
    enabled: !!query,
  });
}
