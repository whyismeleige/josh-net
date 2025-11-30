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
import { useAppDispatch } from "@/src/hooks/redux";
import { SendOTP } from "@/src/lib/auth.api";
import { setUser } from "@/src/store/slices/auth.slice";
import { addNotification } from "@/src/store/slices/notification.slice";
import { BACKEND_URL } from "@/src/utils/config";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";

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

async function VerifyOTP(credentials: { verificationId: string; otp: string }) {
  return fetch(`${BACKEND_URL}/api/v1/auth/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  }).then((response) => response.json());
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

  const [value, setValue] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const id = localStorage.getItem("verificationId");
      setVerificationId(id);
      if (!id) {
        dispatch(
          addNotification({
            title: "Error in OTP Verification",
            description: "Try again later",
            type: "error",
          })
        );
        onOpenChange(false);
      }
    }
  }, [open, dispatch, onOpenChange]);

  // Closing Dialog Box
  const handleClose = () => {
    localStorage.removeItem("verificationId");
    onOpenChange(false);
  };

  // Send OTP to Email Logic
  const sendOTPtoEmail = async () => {
    if (!email) {
      dispatch(
        addNotification({
          title: "Error in Sending OTP",
          description: "Email ID required for Verification",
          type: "error",
        })
      );
      return;
    }
    try {
      setLoading(true);
      const response = await SendOTP({ email, purpose });

      if (response.type === "success") {
        dispatch(
          addNotification({
            title: `OTP Sent to Email`,
            description: response.message,
            type: response.type,
          })
        );
        localStorage.setItem("verificationId", response.verificationId);
      } else {
        dispatch(
          addNotification({
            title: "Error in Sending OTP",
            description: response.message,
            type: response.type,
          })
        );
      }
    } catch (error) {
      dispatch(
        addNotification({
          title: "Error",
          description: "Unable to Send OTP, Try again later",
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  // Submitting OTP Logic
  const handleSubmit = async () => {
    if (!verificationId) {
      dispatch(
        addNotification({
          title: "Error",
          description: "Verification ID missing",
          type: "error",
        })
      );
      return;
    }

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
      setLoading(true);
      const response = await VerifyOTP({ verificationId, otp: value });

      if (response.type === "success") {
        dispatch(
          addNotification({
            title: "Success",
            description: "Verification was Successful",
            type: "success",
          })
        );
        localStorage.removeItem("verificationId");
        onOpenChange(false);
        
        switch (purpose) {
          case "password_reset":
            localStorage.setItem("userId", response.userId);
            if (changeSteps) changeSteps();
            break;
          case "email_verification":
            router.back();
            break;
          case "sms_verification":
            router.back();
            break;
          case "two_factor_auth":
            dispatch(
              addNotification({
                title: `Success in Log In`,
                description: response.message,
                type: response.type,
              })
            );
            dispatch(setUser(response.user));
            localStorage.setItem("accessToken", response.accessToken);
            localStorage.setItem("refreshToken", response.refreshToken);
            router.replace(`${response.user.role}/dashboard`);
            break;
        }
      } else {
        dispatch(
          addNotification({
            title: "Error",
            description: response.message,
            type: response.type,
          })
        );
      }
    } catch (error) {
      dispatch(
        addNotification({
          title: "Error",
          description: "Something went wrong, Try Again",
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const clearStates = () => {
    setValue("");
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
          onClick={sendOTPtoEmail}
          className="text-center text-sm cursor-pointer hover:underline"
        >
          Resend OTP
        </span>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={loading}>
            Cancel
          </AlertDialogCancel>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
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
