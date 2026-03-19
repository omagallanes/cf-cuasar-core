import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResultsViewer, Report } from '../components/results/ResultsViewer';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { uiTexts } from '../config/texts';
import { reportConfigs } from '../config/reports';
import { useProjectResults } from '../hooks/useResults';
import { useDownloadReport } from '../hooks/useResults';

export function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);

  // Usar el hook para obtener resultados del proyecto
  const { reports: apiReports, isLoading, isError, error, refetch } = useProjectResults(id || '', !!id);
  const downloadMutation = useDownloadReport();

  // Convertir informes de la API al formato del componente
  useEffect(() => {
    if (apiReports && apiReports.length > 0) {
      const convertedReports: Report[] = reportConfigs.map(config => {
        const apiReport = apiReports.find(r => r.id === config.id);
        return {
          id: config.id,
          title: config.title,
          content: apiReport?.content || '',
          status: apiReport ? 'success' : 'loading' as 'loading' | 'error' | 'success',
        };
      });
      setReports(convertedReports);
    } else if (id) {
      // Inicializar informes en estado de carga
      const initialReports: Report[] = reportConfigs.map(config => ({
        id: config.id,
        title: config.title,
        content: '',
        status: 'loading' as const,
      }));
      setReports(initialReports);
    }
  }, [apiReports, id]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Error retrying report:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDownload = async (reportId: string) => {
    try {
      const blob = await downloadMutation.mutateAsync({ reportId, format: 'markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportId}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading report:', err);
    }
  };

  const handleBack = () => {
    navigate(`/projects/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <span className="text-gray-500">{uiTexts.results.loading}</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
          {uiTexts.buttons.back}
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error instanceof Error ? error.message : String(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          {uiTexts.results.backToProject}
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{uiTexts.results.title}</h1>
        <p className="text-gray-500 mt-1">{uiTexts.results.subtitle}</p>
      </div>

      {/* Results Viewer */}
      <ResultsViewer
        reports={reports}
        onRetry={handleRetry}
        isRetrying={isRetrying}
        onDownload={handleDownload}
      />
    </div>
  );
}

export default ResultsPage;
