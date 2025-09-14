"use client"
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  Alert,
  AlertType,
  AlertOptions,
  AlertContextType,
} from "../types/alert";

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) throw new Error("Use Alert must be used withing AlertProvider");
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const addAlert = useCallback((alertData: Omit<Alert, "id">): number => {
    const id = Date.now() + Math.random();
    const newAlert: Alert = {
      type: "info",
      autoClose: true,
      duration: 5000,
      ...alertData,
      startTime: Date.now(),
      id,
    };

    setAlerts((prev) => [...prev, newAlert]);

    if (newAlert.autoClose && newAlert.duration) {
      setTimeout(() => {
        removeAlert(id);
      }, newAlert.duration);
    }
    return id;
  }, []);

  const removeAlert = useCallback((id: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);
  const showSuccess = useCallback(
    (message: string, options: AlertOptions = {}) => {
      return addAlert({ ...options, type: "success", message });
    },
    []
  );
  const showError = useCallback(
    (message: string, options: AlertOptions = {}) => {
      return addAlert({
        ...options,
        type: "error",
        message,
        duration: options.duration || 8000,
      });
    },
    []
  );
  const showWarning = useCallback(
    (message: string, options: AlertOptions = {}) => {
      return addAlert({ ...options, type: "warning", message });
    },
    [addAlert]
  );
  const showInfo = useCallback(
    (message: string, options: AlertOptions = {}) => {
      return addAlert({ ...options, type: "info", message });
    },
    []
  );

  const value: AlertContextType = {
    alerts,
    addAlert,
    removeAlert,
    clearAllAlerts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
  );
};
