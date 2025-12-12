"use client";
import { useAppSelector } from "@/src/hooks/redux";
import Notification from "./Notification";
import { useEffect, useState } from "react";

export const NotificationContainer = () => {
  const [mounted, setMounted] = useState(false);
  const notifications = useAppSelector(
    (state) => state.notification.notifications
  );

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <Notification key={notification.id} notification={notification} />
      ))}
    </div>
  );
};
