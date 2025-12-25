"use client";
import { useServerContext } from "@/src/context/server.provider";
import RightSidebar from "./right-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/ui/avatar";
import { useAppSelector } from "@/src/hooks/redux";
import { usePageTitle } from "@/src/hooks/usePageTitle";
import { useEffect, useRef } from "react";
import { MessageAttachments } from "@/src/components/shared/Attachments";
import ServerInput from "./input";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface AttachedFile {
  file: File;
  preview?: string;
  id: string;
}

export default function StudentServer() {
  const endOfChatRef = useRef<HTMLDivElement>(null);

  const { user } = useAppSelector((state) => state.auth);
  const { messages, currentServer } = useServerContext();

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  usePageTitle(currentServer?.name || "Student Server");
  return (
    <div className="flex flex-1 w-full max-w-full h-full min-h-0">
      <div className="flex-1 p-1 w-full max-w-full flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto space-y-4 p-1 custom-scrollbar">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                message.userId._id === user?._id && "flex-row-reverse"
              } gap-3 group p-3 rounded-lg transition-colors`}
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
                    {formatTime(message.timestamp)}
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
          ))}
          <div ref={endOfChatRef} />
        </div>
        <ServerInput />
      </div>
      <RightSidebar />
    </div>
  );
}
