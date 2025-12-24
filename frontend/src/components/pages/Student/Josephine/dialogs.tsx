import { Button } from "@/src/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/ui/dialog";
import { Input } from "@/src/ui/input";
import { Label } from "@/src/ui/label";
import { Spinner } from "@/src/ui/spinner";
import { Toggle } from "@/src/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/src/ui/tooltip";
import { useJosephineContext } from "@/src/context/josephine.provider";
import { ChatAccess, ChatsData } from "@/src/types/josephine.types";
import { FRONTEND_URL } from "@/src/utils/config";
import { Check, Globe, Lock, Pen, Share, Star, Trash } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function ShareDialog({ chat }: { chat: ChatsData }) {
  const [loading, setLoading] = useState(false);
  const { changeChatDetails } = useJosephineContext();

  const shareableLink = `${FRONTEND_URL}/student/josephine/share/${chat._id}`;

  const changeAccess = async (access: ChatAccess, chatId: string) => {
    if (chat.access === access) return;
    try {
      setLoading(true);
      changeChatDetails({ changeAccess: true }, chatId);
    } catch (error) {
      console.error("Error in Changing Access", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="mr-3">
          <Share />
          <span className="hidden md:block">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Chat</DialogTitle>
          <DialogDescription>Toggle Access of Your Chat</DialogDescription>
        </DialogHeader>
        <div>
          <Button
            variant="ghost"
            className={`w-full h-fit flex items-start gap-3 p-4 mb-2 rounded-lg border transition-colors`}
            onClick={() => changeAccess("private", chat._id)}
          >
            <Lock className="w-5 h-5 mt-0.5 text-zinc-400" />
            <div className="flex-1 text-left">
              <div className="font-medium">Private</div>
              <div className="text-sm text-zinc-400">Only you have access</div>
            </div>

            {chat.access === "private" && (
              <Check className="w-5 h-5 text-blue-500" />
            )}
          </Button>

          {/* Public Access Option */}
          <Button
            variant="ghost"
            onClick={() => changeAccess("public", chat._id)}
            className={`w-full h-fit flex items-start gap-3 p-4 rounded-lg border transition-colors`}
          >
            <Globe className="w-5 h-5 mt-0.5 text-zinc-400" />
            <div className="flex-1 text-left">
              <div className="font-medium">Public access</div>
              <div className="text-sm text-zinc-400">
                Anyone with the link can view
              </div>
            </div>

            {chat.access === "public" && (
              <Check className="w-5 h-5 text-blue-500" />
            )}
          </Button>
          {chat.access === "public" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={shareableLink} target="_blank">
                  <div className="mt-2 cursor-pointer">
                    <Label htmlFor="link" className="sr-only">
                      Link
                    </Label>
                    <Input
                      className="cursor-pointer"
                      id="shareable-link"
                      defaultValue={shareableLink}
                      readOnly
                    />
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Go to Shareable Link</TooltipContent>
            </Tooltip>
          )}
        </div>

        <DialogFooter>
          <Button
            className="bg-white text-black hover:bg-zinc-200 font-medium"
            onClick={() =>
              chat.access === "public"
                ? navigator.clipboard.writeText(shareableLink)
                : changeChatDetails({ changeAccess: true }, chat._id)
            }
          >
            {loading ? (
              <Spinner />
            ) : chat.access === "public" ? (
              "Copy Link"
            ) : (
              "Create Share Link"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ChangeTitleDialog({ chat }: { chat: ChatsData }) {
  const [newName, setNewName] = useState(chat.title);

  const { changeChatDetails } = useJosephineContext();

  const changeTitle = () => {
    if (newName.trim() === "") return;
    changeChatDetails({ newName }, chat._id);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <Pen />
          Rename
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Chat</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="name" className="sr-only">
              Name
            </Label>
            <Input
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              type="text"
              placeholder="Enter New Title"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={changeTitle}>Save changes</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteDialog({ chatId }: { chatId: string }) {
  const { deleteChat } = useJosephineContext();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <Trash />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Chat</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this chat?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={() => deleteChat(chatId)} variant="destructive">
              Delete
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function StarToggle({ chat }: { chat: ChatsData }) {
  const { changeChatDetails } = useJosephineContext();
  return (
    <Toggle
      aria-label="Toggle bookmark"
      variant="outline"
      defaultPressed={chat.isStarred}
      onClick={() => changeChatDetails({ changeStar: true }, chat._id)}
      className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-yellow-500 data-[state=on]:*:[svg]:stroke-yellow-500 justify-start border-none cursor-pointer"
    >
      <Star />
      {chat.isStarred ? "Unstar" : "Star"}
    </Toggle>
  );
}
