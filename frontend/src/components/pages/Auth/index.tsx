"use client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Spinner } from "@/components/ui/spinner";
import { useAppDispatch } from "@/src/hooks/redux";
import { setUser } from "@/src/store/slices/auth.slice";
import { addNotification } from "@/src/store/slices/notification.slice";
import { BACKEND_URL } from "@/src/utils/config";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { Eye, EyeOff, GalleryVerticalEnd } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { OTPDialog } from "../../shared/OTP-Dialog/OTPDialog";
import useGoogleAuth from "@/src/hooks/useGoogleAuth";
import { ForgetPasswordDialog } from "../../shared/Forget-Password/ForgetPassword";

type Mode = "Login" | "Sign Up";

async function RegisterUserLocal(credentials: {
  email: string;
  password: string;
  name: string;
}) {
  return fetch(`${BACKEND_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  }).then((response) => response.json());
}

async function LoginUserLocal(credentials: {
  email: string;
  password: string;
}) {
  return fetch(`${BACKEND_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  }).then((response) => response.json());
}

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { signInWithGoogle } = useGoogleAuth();

  let query = searchParams.get("mode");

  const [mode, toggleMode] = useState<Mode>((query as Mode) || "Login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, toggleShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [openDialog, toggleOpenDialog] = useState(false);
  const [openPasswordDialog, togglePasswordDialog] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response =
        mode === "Login"
          ? await LoginUserLocal({ email, password })
          : await RegisterUserLocal({ email, password, name });
      if (response.type === "error") {
        dispatch(
          addNotification({
            title: `Error in ${mode}`,
            description: response.message,
            type: response.type,
          })
        );
        return;
      }
      if (response.type === "success" && response.user) {
        dispatch(
          addNotification({
            title: `Success in ${mode}`,
            description: response.message,
            type: response.type,
          })
        );
        dispatch(setUser(response.user));
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
        router.replace(`/${response.user.role}/dashboard`);
        return;
      }
      if (response.type === "success") {
        dispatch(
          addNotification({
            title: `OTP Sent to Email`,
            description: response.message,
            type: response.type,
          })
        );
        localStorage.setItem("verificationId", response.verificationId);
        toggleOpenDialog(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-between gap-2">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Josh Net
          </a>
          <ModeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                  <h1 className="text-2xl font-bold">
                    {mode === "Login"
                      ? "Login to your account"
                      : "Create an Account"}
                  </h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    {mode === "Login"
                      ? "Enter your email below to login to your account"
                      : "Enter your details to create new account"}
                  </p>
                </div>
                {mode === "Sign Up" && (
                  <Field>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                      id="name"
                      placeholder="Enter your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Field>
                )}
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="id@josephscollege.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    {mode === "Login" && (
                      <span
                        className="ml-auto cursor-pointer text-sm underline-offset-4 hover:underline"
                        onClick={() => togglePasswordDialog(true)}
                      >
                        Forgot your password?
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      placeholder="Enter Your Password"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    {showPassword ? (
                      <Eye
                        size={20}
                        onClick={() => toggleShowPassword(false)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                      />
                    ) : (
                      <EyeOff
                        size={20}
                        onClick={() => toggleShowPassword(true)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                      />
                    )}
                  </div>
                </Field>
                <Field>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner />
                        Processing
                      </>
                    ) : (
                      mode
                    )}
                  </Button>
                </Field>
                <FieldSeparator>Or continue with</FieldSeparator>
                <Field>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={signInWithGoogle}
                  >
                    <SiGoogle />
                    Continue with Gmail
                  </Button>
                  <FieldDescription className="text-center">
                    {mode === "Login" ? `Don't` : "Already"} have an account?{" "}
                    <span
                      className="underline underline-offset-4 cursor-pointer"
                      onClick={() =>
                        toggleMode(mode === "Login" ? "Sign Up" : "Login")
                      }
                    >
                      {mode === "Login" ? "Sign Up" : "Login"}
                    </span>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>
      <OTPDialog
        purpose="two_factor_auth"
        email={email}
        open={openDialog}
        onOpenChange={toggleOpenDialog}
      />
      <ForgetPasswordDialog
        open={openPasswordDialog}
        onOpenChange={togglePasswordDialog}
      />
    </div>
  );
}
