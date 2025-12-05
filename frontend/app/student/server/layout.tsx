"use client";
import ServerHeader from "@/src/components/pages/Student/Server/header";
import ServerSidebar from "@/src/components/pages/Student/Server/sidebar";
import { usePageTitle } from "@/src/hooks/usePageTitle";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  usePageTitle("Server");
  return (
    <section className="flex h-full w-full">
      <ServerSidebar />
      <div className="w-full h-full">
        <ServerHeader />
        {children}
      </div>
    </section>
  );
}
