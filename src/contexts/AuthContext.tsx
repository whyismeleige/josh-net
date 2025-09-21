"use client";
import { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ApiResponse,
  AuthContextType,
  AuthProviderProps,
  User,
} from "@/types/auth";
import { useAlert } from "./AlertContext";
import useGoogleAuth from "@/hooks/use-google-auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<void> => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        const response = await fetch(`${API_URL}/api/v1/user/profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data: ApiResponse = await response.json();
          if (data.user) setUser(data.user);
        } else {
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            const response = await fetch(`${API_URL}/api/v1/auth`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ refreshToken }),
            });

            if (response.ok) {
              const data = await response.json();
              if (data.accessToken) {
                localStorage.setItem("accessToken", data.accessToken);
                await checkAuth();
                return;
              }
            } else {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              router.push("/login");
            }
          }
        }
      }
    } catch (error) {
      console.error("Auth Check failed:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      router.push("/login");
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data: ApiResponse = await response.json();
      if (response.ok) {
        if (data.accessToken && data.refreshToken && data.user) {
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          setUser(data.user);
          router.push(`/${data.user.role}/home`);
        } else {
          setEmail(email);
          router.push("/auth/verify-otp");
        }
      }
      return data;
    } catch (error) {
      console.error("Error in Login", error);
    } finally {
      setLoading(false);
    }
  };

  const loginViaGoogle = async (accessToken: string, refreshToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/user/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      const data: ApiResponse = await response.json();
      console.log(data);
      if (response.ok && data.user) {
        setUser(data.user);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("accessToken", accessToken);
        router.push(`/${data.user.role}/home`);
      } else {
        throw new Error("Failed to Fetch user Data");
      }
    } catch (error) {
      console.error("Error Login Via Google", error);
      router.push(
        `/auth/login?error=${encodeURIComponent("Failed to Authenticate")}`
      );
    }
  };

  const register = async (
    email: string,
    password: string,
    username: string
  ) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, username }),
      });
      return await response.json();
    } catch (error) {
      console.error("Error in Registering ", error);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (otp: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });
      const data: ApiResponse = await response.json();
      console.log(data);
      if (response.ok && data.accessToken && data.refreshToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        await checkAuth();
        if (user) router.push(`/${user.role}/home`);
      } else {
        router.push(`/auth/login`);
      }
      return data;
    } catch (error) {
      console.error("Error in Verifing OTP", error);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      return await response.json();
    } catch (error) {
      console.error("Error in Changing Password", error);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const response = await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await response.json();

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      router.push("/auth/login");
      return data;
    } catch (error) {
      console.error("Error in Loging Out", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  const logoutAll = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(`${API_URL}/api/v1/auth/logout-all`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data: ApiResponse = await response.json();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      router.push("/auth/login");
      return data;
    } catch (error) {
      console.error("Error in Logging Out of All Devices", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    loginViaGoogle,
    login,
    register,
    verifyOtp,
    changePassword,
    logout,
    logoutAll,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
