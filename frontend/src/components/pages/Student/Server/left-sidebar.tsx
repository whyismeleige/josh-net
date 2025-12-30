"use client";
import {
  Inbox,
  PlusCircle,
  Compass,
  Mic,
  Headphones,
  Settings,
  Megaphone,
  MessageSquare,
  MessagesSquare,
  Hash,
  PanelLeft,
  UsersRound,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/ui/avatar";
import { Button } from "@/src/ui/button";
import { useServerContext } from "@/src/context/server.provider";
import {
  ChannelData,
  ChannelType,
  Friend,
  ViewMode,
} from "@/src/types/server.types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/ui/accordion";
import { useAppSelector } from "@/src/hooks/redux";
import AddFriendDialog from "./dialogs";

export const getChannelIcon = (channelType: ChannelType) => {
  switch (channelType) {
    case "dm":
      return <MessageSquare />;
    case "group_dm":
      return <MessagesSquare />;
    case "guild_announcement":
      return <Megaphone />;
    case "guild_text":
      return <Hash />;
    default:
      break;
  }
};

// Duplicate Data
const dummyServers = Array(100).fill({
  _id: `Random String ${Math.random()}`,
  name: "Name",
  description: "Description",
  createdBy: "user",
  icon: "https://img.icons8.com/ios-filled/100/university.png",
  banner: "https://img.icons8.com/ios-filled/100/university.png",
  serverType: "class",
  channels: [],
  users: [],
  leaders: [],
  createdAt: "Afjsjfdl",
  updatedAt: "",
});

const dummyChannels = Array(100).fill({
  _id: `Random String ${
    Math.random() * 10000000 + (Math.random() / 2) * Math.random()
  }`,
  name: "Name",
  description: "Description",
  serverType: "class",
  messages: [],
  type: "text",
  createdBy: "userId",
  createdAt: "Afjsjfdl",
  updatedAt: "",
});

const dummyDMs = Array(100).fill({
  user: {
    name: `Random Name`,
    avatarURL: `https://img.icons8.com/?size=48&id=kDoeg22e5jUY&format=png`,
  },
  channelID: "Random Channel",
});

export default function ServerSidebar() {
  const {
    view,
    setView,
    serverData,
    currentServer,
    channelData,
    changeServers,
    changeChannels,
    currentChannel,
    leftSidebar,
    setLeftSidebar,
    friendsList,
    changeDM,
  } = useServerContext();

  const { user } = useAppSelector((state) => state.auth);

  return (
    <>
      {leftSidebar && (
        <div
          onClick={() => setLeftSidebar(!leftSidebar)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
        />
      )}
      <div
        className={`
          h-full border-r bg-sidebar transition-all duration-300 ease-in-out fixed md:relative z-50 md:z-auto
          ${
            leftSidebar
              ? "max-w-96 opacity-100"
              : "max-w-0 opacity-0 overflow-hidden"
          }
        `}
      >
        <div className="w-fit h-full flex">
          {/* Icon Navigation Sidebar */}
          <div className="w-16 border-r bg-sidebar flex flex-col">
            {/* Header */}
            <div className="h-14 flex items-center justify-center border-b">
              <Tooltip>
                <TooltipTrigger onClick={() => setView("friends")} asChild>
                  <div className="bg-sidebar-primary cursor-pointer text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Inbox className="size-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Inbox</TooltipContent>
              </Tooltip>
            </div>

            {/* Navigation Items */}
            <div className="flex flex-col overflow-y-auto custom-scrollbar items-center gap-2 flex-1 p-2 space-y-1 ">
              {serverData.map((server) => (
                <Tooltip key={server._id}>
                  <TooltipTrigger asChild>
                    <Avatar
                      onClick={() => {
                        setView("servers");
                        changeServers(server);
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
                  </TooltipTrigger>
                  <TooltipContent side="right">{server.name}</TooltipContent>
                </Tooltip>
              ))}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" className="rounded-2xl">
                    <PlusCircle />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Create A Server</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" className="rounded-2xl">
                    <Compass />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Explore More</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Expandable Detail Panel */}
          <div className="w-50 flex flex-col bg-sidebar border-r">
            {/* Panel Header */}
            <div className="border-b p-4 space-y-3">
              <div className="flex items-center justify-between">
                {view === "inbox" || view === "friends" ? (
                  <div className="flex flex-col gap-2 items-start">
                    <Button
                      variant="outline"
                      onClick={() => setView("friends")}
                      className="flex-1"
                    >
                      <UsersRound />
                      Friends
                    </Button>
                    <AddFriendDialog triggerClass="hidden md:flex" />
                  </div>
                ) : (
                  <h2 className="text-base font-medium text-foreground">
                    {currentServer?.name}
                  </h2>
                )}
                <Button
                  className="md:hidden p-1 hover:bg-sidebar-accent rounded-md transition-colors size-7"
                  variant="ghost"
                  onClick={() => setLeftSidebar(!leftSidebar)}
                  size="icon"
                >
                  <PanelLeft />
                </Button>
              </div>
            </div>

            {view === "inbox" || view === "friends" ? (
              <DirectMessageList
                friendsList={friendsList}
                setCurrentDM={changeDM}
              />
            ) : (
              <ChannelList
                channelData={channelData}
                changeChannels={changeChannels}
                currentChannel={currentChannel}
              />
            )}
          </div>
          <div className="absolute bottom-0 left-0 bg-card border-t p-2 m-1 mb-3 rounded-xl flex items-center gap-2 shadow-lg">
            <Avatar className="rounded-lg">
              <AvatarImage src={user?.avatarURL} alt={user?.name} />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user?.name}</span>
              <span className="truncate text-xs">Do not Disturb</span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <Mic />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Voice Channels Coming Soon</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <Headphones />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Video Channels Coming Soon</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <Settings />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </>
  );
}

export function DirectMessageList({
  friendsList,
  setCurrentDM,
}: {
  friendsList: Friend[];
  setCurrentDM: (dm: Friend) => void;
}) {
  return (
    <div className="w-full overflow-y-auto custom-scrollbar">
      <span className="mx-4 text-muted-foreground hover:no-underline hover:text-foreground">
        Direct Messages
      </span>
      {friendsList.map((dm, index) => (
        <div
          key={index}
          className="flex items-center gap-2 px-2 py-1.5 mx-2 rounded text-sm cursor-pointer transition-colors text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground group"
          onClick={() => setCurrentDM(dm)}
        >
          <Avatar className="rounded-lg">
            <AvatarImage src={dm.user.avatarURL} alt={dm.user.name} />
            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{dm.user.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

interface ChannelListProps {
  channelData: ChannelData[];
  changeChannels: (channel: ChannelData) => void;
  currentChannel?: ChannelData | null;
}

const getChannelGroupName = (type: ChannelType) => {
  switch (type) {
    case "guild_text":
      return "Text Channels";
    case "guild_announcement":
      return "Announcements";
  }
};

export function ChannelList({ channelData, changeChannels }: ChannelListProps) {
  const channelMap = new Map<ChannelType, ChannelData[]>();

  channelData.forEach((channel) => {
    if (!channelMap.has(channel.type)) channelMap.set(channel.type, [channel]);
    else channelMap.get(channel.type)?.push(channel);
  });

  return (
    <Accordion
      type="multiple"
      className="w-full overflow-y-auto custom-scrollbar"
      defaultValue={Array.from(channelMap.keys())}
    >
      {Array.from(channelMap.entries()).map(([type, channels], index) => (
        <AccordionItem value={type} key={index} className="border-none">
          <AccordionTrigger className="items-center px-2 py-2 cursor-pointer text-muted-foreground hover:no-underline hover:text-foreground">
            {getChannelIcon(type)}
            {getChannelGroupName(type)}
          </AccordionTrigger>
          <AccordionContent className="pb-1 ">
            {channels.map((channel) => (
              <div
                key={channel._id}
                onClick={() => changeChannels(channel)}
                className="flex items-center gap-2 px-2 py-1.5 mx-2 rounded text-sm cursor-pointer transition-colors text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground group"
              >
                <span className="text-muted-foreground group-hover:text-foreground">
                  {getChannelIcon(type)}
                </span>
                <span className="truncate">{channel.name}</span>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
