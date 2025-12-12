import { useAppDispatch } from "../hooks/redux";
import { sendOTP } from "../store/slices/auth.slice";
import { addNotification } from "../store/slices/notification.slice";
import { VerificationPurpose } from "../types/auth.types";

export const validateEmail = (email: string) => {
  return email.endsWith("@josephscollege.ac.in");
};

export const validatePasswords = (
  password: string,
  confirmPassword: string
) => {
  return password === confirmPassword;
};

export const SendOTPtoEmail = async (email: string | undefined, purpose: VerificationPurpose) => {
  const dispatch = useAppDispatch();

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
      const response = await dispatch(sendOTP({ email, purpose })).unwrap();

      if (response.type === "success") {
        dispatch(
          addNotification({
            title: `OTP Sent to Email`,
            description: response.message,
            type: response.type,
          })
        );
      } 

    } catch (error) {
      dispatch(
        addNotification({
          title: "Error",
          description: "Error in Sending OTP",
          type: "error",
        })
      );
    } 
  };