import React, { useState } from "react";
import { Search, Plus, MoreHorizontal, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useJosephineContext } from "@/src/context/josephine.provider";

export default function JosephineAllChats() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  const { chats } = useJosephineContext();

  return (
    <section className="flex h-full overflow-y-auto flex-col bg-card">
      {/* Header */}
      <div className="px-5 py-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-medium tracking-wide">Chats</h1>
          <Link href="/student/josephine/new">
            <Button>
              <Plus />
              New Chat
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <InputGroup>
          <InputGroupInput
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </div>

      {/* Chat Count */}
      <div className="px-5 py-3 border-b">
        <div className="flex items-center justify-between">
          <span className="text-xs ">{chats.length} chats with Claude</span>
          <Button size="sm" className="text-xs" variant="ghost">
            Select
          </Button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {[...chats].reverse().map((chat, index) => (
          <div
            key={chat._id}
            onClick={() => setSelectedChat(chat._id)}
            className={`w-full px-5 py-4 text-left border-b hover:bg-[#1f1f1f] transition-all group ${
              selectedChat === chat._id ? "bg-[#232323]" : ""
            }`}
            style={{
              animation: `slideIn 0.3s ease-out ${index * 0.03}s both`,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-normal mb-1.5 leading-[1.4] group-hover:text-white transition-colors">
                  {chat.title}
                </h3>
                <p className="text-[11.5px] text-[#6a6a6a] group-hover:text-[#888] transition-colors">
                  Last message
                </p>
              </div>
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#2a2a2a] rounded"
                aria-label="More options"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal size={14} className="text-[#888]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
}
