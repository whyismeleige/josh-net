import { SidebarProvider } from "@/components/ui/sidebar";
import AuthProvider from "@/src/store/providers/AuthProvider";
import { ReactNode } from "react";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
