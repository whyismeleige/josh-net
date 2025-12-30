import { cn } from "@/lib/utils";
import { useServerContext } from "@/src/context/server.provider";
import { useAppSelector } from "@/src/hooks/redux";
import { User } from "@/src/types/auth.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/ui/avatar";
import { Button } from "@/src/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/ui/input-group";
import { Skeleton } from "@/src/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/ui/tooltip";
import { BACKEND_URL } from "@/src/utils/config";
import { Search, UserPlus } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";

export default function AddFriendDialog({
  triggerClass,
}: {
  triggerClass?: string;
}) {
  const { accessToken } = useAppSelector((state) => state.auth);
  const { sendFriendRequest } = useServerContext();

  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const onSearchChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    setSearchInput(e.target.value);
  };

  

  useEffect(() => {
    if (!searchInput.trim()) {
      setLoading(false);
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      const response = await fetch(`${BACKEND_URL}/api/v1/inbox/search-user`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword: searchInput }),
      });

      const data = await response.json();

      setLoading(false);
      setSearchResults(data.results);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={cn("flex-1 flex justify-start", triggerClass)}>
          <UserPlus />
          <span className="hidden md:inline">Add Friends</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogDescription>
            You can add a friend through their JOSH-Net Id
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <InputGroup>
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              value={searchInput}
              type="text"
              onChange={onSearchChange}
              placeholder="Search for a friend"
            />
          </InputGroup>

          {loading ? (
            <>
              {/* Skeleton Loader 1 */}
              <div className="flex items-center space-x-4">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>

              {/* Skeleton Loader 2 */}
              <div className="flex items-center space-x-4">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-5/12" />
                </div>
              </div>

              {/* Skeleton Loader 3 */}
              <div className="flex items-center space-x-4">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-2/5" />
                </div>
              </div>
            </>
          ) : searchInput.trim() && searchResults.length === 0 ? (
            <span>No Users found with "{searchInput}"</span>
          ) : (
            <div className="custom-scrollbar overflow-y-auto max-h-[175px]">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex group/user items-center gap-2 m-2 rounded text-sm cursor-pointer transition-colors text-muted-foreground hover:text-foreground group"
                >
                  <Avatar className="rounded-lg">
                    <AvatarImage src={user.avatarURL} alt={user.name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                  </div>
                  <div className="opacity-100 md:opacity-0 group-hover/user:opacity-100">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon-sm"
                          onClick={() => sendFriendRequest(user._id)}
                          variant="ghost"
                        >
                          <UserPlus />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Add {user.name}</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
