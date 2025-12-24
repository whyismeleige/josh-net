"use client";
import JosephineHeader from "@/src/components/pages/Student/Josephine/header";
import JosephineSidebar from "@/src/components/pages/Student/Josephine/sidebar";
import { JosephineProvider } from "@/src/context/josephine.provider";
import { usePageTitle } from "@/src/hooks/usePageTitle";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  usePageTitle("Josephine");
  
  return (
    <JosephineProvider>
      <section className="flex h-full w-full overflow-hidden">
        <JosephineSidebar />
        <div className="flex flex-col w-full h-full min-w-0">
          <JosephineHeader />
          {children}
        </div>
      </section>
    </JosephineProvider>
  );
}
