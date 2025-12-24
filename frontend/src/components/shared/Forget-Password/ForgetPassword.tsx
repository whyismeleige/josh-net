import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/ui/alert-dialog";
import { Button } from "@/src/ui/button";
import { Input } from "@/src/ui/input";
import { Spinner } from "@/src/ui/spinner";
import { useAppDispatch, useAppSelector } from "@/src/hooks/redux";
import { Eye, EyeOff } from "lucide-react";
import { FC, useState } from "react";
import { OTPDialog } from "../OTP-Dialog/OTPDialog";
import { addNotification } from "@/src/store/slices/notification.slice";
import { validateEmail, validatePasswords } from "@/src/utils/auth.utils";
import { changePassword, sendOTP } from "@/src/store/slices/auth.slice";

interface ForgetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ForgetPasswordDialog: FC<ForgetPasswordDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, toggleShowPassword] = useState(false);
  const [steps, setSteps] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);

  const handleSubmit = async () => {
    try {
      if (steps === 1) {
        if (!validateEmail(email)) {
          dispatch(
            addNotification({
              title: "Error",
              description: "Only Joseph's College emails are allowed",
              type: "error",
            })
          );
          clearStates();
          return;
        }

        const response = await dispatch(
          sendOTP({ purpose: "password_reset", email })
        ).unwrap();

        dispatch(
          addNotification({
            title: `OTP Sent to Email`,
            description: response.message,
            type: response.type,
          })
        );

        setOpenDialog(true);
      }
      if (steps === 2) {
        if (!validatePasswords(password, confirmPassword)) {
          dispatch(
            addNotification({
              title: "Error",
              description: "Passwords do not match",
              type: "error",
            })
          );
          return;
        }

        const response = await dispatch(changePassword(password)).unwrap();

        dispatch(
          addNotification({
            type: response.type,
            title: "Success",
            description: response.message,
          })
        );

        onOpenChange(false);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error in Auth";
      dispatch(
        addNotification({
          title: "Error",
          description: message,
          type: "error",
        })
      );
      clearStates();
    }
  };

  const handleClose = () => {
    localStorage.removeItem("verificationId");
    localStorage.removeItem("userId");
    onOpenChange(false);
  };

  const clearStates = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    toggleShowPassword(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">
            Forget Password?
          </AlertDialogTitle>
          <span className="text-center text-sm">
            {steps === 1 && "Enter Your Email"}
            {steps === 2 && "Enter your New Password"}
          </span>
        </AlertDialogHeader>
        {steps === 1 && (
          <Input
            id="email"
            type="email"
            placeholder="id@josephscollege.ac.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}
        {steps === 2 && (
          <>
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
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                placeholder="Confirm Your Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
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
          </>
        )}
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
      <OTPDialog
        purpose="password_reset"
        open={openDialog}
        onOpenChange={setOpenDialog}
        changeSteps={() => setSteps(2)}
        email={email}
      />
    </AlertDialog>
  );
};
