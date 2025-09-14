"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, FormEvent, useEffect } from "react";

interface AuthFormProps {
  className?: "";
  mode: "Signup" | "Login";
  onSubmit: (data: {
    email: string;
    password: string;
    confirmPassword: String;
  }) => void;
  resetForm?: boolean;
  toggleMode: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({
  className,
  mode,
  onSubmit,
  resetForm,
  toggleMode,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (resetForm) {
      setEmail("");
      setPassword("");
    }
  }, [resetForm]);

  const handleSumbit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password, confirmPassword });
  };

  return (
    <form
      onSubmit={handleSumbit}
      className={cn("flex flex-col gap-6", className)}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{mode}</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to {mode}
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="studentid@josephscollege.ac.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            {mode === "Login" && (
              <a
                href="/profile"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </a>
            )}
          </div>
          <Input
            id="password"
            type="password"
            showPasswordToggle={true}
            placeholder={"Enter Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {mode === "Signup" && (
            <>
              <Label htmlFor="confirm-password">Confirm Password</Label>{" "}
              <Input
                id="confirm-password"
                type="password"
                showPasswordToggle={true}
                placeholder={"Re-Enter Password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              ></Input>
            </>
          )}
        </div>
        <Button type="submit" className="w-full">
          {mode}
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <Button variant="outline" className="w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid"
            viewBox="0 0 256 262"
            style={{ width: 14, height: 14 }}
          >
            <path
              fill="#4285F4"
              d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
            />
            <path
              fill="#34A853"
              d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
            />
            <path
              fill="#FBBC05"
              d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
            />
            <path
              fill="#EB4335"
              d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
            />
          </svg>
          {mode} with Google
        </Button>
      </div>
      <div className="text-center text-sm">
        {mode === "Login" ? `Don't have an account? ` : `Already a User? `}
        <span
          className="cursor-pointer hover:underline underline-offset-4"
          onClick={toggleMode}
        >
          {mode === "Login" ? "Sign up" : "Login"}
        </span>
      </div>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </form>
  );
};

export default AuthForm;
