"use client";
import { GalleryVerticalEnd } from "lucide-react";
import AuthForm from "@/components/blocks/AuthForm";
import { useState } from "react";
import { useAlert } from "@/contexts/AlertContext";

export default function LoginPage() {
  const [loginMode, toggleLoginMode] = useState(true);
  const handleLogin = (data: { email: String; password: String }) => {
    
  };
  const handleSignup = (data: {
    email: string;
    password: string;
    confirmPassword: string;
  }) => {

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
