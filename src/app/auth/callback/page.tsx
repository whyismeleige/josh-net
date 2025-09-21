"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginViaGoogle } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");
      const error = searchParams.get("error");

      if (error) {
        console.error("Authentication error:", error);
        const errorMessage = "Authentication failed";

        router.push(`/auth/login?error=${encodeURIComponent(errorMessage)}`);
        return;
      }
      if (accessToken && refreshToken) {
        loginViaGoogle(accessToken, refreshToken);
      } else {
        router.push(
          "/auth/login?error=" +
            encodeURIComponent("No Authentication Required")
        );
      }
    };
    handleCallback();
  }, [searchParams, router, loginViaGoogle]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg font-medium">Processing authentication...</p>
        <p className="text-gray-600">Please wait while we log you in.</p>
      </div>
    </div>
  );
}
