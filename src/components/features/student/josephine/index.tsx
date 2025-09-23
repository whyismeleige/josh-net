"use client"
import AppSidebar from "@/components/blocks/Sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { sidebarData } from "./sidebarData"
import SiteMain from "./Main"

export default function Josephine() {
    return (
        <SidebarProvider style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }>
            <AppSidebar {...sidebarData}/>
            <SiteMain/>
        </SidebarProvider>
    )
}