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

// This is sample data
const data = {
  navMain: [
    {
      title: "Server 1",
      isActive: false,
      avatarURL: "https://api.dicebear.com/9.x/pixel-art/svg",
    },
    {
      title: "Server 2",
      isActive: false,
      avatarURL: "https://api.dicebear.com/9.x/pixel-art/svg?seed=Jane",
    },
    {
      title: "Server 3",
      isActive: false,
      avatarURL: "https://api.dicebear.com/9.x/pixel-art/svg?seed=Jadfskdjf",
    },
    {
      title: "Server 4",
      isActive: false,
      avatarURL: "https://api.dicebear.com/9.x/pixel-art/svg?seed=Jandfs",
    },
  ],
  mails: [
    {
      icon: Speaker,
      title: "Channel 1",
    },
    {
      icon: Speaker,
      title: "Channel 1",
    },
    {
      icon: Speaker,
      title: "Channel 1",
    },
    {
      icon: Speaker,
      title: "Channel 1",
    },
  ],
};

export default function ServerSidebar() {
  const [activeItem, setActiveItem] = React.useState(data.navMain[0]);
  const [mails, setMails] = React.useState(data.mails);
  const [isPanelOpen, setIsPanelOpen] = React.useState(true);
  
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
          {data.navMain.map((item) => (
            <Avatar
              key={item.title}
              onClick={() => {
                setActiveItem(item);
                const mail = data.mails.sort(() => Math.random() - 0.5);
                setMails(
                  mail.slice(0, Math.max(5, Math.floor(Math.random() * 10) + 1))
                );
                setIsPanelOpen(true);
              }}
              className={`w-full h-10 flex items-center cursor-pointer justify-center transition-colors ${
                activeItem?.title === item.title
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
              title={item.title}
            >
              <AvatarImage src={item.avatarURL} />
              <AvatarFallback>{item.title}</AvatarFallback>
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
      {isPanelOpen && (
        <div className="w-50 flex flex-col bg-sidebar border-r">
          {/* Panel Header */}
          <div className="border-b p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-foreground">
                {activeItem?.title}
              </h2>
            </div>
          </div>

          {/* Mail List */}
          <div className="flex-1 overflow-y-auto">
            {mails.map((item, index) => (
              <a
                href="#"
                key={index}
                className="flex gap-2 border-b p-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                {item.icon && <item.icon size={20} />}
                {item.title}
              </a>
            ))}
          </div>
        </div>
      )}
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
            <Mic/>
        </Button>
        <Button variant="ghost" size="icon-sm">
            <Headphones/>
        </Button>
        <Button variant="ghost" size="icon-sm">
            <Settings/>
        </Button>
      </div>
    </div>
  );
}
