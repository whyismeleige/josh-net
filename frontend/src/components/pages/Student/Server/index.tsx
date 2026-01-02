"use client";
import { useServerContext } from "@/src/context/server.provider";
import RightSidebar from "./right-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/ui/avatar";
import { useAppSelector } from "@/src/hooks/redux";
import { usePageTitle } from "@/src/hooks/usePageTitle";
import { Fragment, useEffect, useRef, useState } from "react";
import { MessageAttachments } from "@/src/components/shared/Attachments";
import ServerInput from "./input";
import { MessageData, Reaction } from "@/src/types/server.types";
import { Separator } from "@/src/ui/separator";
import EmojiMenu from "@/src/components/shared/Emoji-Picker";
import { User } from "@/src/types/auth.types";
import {
  Angry,
  Check,
  Copy,
  Edit,
  Ellipsis,
  Forward,
  MessageCircle,
  Reply,
  Search,
  Smile,
  ThumbsUp,
  Trash,
  X,
} from "lucide-react";
import { Button } from "@/src/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/ui/input-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/ui/dropdown-menu";
import { EmojiClickData } from "emoji-picker-react";
import {
  DeleteMessageDialog,
  EditMessageDialog,
  ForwardMessageDialog,
} from "./dialogs";

// const friends = Array(100).fill({
//   user: {
//     name: `Random Name`,
//     avatarURL: `https://img.icons8.com/?size=48&id=kDoeg22e5jUY&format=png`,
//   },
//   channelID: "Random Channel",
// });

// const reactions: Reaction[] = Array(20).fill({
//   emoji: "😀",
//   users: [],
//   count: 100,
// });

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
  const {
    messages,
    currentServer,
    checkMessageInTransit,
    view,
    friendsView,
    friendRequests,
    friendsList,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    changeDM,
  } = useServerContext();

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const pageTitle =
    view !== "servers" ? "Inbox" : currentServer?.name || "Student Server";
  usePageTitle(pageTitle);

  // useDynamicMetadata({
  //   title: view !== "servers" ? "Inbox" : currentServer?.name || "JOSH Net",
  //   favicon: currentServer?.icon,
  //   description: currentServer?.description || "Description",
  // });

  const requestsReceived = friendRequests.filter(
    (request) => request.status === "incoming"
  );
  const requestsSent = friendRequests.filter(
    (request) => request.status === "outgoing"
  );

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
            {friendsView === "all" && `All friends - ${friendsList.length}`}
            {friendsView === "pending" && `Sent - ${requestsSent.length}`}
            {friendsView === "requests" &&
              `Requests Received - ${requestsReceived.length}`}
          </span>
          <Separator />
          <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
            {friendsView === "all" &&
              friendsList.map((friend, index) => (
                <div
                  key={index}
                  className="flex group/friend items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground group"
                >
                  <div
                    className="flex-1 flex items-center gap-2 cursor-pointer"
                    onClick={() => changeDM(friend)}
                  >
                    <Avatar className="rounded-lg">
                      <AvatarImage
                        src={friend.user?.avatarURL}
                        alt={friend.user?.name}
                      />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {friend.user?.name}
                      </span>
                    </div>
                  </div>
                  <div className="opacity-100 md:opacity-0 group-hover/friend:opacity-100">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          onClick={() => changeDM(friend)}
                          size="icon-sm"
                        >
                          <MessageCircle />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Chat with {friend.user?.name}
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
              requestsReceived.map((request, index) => (
                <div
                  key={index}
                  className="flex group/friend items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground group"
                >
                  <Avatar className="rounded-lg">
                    <AvatarImage
                      src={request.user.avatarURL}
                      alt={request.user.name}
                    />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {request.user.name}
                    </span>
                  </div>
                  <div className="opacity-100 md:opacity-0 group-hover/friend:opacity-100">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          onClick={() => acceptFriendRequest(request.user._id)}
                          size="icon-sm"
                        >
                          <Check />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Accept Request</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          onClick={() => rejectFriendRequest(request.user._id)}
                          size="icon-sm"
                        >
                          <X />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Reject Request</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
            {friendsView === "pending" &&
              requestsSent.map((request, index) => (
                <div
                  key={index}
                  className="flex group/friend items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground group"
                >
                  <Avatar className="rounded-lg">
                    <AvatarImage
                      src={request.user.avatarURL}
                      alt={request.user.name}
                    />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {request.user.name}
                    </span>
                  </div>
                  <div className="opacity-100 md:opacity-0 group-hover/friend:opacity-100">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          onClick={() => cancelFriendRequest(request.user._id)}
                          size="icon-sm"
                        >
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
                <MessageComponent message={message} user={user} />
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

export function MessageComponent({
  message,
  user,
}: {
  message: MessageData;
  user: User | null;
}) {
  const { toggleReactions, setReplyMessage } = useServerContext();

  return (
    <div
      className={`flex relative group ${
        message.userId._id === user?._id && "flex-row-reverse"
      } gap-3 p-3 rounded-lg transition-colors`}
    >
      <ActionBar
        className={message.userId._id === user?._id ? "left-0" : "right-0"}
        handleReactionChange={(emojiObject) =>
          toggleReactions(message._id, emojiObject)
        }
        replyMessage={() => setReplyMessage(message)}
        message={message}
      />
      <Avatar className="h-10 w-10 rounded-full flex-shrink-0">
        <AvatarImage src={message.userId.avatarURL} alt={message.userId.name} />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-medium">
          {getInitials(message.userId.name)}
        </AvatarFallback>
      </Avatar>

      <div
        className={`flex flex-col ${
          message.userId._id === user?._id && "items-end"
        } min-w-0 gap-2`}
      >
        <div className="flex items-baseline gap-2 ">
          <span className="font-semibold text-sm">
            {message.userId._id === user?._id ? "Me" : message.userId.name}
          </span>
          <span className="text-xs text-gray-500">
            {formatMessageTimestamp(message.timestamp)}
          </span>
          {message.editedTimestamp && (
            <span className="text-xs text-gray-400 italic">(edited)</span>
          )}
        </div>

        {/* Forwarded Message Preview */}
        {message.forwardedMessage && (
          <div
            className={`flex flex-col gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border-l-2 border-blue-500 w-full ${
              message.userId._id === user?._id && "self-end"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
              <Forward className="h-4 w-4" />
              <span className="font-medium">Forwarded message</span>
            </div>

            <div className="flex flex-col gap-1.5 pl-1">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 rounded-full">
                  <AvatarImage
                    src={message.forwardedMessage.userId.avatarURL}
                    alt={message.forwardedMessage.userId.name}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                    {getInitials(message.forwardedMessage.userId.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-xs text-gray-700 dark:text-gray-300">
                  {message.forwardedMessage.userId.name}
                </span>
                <span className="text-xs text-gray-500">
                  {formatMessageTimestamp(message.forwardedMessage.timestamp)}
                </span>
              </div>

              {message.forwardedMessage.content?.trim() !== "" && (
                <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                  {message.forwardedMessage.content}
                </span>
              )}

              {message.forwardedMessage.attachments?.length > 0 && (
                <MessageAttachments
                  attachments={message.forwardedMessage.attachments}
                  className="flex"
                />
              )}
            </div>
          </div>
        )}

        {/* Reply Message Preview */}
        {message.replyTo && (
          <div
            className={`flex items-center w-full gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md border-l-2 border-blue-500 text-xs ${
              message.userId._id === user?._id && "self-end"
            }`}
          >
            <div className="flex flex-col gap-1 min-w-0">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {message.replyTo.userId._id === user?._id
                  ? "Me"
                  : message.replyTo.userId.name}
              </span>
              <span className="text-gray-600 dark:text-gray-400 truncate">
                {message.replyTo.content || "Attachment"}
              </span>
            </div>
          </div>
        )}

        {message.content?.trim() !== "" && (
          <span className="flex text-sm leading-relaxed break-words">
            {message.content}
          </span>
        )}
        <MessageAttachments
          attachments={message.attachments}
          className="flex"
        />
        <Reactions
          reactions={message.reactions}
          className={message.userId._id === user?._id ? "flex-row-reverse" : ""}
        />
      </div>
    </div>
  );
}

export function ActionBar({
  className,
  handleReactionChange,
  replyMessage,
  message,
}: {
  className?: string;
  handleReactionChange: (emojiObject: EmojiClickData) => void;
  replyMessage: () => void;
  message: MessageData;
}) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ top: '50px', left: '10px' });
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  const { user } = useAppSelector((state) => state.auth);

  const isUser = user?._id === message.userId._id;

  const handleEmojiPickerToggle = () => {
    if (!showEmojiPicker && emojiButtonRef.current) {
      const rect = emojiButtonRef.current.getBoundingClientRect();
      setEmojiPickerPosition({
        top: `${rect.bottom + 8}px`,
        left: `${rect.left}px`,
      });
    }
    setShowEmojiPicker(!showEmojiPicker);
  };

  return (
    <>
      {/* Desktop action bar */}
      <div
        className={cn(
          "absolute top-2 z-10 flex ",
          "opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          className
        )}
      >
        <ButtonGroup className="flex items-center shadow-lg rounded-lg md:border">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                ref={emojiButtonRef}
                variant="ghost"
                size="icon"
                className="h-8 w-8 hidden md:flex"
                onClick={handleEmojiPickerToggle}
              >
                <Smile className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Reaction</TooltipContent>
          </Tooltip>
          {isUser && <EditMessageDialog message={message} />}
          <ForwardMessageDialog message={message} />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hidden md:flex"
                onClick={replyMessage}
              >
                <Reply className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 ">
                    <Ellipsis className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>More</TooltipContent>
            </Tooltip>
            <DropdownMenuContent className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={handleEmojiPickerToggle}
                  className="flex justify-between"
                >
                  Add Reaction <Smile />
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {isUser && (
                  <EditMessageDialog message={message}>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="flex justify-between"
                    >
                      Edit Message <Edit />
                    </DropdownMenuItem>
                  </EditMessageDialog>
                )}
                <DropdownMenuItem
                  onClick={replyMessage}
                  className="flex justify-between"
                >
                  Reply <Reply />
                </DropdownMenuItem>
                <ForwardMessageDialog message={message}>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="flex justify-between"
                  >
                    Forward <Forward />
                  </DropdownMenuItem>
                </ForwardMessageDialog>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(message.content || "")
                  }
                  className="flex justify-between"
                >
                  Copy Message <Copy />
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {isUser && (
                  <DeleteMessageDialog message={message}>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      variant="destructive"
                      className="flex justify-between "
                    >
                      Delete Message <Trash />
                    </DropdownMenuItem>
                  </DeleteMessageDialog>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      </div>

      {/* Emoji Picker - Rendered at root level with fixed positioning */}
      {showEmojiPicker && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[999]"
            onClick={() => setShowEmojiPicker(false)}
          />
          {/* Emoji Picker */}
          <div
            className="fixed z-[1000]"
            style={{
              top: emojiPickerPosition.top,
              left: emojiPickerPosition.left,
            }}
          >
            <EmojiMenu
              onEmojiClick={(emojiObject) => handleReactionChange(emojiObject)}
            />
          </div>
        </>
      )}

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

export function Reactions({
  reactions,
  className,
}: {
  reactions: Reaction[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {reactions.map((reaction, index) => (
        <Button key={index} variant="outline" size="sm">
          {/* Emoji */}
          <span>{reaction.emoji}</span>

          {/* Count */}
          <span>{reaction.count}</span>
        </Button>
      ))}
    </div>
  );
}
