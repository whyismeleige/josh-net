"use client"
import {ReactNode} from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/blocks/Sidebar";
import { sidebarData } from "@/components/features/student/sidebarData";

export default function MaterialsLayout({children}: {children: ReactNode}) {
    return(
        <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 16)",
        } as React.CSSProperties
      }>
        <AppSidebar {...sidebarData}/>
        <SidebarInset>
            {children}
        </SidebarInset>
        </SidebarProvider>
    )
}