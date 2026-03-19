import { useNavigate } from 'react-router-dom';
import { useProjectStats } from '../hooks/useProjects';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { ErrorMessage } from '../components/projects/ErrorMessage';
import { ProjectStats as ProjectStatsType, Project } from '../types/project';
import { FolderOpen, Clock, CheckCircle, AlertCircle, XCircle, PauseCircle } from 'lucide-react';
import { uiTexts } from '../config/texts';

export function Dashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading, error } = useProjectStats();

  // Estados de carga y error
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error instanceof Error ? error.message : 'Error al cargar estadísticas'} 
      />
    );
  }

  // Usar valores por defecto si stats es undefined
  const statsData: ProjectStatsType = stats || {
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    failed: 0,
    cancelled: 0
  };

  const statCards = [
    {
      title: uiTexts.dashboard.stats.totalProjects,
      value: statsData.total,
      icon: FolderOpen,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200'
    },
    {
      title: uiTexts.dashboard.stats.inProgress,
      value: statsData.inProgress,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
      bgColor: 'bg-yellow-50 border-yellow-200'
    },
    {
      title: uiTexts.dashboard.stats.completed,
      value: statsData.completed,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50 border-green-200'
    },
    {
      title: uiTexts.dashboard.stats.failed,
      value: statsData.failed,
      icon: XCircle,
      color: 'bg-red-100 text-red-600',
      bgColor: 'bg-red-50 border-red-200'
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // Función para navegar a los detalles del proyecto
  const handleProjectClick = (id: string) => {
    navigate(`/projects/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{uiTexts.dashboard.title}</h1>
        <p className="text-gray-500 mt-1">{uiTexts.dashboard.subtitle}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className={`border ${stat.bgColor}`}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <PauseCircle className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{uiTexts.dashboard.stats.pending}</p>
                  <p className="text-2xl font-bold text-gray-900">{statsData.pending}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{uiTexts.dashboard.stats.cancelled}</p>
                  <p className="text-2xl font-bold text-gray-900">{statsData.cancelled}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Projects Section */}
      <Card className="border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{uiTexts.dashboard.recentProjects}</h2>
            <button
              onClick={() => navigate('/projects')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Ver todos
            </button>
          </div>
          <div className="text-center py-8 text-gray-500">
            <FolderOpen size={48} className="mx-auto mb-3 text-gray-400" />
            <p>No hay proyectos recientes</p>
            <button
              onClick={() => navigate('/projects/create')}
              className="mt-3 text-primary-600 hover:text-primary-700 font-medium"
            >
              Crear nuevo proyecto
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Dashboard;
