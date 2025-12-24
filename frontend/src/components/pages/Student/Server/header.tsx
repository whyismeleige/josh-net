import { Button } from "@/src/ui/button";
import { useServerContext } from "@/src/context/server.provider";
import { Bell, PanelLeft, Pin, Search, Users } from "lucide-react";
import { getChannelIcon } from "./left-sidebar";
import { Separator } from "@/src/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/ui/tooltip";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/ui/input-group";
import { useState } from "react";

export default function ServerHeader() {
  const {
    currentChannel,
    setLeftSidebar,
    leftSidebar,
    rightSidebar,
    setRightSidebar,
  } = useServerContext();

  const [isSearch, setIsSearch] = useState(false);

  const buttonsData = [
    {
      icon: Bell,
      content: "Open Notifications",
      handleClick: () => setRightSidebar(!rightSidebar),
    },
    {
      icon: Users,
      content: "Server Members",
      handleClick: () => setRightSidebar(!rightSidebar),
    },
    {
      icon: Search,
      content: "Search in Chat",
      handleClick: () => setRightSidebar(!rightSidebar),
    },
  ];
  return (
    <header className="flex shrink-0 items-center justify-between border-b gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      {!isSearch ? (
        <>
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
                  <Button
                    variant="ghost"
                    onClick={item.handleClick}
                    size="icon-lg"
                  >
                    <item.icon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{item.content}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </>
      ) : (
        <InputGroup className="m-2 transition-all">
          <InputGroupInput placeholder="Search in Channel" />
          <InputGroupAddon>
            <Search size={20} />
          </InputGroupAddon>
        </InputGroup>
      )}
    </header>
  );
}
