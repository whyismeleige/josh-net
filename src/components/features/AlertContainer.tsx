"use client"
import React from "react";
import { useAlert } from "@/contexts/AlertContext";
import Alert from "@/components/utils/alert";

const AlertContainer = () => {
  const { alerts } = useAlert();

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {alerts.map((alert) => (
        <Alert key={alert.id} alert={alert} />
      ))}
    </div>
  );
};

export default AlertContainer;