"use client";
import { useJosephineContext } from "@/src/context/josephine.provider";
import { usePageTitle } from "@/src/hooks/usePageTitle";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import JosephineInput from "./input";
import { Button } from "@/components/ui/button";
import { Copy, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";

// Typing animation component
const TypingText = ({ text, speed = 10 }: { text: string; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return <span>{displayedText}</span>;
};

// Message component
const Message = ({
  role,
  content,
  isAnimated,
}: {
  role: "user" | "ai" | "assistant";
  content: string;
  isAnimated: boolean;
}) => {
  const isUser = role === "user";

  return (
    <div
      className={`flex w-full flex-col ${
        isUser ? "items-end" : "items-start"
      } mb-4 px-4 group`}
    >
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
      <div className="invisible group-hover:visible">
        <Button variant="ghost" size="icon">
          <Copy />
        </Button>
        <Button variant="ghost" size="icon">
          <ThumbsUp />
        </Button>
        <Button variant="ghost" size="icon">
          <ThumbsDown />
        </Button>
        <Button variant="ghost" size="icon">
          <RotateCcw/>
        </Button>
      </div>
    </div>
  );
};

export default function JosephineChat() {
  usePageTitle("Josephine");

  const params = useParams();
  const { getChat, currentChat, animateLastMessage } = useJosephineContext();

  const endOfChatRef = useRef<HTMLDivElement>(null);
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
  }, [currentChat?.conversationHistory.length]);

  return (
    <div className="flex flex-col h-full overflow-y-auto justify-center items-center p-2 bg-card">
      {/* Chat Messages Container */}
      <div className="w-full h-full overflow-y-auto pb-4 pt-4 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {currentChat?.conversationHistory.map((message, index) => (
            <Message
              key={index}
              role={message.author}
              content={message.message}
              isAnimated={
                animateLastMessage &&
                currentChat?.conversationHistory.length - 1 === index
              }
            />
          ))}
          <div ref={endOfChatRef} />
        </div>
      </div>

      <JosephineInput />
    </div>
  );
}
