"use client";
import ServerHeader from "@/src/components/pages/Student/Server/header";
import ServerSidebar from "@/src/components/pages/Student/Server/left-sidebar";
import { ServerProvider } from "@/src/context/server.provider";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ServerProvider>
      <section className="flex h-full w-full overflow-hidden">
        <ServerSidebar />
        <div className="flex flex-col w-full h-full min-w-0">
          <ServerHeader />
          {children}
        </div>
      </section>
    </ServerProvider>
  );
}
