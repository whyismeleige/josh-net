export type AlertType =
  | "success"
  | "error"
  | "warning"
  | "message"
  | "announcement"
  | "info";

export interface AlertOptions {
  title?: string;
  autoClose?: boolean;
  duration?: number;
  startTime?: number; 
}

export interface Alert extends AlertOptions {
  id: number;
  type: AlertType;
  message: string;
}

export interface AlertContextType {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, "id">) => number;
  removeAlert: (id: number) => void;
  clearAllAlerts: () => void;
  showSuccess: (message: string, options?: AlertOptions) => number;
  showError: (message: string, options?: AlertOptions) => number;
  showWarning: (message: string, options?: AlertOptions) => number;
  showInfo: (message: string, options?: AlertOptions) => number;
}
