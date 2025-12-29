"use client";
import { useServerContext } from "@/src/context/server.provider";
import RightSidebar from "./right-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/ui/avatar";
import { useAppSelector } from "@/src/hooks/redux";
import { usePageTitle } from "@/src/hooks/usePageTitle";
import { Fragment, useEffect, useRef, useState } from "react";
import { MessageAttachments } from "@/src/components/shared/Attachments";
import ServerInput from "./input";
import { MessageData } from "@/src/types/server.types";
import { useDynamicMetadata } from "@/src/hooks/useDynamicMetadata";
import { Separator } from "@/src/ui/separator";
import {
  Angry,
  ArrowLeftIcon,
  Check,
  CornerUpRight,
  Ellipsis,
  Forward,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Reply,
  Search,
  Smile,
  ThumbsUp,
  X,
} from "lucide-react";
import { Button } from "@/src/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/ui/input-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/ui/tooltip";

const friends = Array(100).fill({
  user: {
    name: `Random Name`,
    avatarURL: `https://img.icons8.com/?size=48&id=kDoeg22e5jUY&format=png`,
  },
  channelID: "Random Channel",
});

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatMessageTimestamp = (timestamp: string): string => {
  const messageDate = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time to midnight for date comparison
  const messageDateOnly = new Date(messageDate);
  messageDateOnly.setHours(0, 0, 0, 0);
  const todayOnly = new Date(today);
  todayOnly.setHours(0, 0, 0, 0);
  const yesterdayOnly = new Date(yesterday);
  yesterdayOnly.setHours(0, 0, 0, 0);

  // Format time (e.g., "2:30 PM" or "14:30")
  const timeString = messageDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true, // Set to false for 24-hour format
  });

  if (messageDateOnly.getTime() === todayOnly.getTime()) {
    // Today: show only time
    return timeString;
  } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
    // Yesterday: show "Yesterday at 2:30 PM"
    return `Yesterday at ${timeString}`;
  } else {
    // Older: show full date and time
    const dateString = messageDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        messageDate.getFullYear() !== today.getFullYear()
          ? "numeric"
          : undefined,
    });
    return `${dateString}, ${timeString}`;
  }
};

const formatDateHeader = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time to midnight for accurate comparison
  const messageDate = new Date(date);
  messageDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);

  if (messageDate.getTime() === today.getTime()) {
    return "Today";
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  } else {
    // Format as "January 15, 2024" or your preferred format
    return messageDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
};

const shouldShowDateSeparator = (
  currentMessage: MessageData,
  previousMessage: MessageData | null
): boolean => {
  if (!previousMessage) return true;

  const currentDate = new Date(currentMessage.timestamp);
  const previousDate = new Date(previousMessage.timestamp);

  // Compare dates (ignoring time)
  return currentDate.toDateString() !== previousDate.toDateString();
};

export default function StudentServer() {
  const endOfChatRef = useRef<HTMLDivElement>(null);

  const { user } = useAppSelector((state) => state.auth);
  const { messages, currentServer, checkMessageInTransit, view, friendsView } =
    useServerContext();

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  usePageTitle(currentServer?.name || "Student Server");

  useDynamicMetadata({
    title: currentServer?.name || "JOSH Net",
    favicon: currentServer?.icon,
    description: currentServer?.description || "Description",
  });
  return (
    <div className="flex flex-1 w-full max-w-full h-full min-h-0">
      {view === "friends" ? (
        <div className="flex-1 p-2 w-full max-w-full flex flex-col min-w-0">
          <InputGroup className="mb-4">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search" />
          </InputGroup>
          <span className="text-sm m-4">
            {friendsView === "all" && "All friends"}
            {friendsView === "pending" && "Sent"}
            {friendsView === "requests" && "Requests Received"} -
          </span>
          <Separator />
          <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
            {friendsView === "all" &&
              friends.map((friend, index) => (
                <div
                  key={index}
                  className="flex group/friend items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground group"
                >
                  <Avatar className="rounded-lg">
                    <AvatarImage
                      src={friend.user.avatarURL}
                      alt={friend.user.name}
                    />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {friend.user.name}
                    </span>
                  </div>
                  <div className="opacity-100 md:opacity-0 group-hover/friend:opacity-100">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MessageCircle />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Chat with {friend.user.name}
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <Ellipsis />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>More</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
            {friendsView === "requests" &&
              friends.map((friend, index) => (
                <div
                  key={index}
                  className="flex group/friend items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground group"
                >
                  <Avatar className="rounded-lg">
                    <AvatarImage
                      src={friend.user.avatarURL}
                      alt={friend.user.name}
                    />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {friend.user.name}
                    </span>
                  </div>
                  <div className="opacity-100 md:opacity-0 group-hover/friend:opacity-100">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <Check />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Accept Request</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <X />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Reject Request</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
            {friendsView === "pending" &&
              friends.map((friend, index) => (
                <div
                  key={index}
                  className="flex group/friend items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground group"
                >
                  <Avatar className="rounded-lg">
                    <AvatarImage
                      src={friend.user.avatarURL}
                      alt={friend.user.name}
                    />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {friend.user.name}
                    </span>
                  </div>
                  <div className="opacity-100 md:opacity-0 group-hover/friend:opacity-100">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <X />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Cancel</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 p-1 w-full max-w-full flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto space-y-4 p-1 custom-scrollbar">
            {messages.map((message, index) => (
              <Fragment key={message._id}>
                {!checkMessageInTransit(message._id) &&
                  shouldShowDateSeparator(
                    message,
                    index > 0 ? messages[index - 1] : null
                  ) && (
                    <div className="flex items-center justify-center my-4">
                      <div className="flex-grow border-t border-gray-300"></div>
                      <span className="px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {formatDateHeader(new Date(message.timestamp))}
                      </span>
                      <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                  )}
                <div
                  className={`flex relative group ${
                    message.userId._id === user?._id && "flex-row-reverse"
                  } gap-3 p-3 rounded-lg transition-colors`}
                >
                  <ActionBar
                    className={
                      message.userId._id === user?._id ? "left-0" : "right-0"
                    }
                  />
                  <Avatar className="h-10 w-10 rounded-full flex-shrink-0">
                    <AvatarImage
                      src={message.userId.avatarURL}
                      alt={message.userId.name}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-medium">
                      {getInitials(message.userId.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <div
                      className={`flex ${
                        message.userId._id === user?._id && "flex-row-reverse"
                      } items-baseline gap-2 mb-1`}
                    >
                      <span className="font-semibold text-sm">
                        {message.userId._id === user?._id
                          ? "Me"
                          : message.userId.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatMessageTimestamp(message.timestamp)}
                      </span>
                      {message.editedTimestamp && (
                        <span className="text-xs text-gray-400 italic">
                          (edited)
                        </span>
                      )}
                    </div>

                    {message.content?.trim() !== "" && (
                      <p className=" text-sm leading-relaxed break-words">
                        {message.content}
                      </p>
                    )}
                    <MessageAttachments attachments={message.attachments} />
                  </div>
                </div>
              </Fragment>
            ))}
            <div ref={endOfChatRef} />
          </div>
          <ServerInput />
        </div>
      )}
      {view === "servers" && <RightSidebar />}
    </div>
  );
}

export function ActionBar({ className }: { className?: string }) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      {/* Desktop action bar */}
      <div
        className={cn(
          "absolute top-2 z-10 hidden md:flex",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          className
        )}
      >
        <ButtonGroup className="flex items-center shadow-lg bg-white dark:bg-gray-800 rounded-lg border">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Smile className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Angry className="h-4 w-4" />
          </Button>
          <ButtonGroupSeparator />
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Reply className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Forward className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Ellipsis className="h-4 w-4" />
          </Button>
        </ButtonGroup>
      </div>

      {/* Mobile: Long press trigger */}
      <button
        className="md:hidden absolute inset-0 w-full h-full"
        onTouchStart={(e) => {
          const timer = setTimeout(() => setShowMobileMenu(true), 500);
          e.currentTarget.dataset.timer = timer.toString();
        }}
        onTouchEnd={(e) => {
          clearTimeout(Number(e.currentTarget.dataset.timer));
        }}
        aria-label="Long press for options"
      />

      {/* Mobile menu sheet */}
      {showMobileMenu && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setShowMobileMenu(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 w-full rounded-t-2xl p-4 space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-4 justify-center mb-4">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
              >
                <Smile className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
              >
                <ThumbsUp className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
              >
                <Angry className="h-5 w-5" />
              </Button>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setShowMobileMenu(false)}
            >
              <Reply className="h-4 w-4 mr-2" /> Reply
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setShowMobileMenu(false)}
            >
              <Forward className="h-4 w-4 mr-2" /> Forward
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600"
              onClick={() => setShowMobileMenu(false)}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
