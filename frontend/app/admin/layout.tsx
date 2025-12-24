import { SidebarProvider } from "@/src/ui/sidebar";
import { ReactNode } from "react";

export default function AdminLayout({children}: {children: ReactNode}) {
    return (
        <SidebarProvider>{children}</SidebarProvider>
    )
}