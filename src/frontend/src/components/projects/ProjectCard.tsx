import { memo, useCallback } from 'react';
import Card from '../ui/Card';
import { StatusBadge } from './StatusBadge';
import { Project } from '../../types/project';
import { Calendar, FileText, ArrowRight } from 'lucide-react';
import { uiTexts } from '../../config/texts';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

// Memoizar ProjectCard para evitar re-renderizaciones innecesarias
export const ProjectCard = memo(function ProjectCard({ project, onClick }: ProjectCardProps) {
  // Memoizar función de formato de fecha
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }, []);

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {project.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {project.description}
            </p>
          </div>
          <StatusBadge status={project.status} size="sm" />
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>Creación: {formatDate(project.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText size={16} />
            <span>{uiTexts.dashboard.updated} {formatDate(project.updatedAt)}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">ID: {project.id}</span>
            <ArrowRight size={16} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
          </div>
        </div>
      </div>
    </Card>
  );
});
