import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useServerContext } from "@/src/context/server.provider";
import { Bell, Bookmark, PanelLeft, Pin, Search, Users } from "lucide-react";
import { getChannelIcon } from "./sidebar";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const buttonsData = [
  {
    icon: Bell,
    content: "Open Notifications"
  },
  {
    icon: Pin,
    content: "Pin"
  },
  {
    icon: Users,
    content: "Server Member"
  },
];

export default function ServerHeader() {
  const { currentChannel, setLeftSidebar, leftSidebar } = useServerContext();
  return (
    <header className="flex shrink-0 items-center justify-between border-b gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex items-center justify-between m-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => setLeftSidebar(!leftSidebar)}
        >
          <PanelLeft />
        </Button>
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="flex font-medium gap-2">
          {getChannelIcon(currentChannel?.type || "guild_text")}
          {currentChannel?.name}
        </h1>
      </div>
      <div className="flex items-center">
        {buttonsData.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-lg">
                <item.icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{item.content}</TooltipContent>
          </Tooltip>
        ))}
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
          />
          <Input id="text" className="pl-10 h-1.5/2" placeholder="Search" />
        </div>
        <Tooltip >
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-lg">
                <Bookmark/>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bookmark</TooltipContent>
          </Tooltip>
      </div>
    </header>
  );
}
