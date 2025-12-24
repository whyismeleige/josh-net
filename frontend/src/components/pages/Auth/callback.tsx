"use client";
import { Spinner } from "@/src/ui/spinner";
import { setCredentials } from "@/src/store/slices/auth.slice";
import { addNotification } from "@/src/store/slices/notification.slice";
import { BACKEND_URL } from "@/src/utils/config";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function AuthCallback() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const router = useRouter();

  const code = searchParams.get("code");

  useEffect(() => {
    if (code) {
      fetch(`${BACKEND_URL}/api/v1/auth/exchange-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.type === "error") {
            dispatch(
              addNotification({
                title: "Error",
                description: data.message,
                type: data.type,
              })
            );
          }
          dispatch(
            addNotification({
              title: "Success",
              description: data.message,
              type: data.type,
            })
          );
          dispatch(setCredentials(data));
          router.replace(`/${data.user.role}/dashboard`);
        })
        .catch(() => {
          dispatch(
            addNotification({
              title: "Error",
              description: "Error in Authentication, Try Again",
              type: "error",
            })
          );
          router.replace("/");
        });
    }

    router.replace("/auth");
  }, [code, dispatch, router]);
  return (
    <div className="flex justify-center gap-2 pt-20 h-screen w-screen text-4xl font-extrabold tracking-tight text-balance">
      <Spinner className="size-9" />
      Authenticating...
    </div>
  );
}
