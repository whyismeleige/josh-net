import AuthCallback from "@/components/features/auth/AuthCallback";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <AuthCallback />
    </Suspense>
  );
}
