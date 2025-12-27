"use client";
import { MouseEvent, useState } from "react";
import { Plus, SearchIcon, Trash, X } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/ui/input-group";
import { Button } from "@/src/ui/button";
import Link from "next/link";
import { useJosephineContext } from "@/src/context/josephine.provider";
import { Checkbox } from "@/src/ui/checkbox";
import { Label } from "@/src/ui/label";

export default function JosephineAllChats() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChatIDs, setSelectedChatIDs] = useState<Set<string>>(
    new Set<string>()
  );
  const [lastSelected, setLastSelected] = useState<number | null>(null);
  const { chats, batchDelete } = useJosephineContext();

  const filteredChats = chats
    .filter((chat) => chat.title.includes(searchQuery.trim()))
    .reverse();

  const handleSelect = (
    event: MouseEvent<HTMLLabelElement, globalThis.MouseEvent>,
    chatId: string,
    index: number
  ) => {
    const newSelected = new Set(selectedChatIDs);

    if (event.shiftKey && lastSelected !== null) {
      const start = Math.min(lastSelected, index);
      const end = Math.max(lastSelected, index);

      for (let i = start; i <= end; i++) newSelected.add(filteredChats[i]._id);
    } else {
      if (newSelected.has(chatId)) {
        selectedChatIDs.delete(chatId);
      } else {
        selectedChatIDs.add(chatId);
      }
    }
    setSelectedChatIDs(newSelected);
    setLastSelected(index);
  };

  const selectAll = () => {
    setSelectedChatIDs(new Set(filteredChats.map((chat) => chat._id)));
  };

  const clearSelections = () => {
    setSelectedChatIDs(new Set<string>());
    setLastSelected(null);
  };

  const handleDelete = async () => {
    await batchDelete(Array.from(selectedChatIDs));
    clearSelections();
  };

  return (
    <section className="flex h-full w-full max-w-4xl  self-center overflow-y-auto flex-col ">
      {/* Header */}
      <div className="px-5 py-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-medium text-2xl tracking-wide">Chats</h1>
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
      <div className="group border-b">
        <div className="flex items-center justify-between gap-3 p-4">
          <Checkbox
            checked={selectedChatIDs.size !== 0}
            onClick={
              selectedChatIDs.size === filteredChats.length
                ? clearSelections
                : selectAll
            }
            className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 visible group-hover:visible data-[state=checked]:visible md:invisible cursor-pointer data-[state=checked]:text-white dark:data-[state=checked]:border-[#232323] dark:data-[state=checked]:bg-[#232323] "
          />
          <span className="flex text-sm items-center flex-1">
            {selectedChatIDs.size === 0 ? (
              <>
                {filteredChats.length} chats with{" "}
                {searchQuery.trim() === "" ? "Claude" : `"${searchQuery}"`}
              </>
            ) : (
              <>
                {selectedChatIDs.size} selected
                <Button
                  onClick={handleDelete}
                  className="ml-2 size-5"
                  variant="ghost"
                  size="icon-sm"
                >
                  <Trash />
                </Button>
              </>
            )}
          </span>
          {selectedChatIDs.size !== 0 && (
            <Button
              onClick={clearSelections}
              className="ml-2 size-5"
              variant="ghost"
              size="icon-sm"
            >
              <X />
            </Button>
          )}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredChats.map((chat, index) => (
          <Label
            key={chat._id}
            onClick={(e) => handleSelect(e, chat._id, index)}
            style={{
              animation: `slideIn 0.3s ease-out ${index * 0.03}s both`,
            }}
            className="hover:bg-card w-full group cursor-pointer flex items-center gap-3 rounded-lg border-b p-4 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-[#232323] dark:has-[[aria-checked=true]]:border-[#232323] dark:has-[[aria-checked=true]]:bg-[#232323]"
          >
            <Checkbox
              checked={selectedChatIDs.has(chat._id)}
              id={chat._id}
              className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 visible group-hover:visible data-[state=checked]:visible md:invisible cursor-pointer data-[state=checked]:text-white dark:data-[state=checked]:border-[#232323] dark:data-[state=checked]:bg-[#232323] "
            />
            <Link href={`/student/josephine/chat/${chat._id}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-normal mb-1.5 leading-[1.4] group-hover:text-white transition-colors">
                    {chat.title}
                  </h3>
                  <p className="text-[11.5px] text-[#6a6a6a] group-hover:text-[#888] transition-colors">
                    Last message
                  </p>
                </div>
              </div>
            </Link>
          </Label>
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
