import AuthPage from "@/src/components/pages/Auth";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <AuthPage />
    </Suspense>
  );
}
