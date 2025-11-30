import AuthError from "@/src/components/pages/Auth/error";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <AuthError />
    </Suspense>
  );
}
