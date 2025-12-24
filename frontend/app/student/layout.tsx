import { SidebarInset, SidebarProvider } from "@/src/ui/sidebar";
import StudentHeader from "@/src/components/pages/Student/header";
import StudentSidebar from "@/src/components/pages/Student/sidebar";
import { StudentProvider } from "@/src/context/material.provider";
import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Student",
  description: "Students Website",
};

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <StudentProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <StudentSidebar />
        <SidebarInset className="flex flex-col h-screen overflow-hidden">
          <StudentHeader />
          <div className="flex-1 w-full min-h-0">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </StudentProvider>
  );
}
