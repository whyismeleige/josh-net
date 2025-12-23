"use client";
import { useJosephineContext } from "@/src/context/josephine.provider";
import { usePageTitle } from "@/src/hooks/usePageTitle";
import { useParams } from "next/navigation";
import { forwardRef, useEffect, useRef, useState } from "react";
import JosephineInput from "./input";
import { Button } from "@/components/ui/button";
import { Attachment } from "@/src/types/josephine.types";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

// Typing animation component
const TypingText = ({ text, speed = 10 }: { text: string; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const { setAnimateLastMessage } = useJosephineContext();

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length && text.length > 0) {
      // Animation complete
      setAnimateLastMessage(false);
    }
  }, [currentIndex, text, speed, setAnimateLastMessage]);

  return <span>{displayedText}</span>;
};

interface MessageProps {
  role: "user" | "ai" | "assistant";
  content: string;
  isAnimated: boolean;
  attachments: Attachment[];
}

// Message component
const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ role, content, isAnimated, attachments }, ref) => {
    const isUser = role === "user";

    return (
      <div
        className={`flex w-full flex-col ${
          isUser ? "items-end" : "items-start"
        } mb-4 px-4 group`}
        ref={ref}
      >
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 rounded-t-md">
            {attachments.map((attachedFile, index) => (
              <div
                key={index}
                className="relative group cursor-pointer rounded-lg border bg-card overflow-hidden hover:border-primary/50 transition-colors"
                style={{ width: "120px", height: "120px" }}
              >
                {/* Preview Content */}
                <div className="w-full h-full flex items-center justify-center p-2">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <span className="text-xs text-center line-clamp-2 px-1 break-all">
                      {attachedFile.title}
                    </span>
                  </div>
                </div>

                {/* Overlay with file info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p
                    className="text-xs text-white truncate"
                    title={attachedFile.title}
                  >
                    {attachedFile.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div
          className={`max-w-2xl rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "text-card-foreground border"
          }`}
        >
          <p className="text-md leading-relaxed whitespace-pre-wrap">
            {isAnimated ? TypingText({ text: content }) : content}
          </p>
        </div>
        {/* <div className="visible md:invisible group-hover:visible">
        <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(content)}>
          <Copy />
        </Button>
        <Button variant="ghost" size="icon">
          <ThumbsUp />
        </Button>
        <Button variant="ghost" size="icon">
          <ThumbsDown />
        </Button>
        <Button variant="ghost" size="icon">
          <RotateCcw />
        </Button>
      </div> */}
      </div>
    );
  }
);

Message.displayName = "Message";

export default function JosephineChat() {
  usePageTitle("Josephine");

  const params = useParams();
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const endOfChatRef = useRef<HTMLDivElement>(null);

  const { getChat, currentChat, animateLastMessage, access, loading } =
    useJosephineContext();

  useEffect(() => {
    if (currentChat?.title) {
      document.title = currentChat.title;
    }

    return () => {
      document.title = "Josephine";
    };
  }, [currentChat?.title]);

  useEffect(() => {
    if (params.id) {
      getChat(params.id);
    }
  }, [params.id, getChat]);

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [params.id]);

  useEffect(() => {
    if (currentChat?.conversationHistory.length) {
      const lastMessage =
        currentChat.conversationHistory[
          currentChat.conversationHistory.length - 1
        ];

      // If it's a user message (just added), scroll to show it at the top
      if (lastMessage.author === "user") {
        lastMessageRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
      // If it's an AI message, scroll to show it (keep it in view)
      else {
        lastMessageRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [
    currentChat?.conversationHistory,
    currentChat?.conversationHistory.length,
  ]);

  if (currentChat?.access === "private" && access === "public") {
    return (
      <div className="flex flex-col h-full overflow-y-auto justify-center items-center gap-5 p-5 bg-card">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Josephine
        </h3>
        <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
          Conversation Not Found!!!
        </h1>
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-center">
          The requested conversation either doesn’t exist or you don’t have
          permission to access it.
        </p>
        <Button asChild>
          <Link href="/student/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full overflow-y-auto justify-center items-center p-2 bg-card">
      {/* Chat Messages Container */}
      <div className="w-full h-full overflow-y-auto pb-4 pt-4 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {currentChat?.conversationHistory.map((message, index) => (
            <Message
              ref={
                currentChat.conversationHistory.length - 1 === index
                  ? lastMessageRef
                  : null
              }
              key={index}
              role={message.author}
              content={message.message}
              attachments={message.attachments}
              isAnimated={
                animateLastMessage &&
                currentChat?.conversationHistory.length - 1 === index
              }
            />
          ))}
          {(animateLastMessage || loading) && (
            <div className="h-svh">
              <Spinner />
            </div>
          )}
          <div ref={endOfChatRef} />
        </div>
      </div>

      {access === "private" ? (
        <JosephineInput />
      ) : (
        <Button>Click to Use Josephine</Button>
      )}
    </div>
  );
}
