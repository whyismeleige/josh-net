"use client";

import { useState, useEffect } from "react";
import { BACKEND_URL } from "../utils/config";

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

interface TokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}


const useGoogleAuth = () => {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [loading, toggleLoading] = useState(false);

  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google) {
        setIsGoogleLoaded(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.onload = () => setIsGoogleLoaded(true);
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  const signInWithGoogle = () => {
    window.location.href = `${BACKEND_URL}/api/v1/auth/google`;
  };

  const getGoogleAccessToken = () => {
    return new Promise((resolve, reject) => {
      if (!isGoogleLoaded) {
        reject(new Error("Google SDK not loaded"));
        return;
      }

      const client_id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      if (!client_id) {
        reject(new Error("Google Client ID not configured"));
        return;
      }

      if (window.google) {
        window.google.accounts.oauth2
          .initTokenClient({
            client_id,
            scope: "profile email",
            callback: (response: TokenResponse) => {
              if (response.access_token) resolve(response.access_token);
              else
                reject(
                  new Error(
                    response.error_description || "Failed to get access token"
                  )
                );
            },
          })
          .requestAccessToken();
      }
    });
  };
  return {
    isGoogleLoaded,
    loading,
    signInWithGoogle,
    getGoogleAccessToken,
  }
};

export default useGoogleAuth;