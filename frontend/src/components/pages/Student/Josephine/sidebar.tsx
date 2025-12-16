"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useJosephineContext } from "@/src/context/josephine.provider";
import {
  CirclePlus,
  Ellipsis,
  MessagesSquare,
  PanelLeft,
  Pen,
  StarIcon,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { Fragment } from "react/jsx-runtime";

export default function JosephineSidebar() {
  const { sidebar, chats, setSidebar } = useJosephineContext();

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {sidebar && (
        <div
          onClick={() => setSidebar(!sidebar)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          h-full bg-sidebar transition-all duration-300 ease-in-out
          fixed md:relative z-50 md:z-auto
          border-r
          ${
            sidebar
              ? "translate-x-0 opacity-100"
              : "-translate-x-full md:translate-x-0 opacity-0 md:opacity-100"
          }
          ${sidebar ? "w-64 md:w-64" : "w-0 overflow-hidden"}
        `}
      >
        <div className="w-64 h-full flex flex-col">
          {/* Header */}
          <div className="h-14 flex items-center justify-between border-b px-4">
            <h1 className="text-lg font-semibold">Josephine</h1>

            {/* Close button for mobile */}
            <Button
              className="md:hidden p-1 hover:bg-sidebar-accent rounded-md transition-colors size-7"
              variant="ghost"
              onClick={() => setSidebar(!sidebar)}
              size="icon"
            >
              <PanelLeft />
            </Button>
          </div>

          <div className="p-1 space-y-1 border-b">
            <Link
              href="/student/josephine/new"
              className="flex items-center gap-3 w-full px-3 cursor-pointer py-1.5 text-sm font-medium text-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors"
            >
              <CirclePlus size={18} className="flex-shrink-0" />
              <span>New Chat</span>
            </Link>
            <Link
              href="/student/josephine/chats"
              className="flex items-center gap-3 w-full px-3 cursor-pointer py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors"
            >
              <MessagesSquare size={18} className="flex-shrink-0" />
              <span>All Chats</span>
            </Link>
          </div>
          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-1 space-y-1 custom-scrollbar">
            <span className="px-3 py-1.5 text-xs ">Recents</span>
            {chats.map((chat, index) => (
              <div
                key={index}
                className="flex items-center w-full px-3 py-1.5 
                text-sm text-sidebar-foreground/80
                hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                rounded-md transition-colors group truncate"
              >
                <Link
                  href={`/student/josephine/chat/${chat._id}`}
                  className="flex-1 truncate"
                  title={chat.title}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="truncate">{chat.title}</span>
                  </div>
                </Link>
                <DropdownMenu >
                  <DropdownMenuTrigger asChild>
                    <Button size="icon-lg" className="size-5 hidden group-hover:block" variant="ghost">
                      <Ellipsis />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right">
                    <DropdownMenuItem>
                      <StarIcon />
                      Star
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pen /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Trash /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
