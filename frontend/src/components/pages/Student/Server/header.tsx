import { Button } from "@/src/ui/button";
import { useServerContext } from "@/src/context/server.provider";
import {
  Bell,
  PanelLeft,
  PhoneCall,
  Pin,
  Search,
  ShieldUser,
  Users,
  Video,
} from "lucide-react";
import { getChannelIcon } from "./left-sidebar";
import { Separator } from "@/src/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/ui/tooltip";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/ui/input-group";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/src/ui/tabs";
import AddFriendDialog from "./dialogs";
import { FriendsState } from "@/src/types/server.types";

export default function ServerHeader() {
  const {
    view,
    currentChannel,
    setLeftSidebar,
    leftSidebar,
    rightSidebar,
    setRightSidebar,
    setFriendsView,
  } = useServerContext();

  const [isSearch, setIsSearch] = useState(false);

  const serverButtonsData = [
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

  const viewButtonsData = [
    {
      icon: PhoneCall,
      content: "Open Notifications",
      handleClick: () => setRightSidebar(!rightSidebar),
    },
    {
      icon: Video,
      content: "Server Members",
      handleClick: () => setRightSidebar(!rightSidebar),
    },
    {
      icon: ShieldUser,
      content: "Show User Profile",
      handleClick: () => setRightSidebar(!rightSidebar),
    },
    {
      icon: Search,
      content: "Search in Chat",
      handleClick: () => setRightSidebar(!rightSidebar),
    },
  ];

  const buttonsData =
    view === "inbox"
      ? viewButtonsData
      : view === "friends"
      ? []
      : serverButtonsData;
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
            {view === "friends" && (
              <div className="flex gap-2">
                <Tabs
                  defaultValue="all"
                  onValueChange={(value) =>
                    setFriendsView(value as FriendsState)
                  }
                >
                  <TabsList className="bg-transparent">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="requests">Requests</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                  </TabsList>
                </Tabs>
                <AddFriendDialog/>
              </div>
            )}
            {view === "inbox" && (
              <div className="flex items-center gap-2 mx-2 rounded text-sm cursor-pointer transition-colors text-muted-foreground hover:text-foreground group">
                <Avatar className="rounded-lg">
                  <AvatarImage
                    src={
                      "https://img.icons8.com/?size=48&id=kDoeg22e5jUY&format=png"
                    }
                    alt="Rajesh Kumar"
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Rajesh Kumar</span>
                </div>
              </div>
            )}
            {view === "servers" && (
              <h1 className="flex font-medium gap-2">
                {getChannelIcon(currentChannel?.type || "guild_text")}
                {currentChannel?.name}
              </h1>
            )}
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
