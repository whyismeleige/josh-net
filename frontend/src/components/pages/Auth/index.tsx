"use client";
import { Button } from "@/src/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/src/ui/field";
import { Input } from "@/src/ui/input";
import { ModeToggle } from "@/src/ui/mode-toggle";
import { Spinner } from "@/src/ui/spinner";
import { useAppDispatch, useAppSelector } from "@/src/hooks/redux";
import { loginUser, registerUser } from "@/src/store/slices/auth.slice";
import { addNotification } from "@/src/store/slices/notification.slice";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { Eye, EyeOff, GalleryVerticalEnd } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { OTPDialog } from "../../shared/OTP-Dialog/OTPDialog";
import useGoogleAuth from "@/src/hooks/useGoogleAuth";
import { ForgetPasswordDialog } from "../../shared/Forget-Password/ForgetPassword";
import { LocalAuthResponse, Mode } from "@/src/types/auth.types";
import Image from "next/image";
import Link from "next/link";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { signInWithGoogle } = useGoogleAuth();
  const { isLoading } = useAppSelector((state) => state.auth);

  const query = searchParams.get("view");

  const [mode, toggleMode] = useState<Mode>((query as Mode) || "Login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, toggleShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [openDialog, toggleOpenDialog] = useState(false);
  const [openPasswordDialog, togglePasswordDialog] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response: LocalAuthResponse =
        mode === "Login"
          ? await dispatch(loginUser({ email, password })).unwrap()
          : await dispatch(registerUser({ email, password, name })).unwrap();

      if (response.user) {
        dispatch(
          addNotification({
            title: `Success in ${mode}`,
            description: response.message,
            type: response.type,
          })
        );
        router.replace(`/${response.user.role}/dashboard`);
        return;
      }

      dispatch(
        addNotification({
          title: `OTP Sent to Email`,
          description: response.message,
          type: response.type,
        })
      );

      toggleOpenDialog(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error in Auth";
      dispatch(
        addNotification({
          title: "Error",
          description: message,
          type: "error",
        })
      );
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
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Josh Net
          </Link>
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
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
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
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner />
                        Processing
                      </>
                    ) : (
                      <>
                        <SiGoogle />
                        Continue with Gmail
                      </>
                    )}
                  </Button>
                  <FieldDescription className="pt-2 text-center">
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
                  <FieldDescription className="px-6 text-center">
                    By clicking continue, you agree to our{" "}
                    <a href="#">Terms of Service</a> and{" "}
                    <a href="#">Privacy Policy</a>.
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
