import PublicRoute from "@/src/store/providers/PublicRoute";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <PublicRoute>{children}</PublicRoute>;
}
