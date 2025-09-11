import { ReactNode, ComponentType } from 'react';
import { BaseComponentProps, ButtonProps, InputProps, A11yProps } from './common';

// Layout component types
export interface LayoutProps extends BaseComponentProps {
  children: ReactNode;
  title?: string;
  description?: string;
  withNavBar?: boolean;
  withFooter?: boolean;
  withSidebar?: boolean;
  withLinkBar?: boolean;
}

export interface HeaderProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

export interface SidebarProps extends BaseComponentProps {
  items: SidebarItem[];
  activeItem?: string;
  onItemClick?: (item: SidebarItem) => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  badge?: string | number;
  children?: SidebarItem[];
  isActive?: boolean;
  isDisabled?: boolean;
}

// Navigation component types
export interface NavBarProps extends BaseComponentProps {
  brand?: ReactNode;
  items: NavItem[];
  user?: UserMenuProps;
  isAuthenticated?: boolean;
}

export interface NavItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  children?: NavItem[];
  isActive?: boolean;
  isDisabled?: boolean;
  badge?: string | number;
}

export interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  menuItems: UserMenuItem[];
  onLogout?: () => void;
}

export interface UserMenuItem {
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  isDanger?: boolean;
}

// Modal component types
export interface ModalProps extends BaseComponentProps, A11yProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  footer?: ReactNode;
}

export interface ConfirmModalProps extends Omit<ModalProps, 'children'> {
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

// Form component types
export interface FormProps extends BaseComponentProps {
  onSubmit: (data: any) => void | Promise<void>;
  initialValues?: Record<string, any>;
  validationSchema?: any;
  children: ReactNode;
  submitText?: string;
  loadingText?: string;
  showSubmitButton?: boolean;
  resetOnSubmit?: boolean;
}

export interface FieldProps extends BaseComponentProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: SelectOption[];
  validation?: FieldValidation;
  helperText?: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

// Table component types
export interface TableProps<T = any> extends BaseComponentProps {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: PaginationProps;
  sorting?: SortingProps;
  selection?: SelectionProps<T>;
  actions?: TableAction<T>[];
}

export interface Column<T = any> {
  key: keyof T | string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
}

export interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  onChange?: (page: number, pageSize: number) => void;
}

export interface SortingProps {
  field?: string;
  order?: 'asc' | 'desc';
  onChange?: (field: string, order: 'asc' | 'desc') => void;
}

export interface SelectionProps<T = any> {
  selectedRowKeys: (string | number)[];
  onChange: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void;
  getCheckboxProps?: (record: T) => { disabled?: boolean; name?: string };
}

export interface TableAction<T = any> {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: (record: T) => void;
  disabled?: (record: T) => boolean;
  visible?: (record: T) => boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

// Card component types
export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  header?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface StatCardProps extends BaseComponentProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: ReactNode;
  loading?: boolean;
}

// Chart component types
export interface ChartProps extends BaseComponentProps {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
  data: any;
  options?: any;
  loading?: boolean;
  height?: number;
  responsive?: boolean;
}

// Loading component types
export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  message?: string;
  progress?: number;
  overlay?: boolean;
}

export interface SkeletonProps extends BaseComponentProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
  lines?: number;
}

// Alert component types
export interface AlertProps extends BaseComponentProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  showIcon?: boolean;
  closable?: boolean;
  onClose?: () => void;
  actions?: ReactNode;
}

// Badge component types
export interface BadgeProps extends BaseComponentProps {
  count?: number;
  max?: number;
  showZero?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

// Tooltip component types
export interface TooltipProps extends BaseComponentProps {
  content: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  disabled?: boolean;
  delay?: number;
}

// Dropdown component types
export interface DropdownProps extends BaseComponentProps {
  trigger: ReactNode;
  items: DropdownItem[];
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  disabled?: boolean;
}

export interface DropdownItem {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  divider?: boolean;
}

// Tabs component types
export interface TabsProps extends BaseComponentProps {
  items: TabItem[];
  activeKey?: string;
  onChange?: (key: string) => void;
  type?: 'line' | 'card' | 'editable-card';
  size?: 'sm' | 'md' | 'lg';
}

export interface TabItem {
  key: string;
  label: string;
  children: ReactNode;
  disabled?: boolean;
  closable?: boolean;
}

// Accordion component types
export interface AccordionProps extends BaseComponentProps {
  items: AccordionItem[];
  defaultActiveKey?: string | string[];
  activeKey?: string | string[];
  onChange?: (key: string | string[]) => void;
  multiple?: boolean;
}

export interface AccordionItem {
  key: string;
  title: string;
  children: ReactNode;
  disabled?: boolean;
}

// Stepper component types
export interface StepperProps extends BaseComponentProps {
  steps: StepItem[];
  current?: number;
  onChange?: (current: number) => void;
  direction?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

export interface StepItem {
  title: string;
  description?: string;
  icon?: ReactNode;
  status?: 'wait' | 'process' | 'finish' | 'error';
  disabled?: boolean;
}

// Progress component types
export interface ProgressProps extends BaseComponentProps {
  percent: number;
  status?: 'success' | 'exception' | 'active' | 'normal';
  strokeWidth?: number;
  showInfo?: boolean;
  format?: (percent: number) => string;
  size?: 'sm' | 'md' | 'lg';
  type?: 'line' | 'circle';
}

// Avatar component types
export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  fallback?: ReactNode;
  onClick?: () => void;
}

// Tag component types
export interface TagProps extends BaseComponentProps {
  color?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  closable?: boolean;
  onClose?: () => void;
  onClick?: () => void;
}

// Divider component types
export interface DividerProps extends BaseComponentProps {
  type?: 'horizontal' | 'vertical';
  orientation?: 'left' | 'right' | 'center';
  dashed?: boolean;
  plain?: boolean;
}

// Space component types
export interface SpaceProps extends BaseComponentProps {
  direction?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  wrap?: boolean;
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  split?: ReactNode;
}

// Grid component types
export interface GridProps extends BaseComponentProps {
  columns?: number;
  gap?: string | number;
  responsive?: boolean;
}

export interface GridItemProps extends BaseComponentProps {
  span?: number;
  offset?: number;
  order?: number;
}

// Utility component types
export interface PortalProps {
  children: ReactNode;
  container?: Element | null;
}

export interface TransitionProps {
  children: ReactNode;
  show: boolean;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
  duration?: number;
}

// Higher-order component types
export interface HOCProps {
  [key: string]: any;
}

export type HOC<T extends HOCProps = HOCProps> = <P extends T>(
  Component: ComponentType<P>
) => ComponentType<Omit<P, keyof T>>;
