import AuthCallback from "@/src/components/pages/Auth/callback";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <AuthCallback />
    </Suspense>
  )
}