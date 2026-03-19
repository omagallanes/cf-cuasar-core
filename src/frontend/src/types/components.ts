/**
 * Tipos para componentes de UI
 */
import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

// ============================================================================
// TIPOS DE LAYOUT
// ============================================================================

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number | string;
  children?: SidebarItem[];
}

export interface SidebarProps {
  items: SidebarItem[];
  collapsed?: boolean;
  onToggle?: () => void;
  activePath?: string;
}

export interface HeaderProps {
  userName?: string;
  userAvatar?: string;
  onMenuClick?: () => void;
  onLogout?: () => void;
  sidebarCollapsed?: boolean;
}

export interface MainLayoutProps {
  children?: ReactNode;
  sidebarCollapsed?: boolean;
}

// ============================================================================
// TIPOS DE COMPONENTES UI BASE
// ============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
  onClick?: () => void;
}

export type TableColumn<T = any> = {
  key: string;
  header: string;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
};

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  keyField?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps {
  children: ReactNode;
  variant?: AlertVariant;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: ReactNode;
}

// ============================================================================
// TIPOS DE COMPONENTES DE FORMULARIO
// ============================================================================

export interface FormGroupProps {
  children: ReactNode;
  className?: string;
  error?: string;
}

export interface FormLabelProps {
  children: ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
}

export interface FormErrorProps {
  children: ReactNode;
  className?: string;
}
