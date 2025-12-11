"use client";
import { Input } from "@/components/ui/input";
import { useServerContext } from "@/src/context/server.provider";
import { useAppSelector } from "@/src/hooks/redux";
import { usePageTitle } from "@/src/hooks/usePageTitle";
import { BACKEND_URL } from "@/src/utils/config";
import { ChangeEvent, useEffect, useState } from "react";
import { io } from "socket.io-client";
import RightSidebar from "./right-sidebar";
import {
  CirclePlus,
  ImageIcon,
  Laugh,
  Search,
  Sticker,
  StickyNote,
} from "lucide-react";

// Dummy messages data
const messages = [
  {
    id: 1,
    user: "Alice",
    text: "Hey everyone! How are you doing today?",
    time: "10:30 AM",
    avatar: "A",
  },
  {
    id: 2,
    user: "Bob",
    text: "Doing great! Just finished a big project.",
    time: "10:32 AM",
    avatar: "B",
  },
  {
    id: 3,
    user: "Charlie",
    text: "Awesome! Congratulations Bob! 🎉",
    time: "10:33 AM",
    avatar: "C",
  },
  {
    id: 4,
    user: "Alice",
    text: "That's amazing Bob! What was the project about?",
    time: "10:35 AM",
    avatar: "A",
  },
  {
    id: 5,
    user: "Bob",
    text: "It was a new feature for our app. Took about 3 weeks to complete.",
    time: "10:37 AM",
    avatar: "B",
  },
  {
    id: 6,
    user: "Diana",
    text: "Nice work! Is it live yet?",
    time: "10:40 AM",
    avatar: "D",
  },
  {
    id: 7,
    user: "Bob",
    text: "Not yet, going through QA now. Should be live next week!",
    time: "10:42 AM",
    avatar: "B",
  },
  {
    id: 8,
    user: "Charlie",
    text: "Can't wait to try it out!",
    time: "10:43 AM",
    avatar: "C",
  },
  {
    id: 9,
    user: "Alice",
    text: "Same here! Keep us posted Bob.",
    time: "10:45 AM",
    avatar: "A",
  },
  {
    id: 10,
    user: "Eve",
    text: "Hey folks! Just joining. What did I miss?",
    time: "10:50 AM",
    avatar: "E",
  },
  {
    id: 11,
    user: "Diana",
    text: "Bob just finished a big project!",
    time: "10:51 AM",
    avatar: "D",
  },
  {
    id: 12,
    user: "Eve",
    text: "Oh that's awesome! Congrats Bob! 🎊",
    time: "10:52 AM",
    avatar: "E",
  },
  {
    id: 13,
    user: "Bob",
    text: "Thanks everyone for the support! 😊",
    time: "10:55 AM",
    avatar: "B",
  },
  {
    id: 14,
    user: "Alice",
    text: "We should celebrate when it goes live!",
    time: "11:00 AM",
    avatar: "A",
  },
  {
    id: 15,
    user: "Charlie",
    text: "Definitely! Let's plan something.",
    time: "11:02 AM",
    avatar: "C",
  },
];

export default function StudentServer() {
  const { getServerList } = useServerContext();

  const [value, setValue] = useState("");
  const socket = io(BACKEND_URL);

  usePageTitle("Student Server");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    socket.emit("chat-message", e.target.value);
  };

  useEffect(() => {
    getServerList();
  }, []);
  return (
    <div className="flex flex-1">
      <div className="flex-1 p-1">
        <div className="space-y-4 overflow-y-scroll">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {message.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-sm">{message.user}</span>
                  <span className="text-xs text-gray-500">{message.time}</span>
                </div>
                <p className="text-sm mt-1">{message.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="relative">
          <CirclePlus
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
          />
          <Input
            id="text"
            className="pl-10 h-1.5/2"
            placeholder="Enter your Message"
          />
          <div className="flex gap-3 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
            <ImageIcon size={20} />
            <Sticker size={20} />
            <Laugh size={20} />
          </div>
        </div>
      </div>
      <div className="border w-fit h-full">
        <RightSidebar />
      </div>
    </div>
  );
}
