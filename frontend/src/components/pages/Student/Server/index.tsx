"use client";
import { Input } from "@/components/ui/input";
import { useServerContext } from "@/src/context/server.provider";
import RightSidebar from "./right-sidebar";
import { CirclePlus, ImageIcon, Laugh, Send, Sticker } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppSelector } from "@/src/hooks/redux";
import { usePageTitle } from "@/src/hooks/usePageTitle";
import { useEffect, useRef } from "react";

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
export default function StudentServer() {
  const { user } = useAppSelector((state) => state.auth);
  const {
    messageInput,
    setMessageInput,
    sendMessage,
    messages,
    currentServer,
  } = useServerContext();

  const endOfChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  usePageTitle(currentServer?.name || "Student Server");
  return (
    <div className="flex flex-1 h-full min-h-0">
      <div className="flex-1 p-1 flex flex-col">
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

                <p className=" text-sm leading-relaxed break-words">
                  {message.content}
                </p>
              </div>
            </div>
          ))}
          <div ref={endOfChatRef} />
        </div>
        <div className="relative m-2">
          <CirclePlus
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
          />
          <Input
            id="text"
            className="pl-10 h-14 rounded-xl"
            placeholder="Enter your Message"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <div className="flex gap-3 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
            <Send size={20} onClick={sendMessage} />
            <ImageIcon size={20} />
            <Sticker size={20} />
            <Laugh size={20} />
          </div>
        </div>
      </div>
      <RightSidebar />
    </div>
  );
}
