import { useState, useCallback, useMemo } from 'react';
import Table from '../ui/Table';
import { StatusBadge } from './StatusBadge';
import { Project, ProjectStatus, ProjectPagination } from '../../types/project';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, Edit, Trash2 } from 'lucide-react';
import { uiTexts } from '../../config/texts';
import { useDebounce } from '../../hooks/useDebounce';

interface ProjectListProps {
  projects: Project[];
  pagination: ProjectPagination;
  loading?: boolean;
  onView?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onPageChange?: (page: number) => void;
  onFilterChange?: (filters: { status?: ProjectStatus; search?: string }) => void;
}

export function ProjectList({
  projects,
  pagination,
  loading = false,
  onView,
  onEdit,
  onDelete,
  onPageChange,
  onFilterChange
}: ProjectListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  
  // Debouncing de búsqueda con 300ms de delay
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoizar función de formato de fecha
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }, []);

  // Manejar cambios en búsqueda
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Manejar cambios en filtro de estado
  const handleStatusChange = useCallback((value: string) => {
    const status = value as ProjectStatus | '';
    setStatusFilter(status);
  }, []);

  // Memoizar columnas para evitar re-renderizaciones innecesarias
  const columns = useMemo(() => [
    {
      key: 'name',
      header: uiTexts.projectForm.nameLabel,
      render: (project: Project) => (
        <div>
          <div className="font-medium text-gray-900">{project.name}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">{project.description}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      render: (project: Project) => <StatusBadge status={project.status} size="sm" />
    },
    {
      key: 'createdAt',
      header: 'Creado',
      render: (project: Project) => formatDate(project.createdAt)
    },
    {
      key: 'updatedAt',
      header: uiTexts.dashboard.updated,
      render: (project: Project) => formatDate(project.updatedAt)
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (project: Project) => (
        <div className="flex items-center gap-2">
          {onView && (
            <button
              onClick={() => onView(project)}
              className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title={uiTexts.buttons.view}
            >
              <Eye size={16} />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(project)}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title={uiTexts.buttons.edit}
            >
              <Edit size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(project)}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title={uiTexts.buttons.delete}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )
    }
  ], [formatDate, onView, onEdit, onDelete, uiTexts]);

  // Efecto para aplicar filtros cuando el término de búsqueda debouncado cambia
  useMemo(() => {
    onFilterChange?.({
      status: statusFilter || undefined,
      search: debouncedSearchTerm || undefined
    });
  }, [debouncedSearchTerm, statusFilter, onFilterChange]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={`Buscar ${uiTexts.projects.title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">Todos los estados</option>
              <option value={ProjectStatus.PENDING}>{uiTexts.status.pending}</option>
              <option value={ProjectStatus.IN_PROGRESS}>{uiTexts.status.inProgress}</option>
              <option value={ProjectStatus.COMPLETED}>{uiTexts.status.completed}</option>
              <option value={ProjectStatus.FAILED}>{uiTexts.status.failed}</option>
              <option value={ProjectStatus.CANCELLED}>{uiTexts.status.cancelled}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            {uiTexts.loading.default}
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No se encontraron proyectos
          </div>
        ) : (
          <Table
            columns={columns}
            data={projects}
            keyField="id"
          />
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} {uiTexts.projects.title.toLowerCase()}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 py-2 text-sm font-medium">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Página siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
