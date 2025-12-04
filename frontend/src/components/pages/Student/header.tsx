"use client"

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useStudentContext } from "@/src/context/student.provider";

export default function StudentHeader() {
  const { headerTitle } = useStudentContext();
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{headerTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle/>
          <Button size="sm" className="hidden sm:flex">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
