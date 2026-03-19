import { useState, useMemo, useCallback, memo } from 'react';
import { ReportTab } from './ReportTab';
import { ReportLoading } from './ReportLoading';
import { ReportError } from './ReportError';
import { reportConfigs } from '../../config/reports';
import { uiTexts } from '../../config/texts';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export interface Report {
  id: string;
  title: string;
  content: string;
  status: 'loading' | 'error' | 'success';
  error?: string;
}

interface ResultsViewerProps {
  reports: Report[];
  onRetry?: (reportId: string) => void;
  isRetrying?: boolean;
  onDownload?: (reportId: string) => void;
}

const TABS = reportConfigs;

// Memoizar ResultsViewer para evitar re-renderizaciones innecesarias
export const ResultsViewer = memo(function ResultsViewer({ reports, onRetry, isRetrying, onDownload }: ResultsViewerProps) {
  const [activeTab, setActiveTab] = useState('resumen');

  // Memoizar reporte activo y configuración de tab
  const activeReport = useMemo(() => reports.find(r => r.id === activeTab), [reports, activeTab]);
  const activeTabConfig = useMemo(() => TABS.find(t => t.id === activeTab), [activeTab]);

  // Memoizar estadísticas de informes
  const stats = useMemo(() => ({
    total: reports.length,
    completed: reports.filter(r => r.status === 'success').length,
    loading: reports.filter(r => r.status === 'loading').length,
    error: reports.filter(r => r.status === 'error').length,
  }), [reports]);

  // Memoizar manejador de cambio de tab
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  // Memoizar manejador de descarga
  const handleDownload = useCallback(() => {
    if (activeReport?.status === 'success' && onDownload) {
      onDownload(activeReport.id);
    }
  }, [activeReport, onDownload]);

  // Memoizar manejador de reintento
  const handleRetry = useCallback(() => {
    if (activeReport && onRetry) {
      onRetry(activeReport.id);
    }
  }, [activeReport, onRetry]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Stats Bar */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              <span className="font-semibold text-gray-900">{stats.completed}</span> de {stats.total} informes completados
            </span>
            {stats.loading > 0 && (
              <span className="flex items-center gap-1 text-yellow-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                {stats.loading} cargando
              </span>
            )}
            {stats.error > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                <AlertCircle className="w-4 h-4" />
                {stats.error} con errores
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeReport?.status === 'success' && onDownload && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                {uiTexts.results.downloadReport}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto" role="tablist">
          {TABS.map((tab) => {
            const report = reports.find(r => r.id === tab.id);
            const isLoading = report?.status === 'loading';
            const isError = report?.status === 'error';
            const isSuccess = report?.status === 'success';

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 bg-primary-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
                role="tab"
                aria-selected={activeTab === tab.id}
                title={tab.description}
              >
                <span>{tab.label}</span>
                {isLoading && (
                  <Loader2 className="w-3 h-3 text-yellow-500 animate-spin" />
                )}
                {isSuccess && (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                )}
                {isError && (
                  <AlertCircle className="w-3 h-3 text-red-500" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6 min-h-[400px]">
        {!activeReport || activeReport.status === 'loading' ? (
          <ReportLoading message={uiTexts.loading.report} />
        ) : activeReport.status === 'error' ? (
          <ReportError
            message={activeReport.error || uiTexts.results.loadError}
            onRetry={handleRetry}
            isRetrying={isRetrying}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{activeTabConfig?.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{activeTabConfig?.description}</p>
              </div>
            </div>
            <ReportTab content={activeReport.content} title={activeReport.title} />
          </div>
        )}
      </div>
    </div>
  );
});
