"use client";

import * as React from "react";
import {
  ArchiveX,
  Command,
  File,
  Inbox,
  Send,
  Trash2,
  Search,
  Speaker,
  PlusCircle,
  Compass,
  Mic,
  Headphones,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useServerContext } from "@/src/context/server.provider";

export default function ServerSidebar() {
  const { serverData, setCurrentServer, currentServer } = useServerContext();

  return (
    <div className="flex w-fit h-full border-r bg-sidebar">
      {/* Icon Navigation Sidebar */}
      <div className="w-16 border-r bg-sidebar flex flex-col">
        {/* Header */}
        <div className="h-14 flex items-center justify-center border-b">
          <div className="bg-sidebar-primary cursor-pointer text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Inbox className="size-4" />
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col items-center gap-2 flex-1 p-2 space-y-1 ">
          {serverData.map((server, index) => (
            <Avatar
              key={server._id}
              onClick={() => {
                setCurrentServer(server);
              }}
              className={`w-full h-10 flex items-center cursor-pointer justify-center transition-colors ${
                server._id === currentServer?._id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
              title={server.name}
            >
              <AvatarImage src={server.icon} />
              <AvatarFallback>{server.name}</AvatarFallback>
            </Avatar>
          ))}
          <Button size="icon" className="rounded-2xl">
            <PlusCircle />
          </Button>
          <Button size="icon" className="rounded-2xl">
            <Compass />
          </Button>
        </div>
      </div>

      {/* Expandable Detail Panel */}
      <div className="w-50 flex flex-col bg-sidebar border-r">
        {/* Panel Header */}
        <div className="border-b p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-foreground">
              {currentServer?.name}
            </h2>
          </div>
        </div>

        {/* Mail List */}
        <div className="flex-1 overflow-y-auto">
          {/* {mails.map((item, index) => (
            <a
              href="#"
              key={index}
              className="flex gap-2 border-b p-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              {item.icon && <item.icon size={20} />}
              {item.title}
            </a>
          ))} */}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 bg-card border-t p-2 m-1 rounded-xl flex items-center gap-2 shadow-lg ">
        <Avatar className="rounded-lg">
          <AvatarImage
            src="https://api.dicebear.com/9.x/pixel-art/svg?seed=Jandfs"
            alt="Piyush Jain"
          />
          <AvatarFallback className="rounded-lg">CN</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">Piyush Jain</span>
          <span className="truncate text-xs">Do not Disturb</span>
        </div>
        <Button variant="ghost" size="icon-sm">
          <Mic />
        </Button>
        <Button variant="ghost" size="icon-sm">
          <Headphones />
        </Button>
        <Button variant="ghost" size="icon-sm">
          <Settings />
        </Button>
      </div>
    </div>
  );
}
