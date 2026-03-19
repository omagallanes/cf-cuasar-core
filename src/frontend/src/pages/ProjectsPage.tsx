import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useDeleteProject } from '../hooks/useProjects';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { ErrorMessage } from '../components/projects/ErrorMessage';
import { ProjectList } from '../components/projects/ProjectList';
import { ProjectCard } from '../components/projects/ProjectCard';
import { Project, ProjectPagination, ProjectFilters } from '../types/project';
import { Plus, Grid, List } from 'lucide-react';
import { uiTexts } from '../config/texts';

export function ProjectsPage() {
  const navigate = useNavigate();
  
  // Estados locales
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [pagination, setPagination] = useState<ProjectPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Hooks de proyectos
  const { data: response, isLoading, error, refetch } = useProjects(filters, pagination);
  const deleteMutation = useDeleteProject();

  // Extraer proyectos y paginación de la respuesta
  const projects = response?.projects || [];
  const actualPagination = response?.pagination || pagination;

  // Manejar navegación a detalles del proyecto
  const handleViewProject = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  // Manejar edición de proyecto
  const handleEditProject = (project: Project) => {
    navigate(`/projects/${project.id}/edit`);
  };

  // Manejar eliminación de proyecto
  const handleDeleteProject = (project: Project) => {
    if (confirm('¿Eliminar este proyecto?')) {
      deleteMutation.mutate(project.id, {
        onSuccess: () => {
          // Refrescar la lista después de eliminar
          refetch();
        }
      });
    }
  };

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  // Manejar cambio de filtros
  const handleFilterChange = (newFilters: ProjectFilters) => {
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 });
  };

  // Manejar creación de nuevo proyecto
  const handleCreateProject = () => {
    navigate('/projects/create');
  };

  // Estado de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <ErrorMessage 
        message={error instanceof Error ? error.message : 'Error al cargar proyectos'} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{uiTexts.projects.title}</h1>
          <p className="text-gray-500 mt-1">{uiTexts.projects.subtitle}</p>
        </div>
        <Button onClick={handleCreateProject}>
          <Plus size={20} className="mr-2" />
          {uiTexts.projects.newProject}
        </Button>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode('list')}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === 'list'
              ? 'bg-primary-100 text-primary-600'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
          title={uiTexts.projects.listView}
        >
          <List size={20} />
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === 'grid'
              ? 'bg-primary-100 text-primary-600'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
          title={uiTexts.projects.gridView}
        >
          <Grid size={20} />
        </button>
      </div>

      {/* Vista de cuadrícula o lista */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onClick={() => handleViewProject(project)} 
            />
          ))}
        </div>
      ) : (
        <ProjectList
          projects={projects}
          pagination={actualPagination}
          loading={isLoading}
          onView={handleViewProject}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onPageChange={handlePageChange}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Estado vacío */}
      {projects.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay proyectos
          </h3>
          <p className="text-gray-500 mb-4">
            Crea tu primer proyecto para comenzar
          </p>
          <Button onClick={handleCreateProject}>
            <Plus size={20} className="mr-2" />
            {uiTexts.projects.newProject}
          </Button>
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;
