"use client";
import { GalleryVerticalEnd } from "lucide-react";
import AuthForm from "@/components/features/auth/AuthForm";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

export default function LoginPage() {
  const [loginMode, toggleLoginMode] = useState(true);
  const { login, register } = useAuth();

  const handleLogin = async (data: { email: string; password: string }) => {
    const response = await login(data.email, data.password);
    console.log(response);
  };
  const handleSignup = async (data: {
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
  }) => {
    const response = await register(data.email, data.password, data.username);
    console.log(response);
    toggleLoginMode(!loginMode);
  };
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            JOSH Net
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {loginMode ? (
              <AuthForm
                mode="Login"
                onSubmit={handleLogin}
                resetForm={true}
                toggleMode={() => toggleLoginMode(!loginMode)}
              />
            ) : (
              <AuthForm
                mode="Signup"
                onSubmit={handleSignup}
                resetForm={true}
                toggleMode={() => toggleLoginMode(!loginMode)}
              />
            )}
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
