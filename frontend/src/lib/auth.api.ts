import { BACKEND_URL } from "../utils/config";

export async function SendOTP(credentials: { purpose: string; email: string }) {
  return fetch(`${BACKEND_URL}/api/v1/auth/send-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  }).then((response) => response.json());
}