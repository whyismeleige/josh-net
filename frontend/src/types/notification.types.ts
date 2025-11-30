export type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "message"
  | "announcement"
  | "info";

export interface NotificationOptions {
  autoClose?: boolean;
  duration?: number;
  startTime?: number;
}

export interface Notification extends NotificationOptions {
  id: number;
  type: NotificationType;
  title: string;
  description: string;
}
