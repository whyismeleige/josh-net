"use client";
import { useServerContext } from "@/src/context/server.provider";
import RightSidebar from "./right-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/ui/avatar";
import { useAppSelector } from "@/src/hooks/redux";
import { usePageTitle } from "@/src/hooks/usePageTitle";
import { Fragment, useEffect, useRef } from "react";
import { MessageAttachments } from "@/src/components/shared/Attachments";
import ServerInput from "./input";
import { MessageData } from "@/src/types/server.types";

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
  const timeString = messageDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true // Set to false for 24-hour format
  });
  
  if (messageDateOnly.getTime() === todayOnly.getTime()) {
    // Today: show only time
    return timeString;
  } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
    // Yesterday: show "Yesterday at 2:30 PM"
    return `Yesterday at ${timeString}`;
  } else {
    // Older: show full date and time
    const dateString = messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
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
    return messageDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
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
  const { messages, currentServer, checkMessageInTransit } = useServerContext();

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  usePageTitle(currentServer?.name || "Student Server");
  return (
    <div className="flex flex-1 w-full max-w-full h-full min-h-0">
      <div className="flex-1 p-1 w-full max-w-full flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto space-y-4 p-1 custom-scrollbar">
          {messages.map((message, index) => (
            <Fragment key={message._id}>
              {!checkMessageInTransit(message._id) && shouldShowDateSeparator(
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
                className={`flex ${
                  message.userId._id === user?._id && "flex-row-reverse"
                } gap-3 p-3 rounded-lg transition-colors`}
              >
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
      <RightSidebar />
    </div>
  );
}
