"use client";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { useAppDispatch, useAppSelector } from "@/src/hooks/redux";
import { verifyOTP } from "@/src/store/slices/auth.slice";
import { addNotification } from "@/src/store/slices/notification.slice";
import { SendOTPtoEmail } from "@/src/utils/auth.utils";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";

interface OTPDialogProps {
  purpose:
    | "email_verification"
    | "sms_verification"
    | "password_reset"
    | "two_factor_auth";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  changeSteps?: () => void;
  email?: string;
}

export const OTPDialog: FC<OTPDialogProps> = ({
  purpose,
  open,
  onOpenChange,
  changeSteps,
  email,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { isLoading } = useAppSelector((state) => state.auth);

  const [value, setValue] = useState("");

  // Closing Dialog Box
  const handleClose = () => {
    localStorage.removeItem("verificationId");
    onOpenChange(false);
  };

  // Submitting OTP Logic
  const handleSubmit = async () => {
    if (value.length !== 6) {
      dispatch(
        addNotification({
          title: "Invalid OTP",
          description: "Please enter a 6-digit OTP",
          type: "error",
        })
      );
      return;
    }

    try {
      const response = await dispatch(verifyOTP(value)).unwrap();

      dispatch(
        addNotification({
          title: "Success",
          description: "Verification was Successful",
          type: "success",
        })
      );
      onOpenChange(false);

      switch (purpose) {
        case "password_reset":
          if (changeSteps) changeSteps();
          break;
        case "two_factor_auth":
          dispatch(
            addNotification({
              title: `Success in Log In`,
              description: response.message,
              type: response.type,
            })
          );
          router.replace(`${response.user.role}/dashboard`);
          break;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error in Auth"
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">Verify OTP</AlertDialogTitle>
          <span className="text-center text-sm">
            Enter your One-Time Password
          </span>
        </AlertDialogHeader>
        <InputOTP
          value={value}
          onChange={(value) => setValue(value)}
          maxLength={6}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <span
          onClick={() => SendOTPtoEmail(email, purpose)}
          className="text-center text-sm cursor-pointer hover:underline"
        >
          Resend OTP
        </span>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner /> Processing
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
