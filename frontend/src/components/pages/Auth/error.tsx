"use client";
import { useAppDispatch } from "@/src/hooks/redux";
import { addNotification } from "@/src/store/slices/notification.slice";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [countdown, setCountdown] = useState(3);

  const message = searchParams.get("message");
  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    dispatch(
      addNotification({
        title: "Authentication Error",
        description: message ?? "An error occurred during authentication",
        type: "error",
      })
    );

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Redirect after 3 seconds
    const redirectTimeout = setTimeout(() => {
      router.push(redirectTo);
    }, 3000);

    // Cleanup on unmount
    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimeout);
    };
  }, [message, redirectTo, dispatch, router]);

  const handleManualRedirect = () => {
    router.push(redirectTo);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card rounded-lg shadow-xl p-8 text-center border border-border">
        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-card-foreground mb-2">
          Authentication Failed
        </h1>
        <p className="text-muted-foreground mb-6">
          {message ?? "An error occurred during authentication"}
        </p>

        {/* Countdown */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">
            Redirecting in{" "}
            <span className="font-semibold text-destructive">{countdown}</span>{" "}
            second{countdown !== 1 ? "s" : ""}...
          </p>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-destructive h-full transition-all duration-1000 ease-linear"
              style={{ width: `${((3 - countdown) / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Manual Redirect Button */}
        <button
          onClick={handleManualRedirect}
          className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
        >
          Go Back Now
        </button>

        {/* Additional Help Link */}
        <p className="mt-4 text-sm text-muted-foreground">
          Need help?{" "}
          <a
            href="/support"
            className="text-primary hover:text-primary/80 font-medium underline underline-offset-4"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}