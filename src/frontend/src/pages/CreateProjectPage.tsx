import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectForm } from '../components/projects/ProjectForm';
import { ProjectInput, ProjectUpdateInput } from '../types/project';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { uiTexts } from '../config/texts';
import { useCreateProjectWithUI } from '../hooks/useCreateProjectWithUI';
import { CreateProjectStatus } from '../lib/schemas/projectSchema';
import Alert from '../components/ui/Alert';

export function CreateProjectPage() {
  const navigate = useNavigate();
  const [iJsonValue, setIJsonValue] = useState('');
  
  const {
    status,
    error,
    validationErrors,
    iJsonValidationResult,
    isSubmitting,
    isSuccess,
    isError,
    validateForm,
    validateIJson,
    createProject,
    reset
  } = useCreateProjectWithUI();

  const handleSubmit = async (data: ProjectInput | ProjectUpdateInput) => {
    // Validar formulario
    if (!data.name || !data.description || !validateForm(data.name, data.description)) {
      return;
    }

    // Validar I-JSON si está presente
    if (iJsonValue.trim()) {
      const validationResult = validateIJson(iJsonValue);
      if (!validationResult.isValid) {
        return;
      }
    }

    // Crear el proyecto
    const success = await createProject(data as ProjectInput);
    
    if (success) {
      // Navegar a la página de proyectos después de un breve retraso
      setTimeout(() => {
        navigate('/projects');
      }, 1500);
    }
  };

  const handleCancel = () => {
    reset();
    navigate('/projects');
  };

  const handleIJsonChange = (value: string) => {
    setIJsonValue(value);
  };

  const getStatusMessage = () => {
    switch (status) {
      case CreateProjectStatus.VALIDATING:
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          message: uiTexts.createProject.validating,
          variant: 'info' as const
        };
      case CreateProjectStatus.SUBMITTING:
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          message: uiTexts.createProject.submitting,
          variant: 'info' as const
        };
      case CreateProjectStatus.SUCCESS:
        return {
          icon: <CheckCircle2 className="w-5 h-5" />,
          message: uiTexts.createProject.success,
          variant: 'success' as const
        };
      case CreateProjectStatus.ERROR:
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          message: error || uiTexts.createProject.error,
          variant: 'danger' as const
        };
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleCancel}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={uiTexts.buttons.back}
          disabled={isSubmitting}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{uiTexts.createProject.title}</h1>
          <p className="text-gray-500 mt-1">{uiTexts.createProject.subtitle}</p>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <Alert
          variant={statusMessage.variant}
          icon={statusMessage.icon}
        >
          {statusMessage.message}
        </Alert>
      )}

      {/* Error Message */}
      {isError && error && !statusMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800 font-medium">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">Errores de validación</p>
              <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                {Object.entries(validationErrors).map(([key, message]) => (
                  <li key={key}>• {message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ProjectForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          showIJsonField={true}
          iJsonValue={iJsonValue}
          onIJsonChange={handleIJsonChange}
        />
      </div>

      {/* I-JSON Validation Result */}
      {iJsonValidationResult && !iJsonValidationResult.isValid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800 font-medium">
                {uiTexts.createProject.validationError}
              </p>
              <ul className="text-sm text-red-700 mt-1 space-y-1">
                {Object.entries(iJsonValidationResult.errors).slice(0, 5).map(([key, message]) => (
                  <li key={key}>• <span className="font-medium">{key}:</span> {message}</li>
                ))}
                {Object.keys(iJsonValidationResult.errors).length > 5 && (
                  <li className="italic">
                    ... y {Object.keys(iJsonValidationResult.errors).length - 5} errores más
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-green-800 font-medium">
                {uiTexts.createProject.success}
              </p>
              <p className="text-sm text-green-700 mt-1">
                Redirigiendo a la lista de proyectos...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateProjectPage;
