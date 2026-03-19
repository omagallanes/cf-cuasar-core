import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectDetail } from '../components/projects/ProjectDetail';
import { ResultsViewer, Report } from '../components/results/ResultsViewer';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { uiTexts } from '../config/texts';
import { useProject } from '../hooks/useProjects';
import { useStartWorkflow } from '../hooks/useWorkflow';
import { useWorkflowPolling, WorkflowExecutionState } from '../hooks/useWorkflowPolling';
import { useProjectExecutions } from '../hooks/useWorkflow';
import Modal from '../components/ui/Modal';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Queries y Mutations
  const { data: project, isLoading: projectLoading, error: projectError } = useProject(id || '');
  const startWorkflow = useStartWorkflow();
  const { data: executions } = useProjectExecutions(id || '');

  // Estado local
  const [showResults, setShowResults] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Polling de workflow
  const workflowPolling = useWorkflowPolling({
    enabled: false, // Se habilita manualmente al iniciar el workflow
    onStateChange: (state) => {
      console.log('Workflow state changed:', state);
    },
    onError: (error) => {
      console.error('Workflow error:', error);
    },
    onComplete: (result) => {
      console.log('Workflow completed:', result);
      if (result.state === WorkflowExecutionState.COMPLETED_SUCCESS) {
        loadReports(id!);
        setShowResults(true);
      }
    },
  });

  /**
   * Verifica si hay análisis previos
   */
  const hasPreviousAnalysis = executions && executions.length > 0;

  /**
   * Carga los informes de resultados
   */
  const loadReports = (projectId: string) => {
    // TODO: Implementar llamada a API real
    console.log('Loading reports for project:', projectId);

    // Simulación de informes
    const mockReports: Report[] = [
      {
        id: 'resumen',
        title: 'Resumen Ejecutivo',
        content: '# Resumen Ejecutivo\n\nEste informe presenta un análisis completo del mercado inmobiliario...',
        status: 'success'
      },
      {
        id: 'analisis_mercado',
        title: 'Análisis de Mercado',
        content: '# Análisis de Mercado\n\nEl mercado actual muestra tendencias positivas...',
        status: 'success'
      }
    ];

    setReports(mockReports);
    setShowResults(true);
  };

  /**
   * Maneja el clic en el botón de ejecutar análisis
   */
  const handleRunWorkflowClick = () => {
    if (hasPreviousAnalysis) {
      // Si hay análisis previos, mostrar modal de confirmación
      setShowConfirmModal(true);
    } else {
      // Si no hay análisis previos, ejecutar directamente
      handleRunWorkflow();
    }
  };

  /**
   * Ejecuta el workflow
   */
  const handleRunWorkflow = async () => {
    if (!project) return;

    setShowConfirmModal(false);

    try {
      // Iniciar el workflow
      const result = await startWorkflow.mutateAsync({ projectId: project.id });
      
      // Iniciar polling del estado
      workflowPolling.startPolling(result.id);
    } catch (err) {
      console.error('Error starting workflow:', err);
      // El error se maneja a través del estado de la mutación
    }
  };

  /**
   * Maneja la edición del proyecto
   */
  const handleEdit = () => {
    navigate(`/projects/${id}/edit`);
  };

  /**
   * Maneja la eliminación del proyecto
   */
  const handleDelete = async () => {
    if (!confirm(uiTexts.projectDetail.deleteConfirm)) {
      return;
    }

    try {
      // TODO: Implementar llamada a API real
      console.log('Deleting project:', id);

      // Simulación de eliminación
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navegar a la página de proyectos
      navigate('/projects');
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  /**
   * Maneja la navegación de regreso
   */
  const handleBack = () => {
    navigate('/projects');
  };

  /**
   * Maneja la confirmación de re-ejecución
   */
  const handleConfirmReRun = () => {
    handleRunWorkflow();
  };

  /**
   * Maneja la cancelación del modal de confirmación
   */
  const handleCancelReRun = () => {
    setShowConfirmModal(false);
  };

  // Estado de carga
  if (projectLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <span className="text-gray-500">{uiTexts.projectDetail.loading}</span>
        </div>
      </div>
    );
  }

  // Estado de error
  if (projectError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{uiTexts.projectDetail.loadError}</p>
        <button
          onClick={handleBack}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {uiTexts.projectDetail.backToProjects}
        </button>
      </div>
    );
  }

  // Proyecto no encontrado
  if (!project) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-gray-500">{uiTexts.projectDetail.notFound}</p>
        <button
          onClick={handleBack}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
        >
          {uiTexts.projectDetail.backToProjects}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft size={20} />
        {uiTexts.projectDetail.backToProjects}
      </button>

      {/* Project Detail */}
      <ProjectDetail
        project={project}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRunWorkflow={handleRunWorkflowClick}
        isRunning={startWorkflow.isPending || workflowPolling.isPolling}
        workflowResult={workflowPolling}
        hasPreviousAnalysis={hasPreviousAnalysis}
        onConfirmReRun={handleConfirmReRun}
      />

      {/* Results Viewer */}
      {showResults && (
        <ResultsViewer
          reports={reports}
        />
      )}

      {/* Modal de Confirmación para Re-ejecutar */}
      <Modal
        isOpen={showConfirmModal}
        onClose={handleCancelReRun}
        title={uiTexts.workflow.reRunAnalysis}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            {uiTexts.workflow.confirmReRun}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancelReRun}
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {uiTexts.buttons.cancel}
            </button>
            <button
              onClick={handleConfirmReRun}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {uiTexts.workflow.runAnalysis}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ProjectDetailPage;
