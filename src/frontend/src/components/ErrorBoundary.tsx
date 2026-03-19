/**
 * Componente ErrorBoundary para capturar errores en componentes hijos
 * Proporciona una UI de fallback amigable cuando ocurren errores
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import Alert from './ui/Alert';
import Button from './ui/Button';
import { logError, getErrorInfo } from '../config/errors';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Fallback UI personalizado */
  fallback?: ReactNode;
  /** Función llamada cuando ocurre un error */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Título personalizado para el error */
  title?: string;
  /** Mostrar detalles técnicos (solo en desarrollo) */
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary captura errores en componentes hijos
 * y muestra una UI de fallback amigable
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Guardar información del error en el estado
    this.setState({
      errorInfo
    });

    // Loggear el error
    logError(error, 'ErrorBoundary');

    // Llamar callback personalizado si existe
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Usar fallback personalizado si existe
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Obtener información del error
      const errorInfo = this.state.error ? getErrorInfo(this.state.error) : getErrorInfo(new Error('Error desconocido'));
      const title = this.props.title || errorInfo.title;

      // Mostrar detalles técnicos solo en desarrollo
      const showDetails = this.props.showDetails ?? import.meta.env.DEV;
      const technicalDetails = this.state.error?.message;

      return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
          <div className="max-w-md w-full">
            <Alert variant="danger">
              <div className="w-full">
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm mb-4">{errorInfo.message}</p>
                
                <div className="flex gap-2">
                  {errorInfo.suggestedAction !== 'none' && (
                    <Button onClick={this.handleReset}>
                      {errorInfo.actionLabel}
                    </Button>
                  )}
                  {errorInfo.suggestedAction === 'contact_support' && (
                    <Button variant="outline" onClick={() => window.location.href = 'mailto:soporte@ejemplo.com'}>
                      Contactar soporte
                    </Button>
                  )}
                  {errorInfo.suggestedAction === 'go_back' && (
                    <Button variant="outline" onClick={() => window.history.back()}>
                      Volver
                    </Button>
                  )}
                </div>

                {showDetails && technicalDetails && (
                  <details className="mt-4 text-sm text-gray-600">
                    <summary className="cursor-pointer hover:text-gray-800">
                      Detalles técnicos
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-xs">
                      {technicalDetails}
                    </pre>
                  </details>
                )}
              </div>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Componente funcional para mostrar errores de forma simple
 */
export function ErrorFallback({
  error,
  resetError
}: {
  error: Error;
  resetError: () => void;
}) {
  const errorInfo = getErrorInfo(error);

  return (
    <Alert variant="danger">
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-2">{errorInfo.title}</h3>
        <p className="text-sm mb-4">{errorInfo.message}</p>
        
        <div className="flex gap-2">
          {errorInfo.suggestedAction !== 'none' && (
            <Button onClick={resetError}>
              {errorInfo.actionLabel}
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}

export default ErrorBoundary;
