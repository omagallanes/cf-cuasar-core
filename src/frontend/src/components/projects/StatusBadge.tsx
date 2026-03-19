import { memo, useMemo } from 'react';
import Badge from '../ui/Badge';
import { ProjectStatus } from '../../types/project';
import { uiTexts } from '../../config/texts';

interface StatusBadgeProps {
  status: ProjectStatus;
  size?: 'sm' | 'md' | 'lg';
}

// Memoizar StatusBadge para evitar re-renderizaciones innecesarias
export const StatusBadge = memo(function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  // Memoizar configuración de estado
  const config = useMemo(() => {
    switch (status) {
      case ProjectStatus.PENDING:
        return {
          label: uiTexts.status.pending,
          variant: 'warning' as const,
        };
      case ProjectStatus.IN_PROGRESS:
        return {
          label: uiTexts.status.inProgress,
          variant: 'info' as const,
        };
      case ProjectStatus.COMPLETED:
        return {
          label: uiTexts.status.completed,
          variant: 'success' as const,
        };
      case ProjectStatus.FAILED:
        return {
          label: uiTexts.status.failed,
          variant: 'danger' as const,
        };
      case ProjectStatus.CANCELLED:
        return {
          label: uiTexts.status.cancelled,
          variant: 'secondary' as const,
        };
      default:
        return {
          label: 'Desconocido',
          variant: 'secondary' as const,
        };
    }
  }, [status]);

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
});
