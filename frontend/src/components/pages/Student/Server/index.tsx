"use client";
import { useServerContext } from "@/src/context/server.provider";
import RightSidebar from "./right-sidebar";
import { ImageIcon, Laugh, Paperclip, Send, Sticker } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/ui/avatar";
import { useAppSelector } from "@/src/hooks/redux";
import { usePageTitle } from "@/src/hooks/usePageTitle";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "@/src/ui/input-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/ui/tooltip";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const endOfChatRef = useRef<HTMLDivElement>(null);

  const { user } = useAppSelector((state) => state.auth);
  const {
    messageInput,
    setMessageInput,
    sendMessage,
    messages,
    currentServer,
    setAttachments,
  } = useServerContext();

  const [attachedFiles, setAttachedFiles] = useState<
    { file: File; preview?: string; id: string }[]
  >([]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files || []);

    files.forEach((file) => {
      const id = `${Date.now()}-${Math.random()}`;

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachedFiles((prev) => [
            ...prev,
            { file, preview: reader.result as string, id },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files, just add without preview
        setAttachedFiles((prev) => [...prev, { file, id }]);
      }
    });
    setAttachments(Array.from(files));
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((file) => file.id !== id));
  };

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

                <p className=" text-sm leading-relaxed break-words">
                  {message.content}
                </p>
              </div>
            </div>
          ))}
          <div ref={endOfChatRef} />
        </div>
        <div className="w-full p-2 max-w-full">
          <InputGroup className="px-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton
                  variant="ghost"
                  className="rounded-full"
                  size="icon-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <InputGroupInput
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    multiple
                  />
                  <Paperclip />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>Attachments</TooltipContent>
            </Tooltip>
            <InputGroupTextarea
              placeholder="Enter your Message"
              value={messageInput}
              className="max-h-[100px] overflow-y-auto custom-scrollbar"
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <Tooltip>
              <TooltipTrigger className="ml-auto max-sm:hidden" asChild>
                <InputGroupButton
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full"
                >
                  <ImageIcon />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>Images</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger className="ml-auto max-sm:hidden" asChild>
                <InputGroupButton
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full"
                >
                  <Sticker />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>Stickers</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger className="ml-auto max-sm:hidden" asChild>
                <InputGroupButton
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full"
                >
                  <Laugh />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>Images</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger className="max-sm:ml-auto" asChild>
                <InputGroupButton
                  variant="ghost"
                  className="rounded-full"
                  size="icon-sm"
                  onClick={sendMessage}
                >
                  <>
                    <Send />
                    <span className="sr-only">Send</span>
                  </>
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>Send</TooltipContent>
            </Tooltip>
          </InputGroup>
        </div>
      </div>
      <RightSidebar />
    </div>
  );
}
