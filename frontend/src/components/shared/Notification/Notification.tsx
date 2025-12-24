import {
  Alert,
  AlertDescription,
  AlertTimer,
  AlertTitle,
} from "@/src/ui/alert";
import {
  Notification as NotificationType,
} from "@/src/types/notification.types";
import { FC, useEffect, useState } from "react";
import {
  BellRing,
  CircleCheckBig,
  CircleX,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import { useAppDispatch } from "@/src/hooks/redux";
import { removeNotification } from "@/src/store/slices/notification.slice";

interface NotificationProps {
  notification: NotificationType;
}

const Notification: FC<NotificationProps> = ({ notification }) => {
  const [timeLeft, setTimeLeft] = useState(100);

  const dispatch = useAppDispatch();

  useEffect(() => {
    const startTime = notification.startTime ?? Date.now();
    const duration = notification.duration ?? 5000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        dispatch(removeNotification(notification.id));
      }
    }, 50);

    return () => clearInterval(interval);
  }, [notification, dispatch]);

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CircleCheckBig />;
      case "error":
        return <CircleX />;
      case "warning":
        return <TriangleAlert />;
      case "info":
        return <Info />;
      default:
        return <BellRing />;
    }
  };
  return (
    <Alert variant={notification.type}>
      {getIcon()}
      <AlertTitle>{notification.title}</AlertTitle>
      <AlertDescription>{notification.description}</AlertDescription>
      <button
        onClick={() => dispatch(removeNotification(notification.id))}
        className="absolute top-3 right-3 p-1 cursor-pointer rounded-sm opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
      <AlertTimer variant={notification.type} timeLeft={timeLeft}></AlertTimer>
    </Alert>
  );
};

export default Notification;
