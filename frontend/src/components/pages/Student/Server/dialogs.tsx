import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { useServerContext } from "@/src/context/server.provider";
import { useAppDispatch, useAppSelector } from "@/src/hooks/redux";
import { addNotification } from "@/src/store/slices/notification.slice";
import { User } from "@/src/types/auth.types";
import {
  ForwardChannel,
  ForwardDM,
  MessageData,
  ServerType,
} from "@/src/types/server.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/ui/avatar";
import { Button } from "@/src/ui/button";
import { Checkbox } from "@/src/ui/checkbox";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/ui/input-group";
import { Label } from "@/src/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/ui/select";
import { Separator } from "@/src/ui/separator";
import { Skeleton } from "@/src/ui/skeleton";
import { Textarea } from "@/src/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/ui/tooltip";
import { BACKEND_URL } from "@/src/utils/config";
import { CheckedState } from "@radix-ui/react-checkbox";
import {
  BadgeCheckIcon,
  ChevronRightIcon,
  Forward,
  Paperclip,
  Pen,
  PlusCircle,
  Search,
  SendHorizonal,
  Trash,
  UploadIcon,
  UserPlus,
} from "lucide-react";
import {
  ChangeEvent,
  MouseEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

export function AddFriendDialog({ triggerClass }: { triggerClass?: string }) {
  const { accessToken } = useAppSelector((state) => state.auth);
  const { sendFriendRequest } = useServerContext();

  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const onSearchChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  useEffect(() => {
    if (!searchInput.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/v1/inbox/search-user`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ keyword: searchInput }),
          }
        );

        const data = await response.json();
        setSearchResults(data.results);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => {
      setLoading(false);
      clearTimeout(timeoutId);
    };
  }, [searchInput, accessToken]);
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
            <span>No Users found with &quot;{searchInput}&quot;</span>
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

export function ForwardMessageDialog({
  message,
  children,
}: {
  message: MessageData;
  children?: ReactNode;
}) {
  const dispatch = useAppDispatch();

  const { accessToken } = useAppSelector((state) => state.auth);
  const { currentChannel } = useServerContext();

  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [forwardDMs, setForwardDMs] = useState<ForwardDM[]>([]);
  const [forwardChannels, setForwardChannels] = useState<ForwardChannel[]>([]);
  const [searchChannel, setSearchChannel] = useState("");
  const [optionalMessage, setOptionalMessage] = useState("");

  const getForwardDestinations = async (open: boolean) => {
    try {
      if (!open) {
        setSelectedChannels([]);
        setSearchChannel("");
        setOptionalMessage("");
        return;
      }
      setLoading(true);
      const response = await fetch(
        `${BACKEND_URL}/api/v1/server/messages/forward/destinations`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();

      setForwardChannels(data.forwardChannels);
      setForwardDMs(data.forwardDMs);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Server Error, Try Again Later";
      dispatch(
        addNotification({
          type: "error",
          title: "Server Error",
          description: message,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const forwardMessages = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/server/messages/forward`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            forwardedMessage: message,
            channelIds: selectedChannels,
            messageContent: optionalMessage.trim(),
          }),
        }
      );

      const data = await response.json();

      if (data.type !== "success") throw new Error(data.message);

      setSelectedChannels([]);
      setSearchChannel("");
      setOptionalMessage("");

      dispatch(
        addNotification({
          type: data.type,
          title: "Successfully Forwarded Messages",
          description: data.message,
        })
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Server Error, Try Again Later";
      dispatch(
        addNotification({
          type: "error",
          title: "Server Error",
          description: message,
        })
      );
    }
  };

  const changeSelectedChannels = (checked: CheckedState, channelId: string) => {
    if (checked === "indeterminate") return;
    setSelectedChannels((prev) =>
      checked ? [...prev, channelId] : prev.filter((id) => id !== channelId)
    );
  };

  return (
    <Dialog onOpenChange={getForwardDestinations}>
      <Tooltip>
        <DialogTrigger asChild>
          {children ? (
            children
          ) : (
            <div>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hidden md:flex"
                >
                  <Forward className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Forward</TooltipContent>
            </div>
          )}
        </DialogTrigger>
      </Tooltip>

      <DialogContent>
        <DialogTitle>Forward To</DialogTitle>
        <DialogDescription>
          {selectedChannels.length !== 5
            ? "Select where you want to send the message"
            : "Maximum 5 Places at once"}
        </DialogDescription>
        <div className="flex flex-col gap-2">
          <InputGroup>
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              value={searchChannel}
              onChange={(e) => setSearchChannel(e.target.value)}
              placeholder="Search"
              type="text"
            />
          </InputGroup>
          <div className="mt-2 max-h-[300px] custom-scrollbar overflow-y-auto">
            {loading ? (
              // Skeleton loaders
              <>
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className="flex px-2 py-1.5 rounded items-center gap-2"
                  >
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                    <Skeleton className="h-4 w-4 rounded" />
                  </div>
                ))}
              </>
            ) : (
              <>
                {forwardDMs.map(
                  (dm, index) =>
                    currentChannel?._id !== dm.channelId &&
                    dm.friendName.includes(searchChannel) && (
                      <Label
                        className="flex px-2 py-1.5 rounded text-sm cursor-pointer transition-colors text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground group"
                        htmlFor={dm.channelId}
                        key={index}
                      >
                        <div className="flex-1 flex items-center gap-2 ">
                          <Avatar className="rounded-lg">
                            <AvatarImage
                              src={dm.friendAvatar}
                              alt={dm.friendName}
                            />
                            <AvatarFallback className="rounded-lg">
                              CN
                            </AvatarFallback>
                          </Avatar>
                          <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">
                              {dm.friendName}
                            </span>
                          </div>
                          <Checkbox
                            onCheckedChange={(checked) =>
                              changeSelectedChannels(checked, dm.channelId)
                            }
                            disabled={
                              selectedChannels.length === 5 &&
                              !selectedChannels.includes(dm.channelId)
                            }
                            id={dm.channelId}
                          />
                        </div>
                      </Label>
                    )
                )}
                {forwardChannels.map(
                  (channel, index) =>
                    currentChannel?._id !== channel.channelId &&
                    channel.channelName.includes(searchChannel) && (
                      <Label
                        className="flex px-2 py-1.5 rounded text-sm cursor-pointer transition-colors text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground group"
                        htmlFor={channel.channelId}
                        key={index}
                      >
                        <div className="flex-1 flex items-center gap-2 ">
                          <Avatar className="rounded-lg">
                            <AvatarImage
                              src={channel.serverIcon}
                              alt={channel.serverName}
                            />
                            <AvatarFallback className="rounded-lg">
                              CN
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col gap-2 flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">
                              {channel.channelName}
                            </span>
                            <span>{channel.serverName}</span>
                          </div>
                          <Checkbox
                            onCheckedChange={(checked) =>
                              changeSelectedChannels(checked, channel.channelId)
                            }
                            disabled={
                              selectedChannels.length === 5 &&
                              !selectedChannels.includes(channel.channelId)
                            }
                            id={channel.channelId}
                          />
                        </div>
                      </Label>
                    )
                )}
              </>
            )}
          </div>
          <Separator />
          <div
            className={`flex items-center w-full gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md border-l-2 border-blue-500 text-md `}
          >
            <div className="flex flex-col gap-1 min-w-0">
              {message.content && (
                <span className="text-gray-600 dark:text-gray-400 truncate">
                  {message.content}
                </span>
              )}
              {message.attachments.length !== 0 && (
                <span className="flex text-gray-600 dark:text-gray-400 truncate items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  {message.attachments.length} files
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              value={optionalMessage}
              onChange={(e) => setOptionalMessage(e.target.value)}
              placeholder="Add an optional message"
            />
            <DialogClose asChild>
              <Button
                onClick={forwardMessages}
                disabled={!selectedChannels.length}
              >
                Send{" "}
                {selectedChannels.length > 2 && `(${selectedChannels.length})`}
                <SendHorizonal />
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteMessageDialog({
  message,
  children,
}: {
  message: MessageData;
  children?: ReactNode;
}) {
  const dispatch = useAppDispatch();

  const { currentChannel } = useServerContext();
  const { accessToken } = useAppSelector((state) => state.auth);

  const deleteMessage = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/server/message`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelId: currentChannel?._id,
          messageId: message._id,
        }),
      });

      const data = await response.json();

      if (data.type !== "success") throw new Error(data.message);

      dispatch(
        addNotification({
          title: "Successfully Edited Message",
          type: data.type,
          description: data.message,
        })
      );
    } catch (error) {
      console.error("Error in Editing Message");
      const message =
        error instanceof Error
          ? error.message
          : "Server Error, Try Again Later";

      dispatch(
        addNotification({
          title: "Error in Editing Message",
          description: message,
          type: "error",
        })
      );
    }
  };
  return (
    <Dialog>
      <Tooltip>
        <DialogTrigger asChild>
          {children ? (
            children
          ) : (
            <div>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hidden md:flex"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </div>
          )}
        </DialogTrigger>
      </Tooltip>

      <DialogContent>
        <DialogTitle>Delete Message</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this message?
        </DialogDescription>
        <div
          className={`flex items-center w-full gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md border-l-2 border-blue-500 text-md `}
        >
          <div className="flex flex-col gap-1 min-w-0">
            {message.content && (
              <span className="text-gray-600 dark:text-gray-400 truncate">
                {message.content}
              </span>
            )}
            {message.attachments.length !== 0 && (
              <span className="flex text-gray-600 dark:text-gray-400 truncate items-center gap-2">
                <Paperclip className="h-4 w-4" />
                {message.attachments.length} files
              </span>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose onClick={deleteMessage} asChild>
            <Button variant="destructive">Delete</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EditMessageDialog({
  message,
  children,
}: {
  message: MessageData;
  children?: ReactNode;
}) {
  const dispatch = useAppDispatch();

  const { currentChannel } = useServerContext();
  const { accessToken } = useAppSelector((state) => state.auth);

  const [editedMessage, setEditedMessage] = useState(message.content || "");

  const editMessage = async () => {
    if (editedMessage === message.content) return;
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/server/message/edit`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channelId: currentChannel?._id,
            messageId: message._id,
            editedMessage,
          }),
        }
      );
      const data = await response.json();

      if (data.type !== "success") throw new Error(data.message);

      dispatch(
        addNotification({
          title: "Successfully Edited Message",
          type: data.type,
          description: data.message,
        })
      );
    } catch (error) {
      console.error("Error in Editing Message");
      const message =
        error instanceof Error
          ? error.message
          : "Server Error, Try Again Later";

      dispatch(
        addNotification({
          title: "Error in Editing Message",
          description: message,
          type: "error",
        })
      );
    }
  };
  return (
    <Dialog>
      <Tooltip>
        <DialogTrigger asChild>
          {children ? (
            children
          ) : (
            <div>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hidden md:flex"
                >
                  <Pen className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </div>
          )}
        </DialogTrigger>
      </Tooltip>
      <DialogContent>
        <DialogTitle>Edit Message</DialogTitle>
        <DialogDescription>
          Are you sure you want to edit this message?
        </DialogDescription>
        <InputGroup>
          <InputGroupInput
            placeholder="Edit the Message"
            value={editedMessage}
            onChange={(e) => setEditedMessage(e.target.value)}
          />
        </InputGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={editMessage}>Submit</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const serverTypes: { type: ServerType; name: string }[] = [
  {
    type: "private",
    name: "Private Server",
  },
  {
    type: "class",
    name: "Class Server",
  },
  {
    type: "club",
    name: "Club Server",
  },
  {
    type: "college",
    name: "College Server",
  },
  {
    type: "committee",
    name: "Committee Server",
  },

  {
    type: "department",
    name: "Department Server",
  },

  {
    type: "general",
    name: "General Server",
  },

  {
    type: "project",
    name: "Project Server",
  },

  {
    type: "study_group",
    name: "Study Group",
  },
];

export function CreateServerDialog({ children }: { children?: ReactNode }) {
  const profileImageRef = useRef<HTMLInputElement>(null);

  const { user } = useAppSelector((state) => state.auth);
  const { createNewServer, joinServerViaInvite } = useServerContext();

  const [loading, setLoading] = useState(false);
  const [icon, setIcon] = useState<File | null>(null);
  const [step, setStep] = useState<"initial" | "create" | "join">("initial");
  const [serverName, setServerName] = useState(`${user?.name}'s server`);
  const [description, setDescription] = useState("");
  const [serverType, setServerType] = useState<ServerType>("private");
  const [inviteCode, setInviteCode] = useState("");
  const [serverIcon, setServerIcon] = useState("");

  const handleImageUpload = (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    e.preventDefault();
    profileImageRef.current?.click();
  };

  const uploadImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setServerIcon(reader.result as string);
      };
      reader.readAsDataURL(file);
      setIcon(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (step === "create") {
        return await createNewServer(icon, {
          name: serverName,
          description,
          serverType,
        });
      }
      if (step === "join") {
        return await joinServerViaInvite(inviteCode);
      }
    } catch (error) {
      console.error("Error in Creating new Server", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog>
      <Tooltip>
        <DialogTrigger asChild>
          {children ? (
            children
          ) : (
            <div>
              <TooltipTrigger asChild>
                <Button size="icon" className="rounded-2xl">
                  <PlusCircle />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Create A Server</TooltipContent>
            </div>
          )}
        </DialogTrigger>
      </Tooltip>
      <DialogContent>
        <DialogTitle>
          {step === "initial" && "Create Your Server"}
          {step === "create" && "Customize your Server"}
          {step === "join" && "Join a Server"}
        </DialogTitle>
        <DialogDescription>
          {step === "initial" &&
            "Your server is where you and your friends hangout."}
          {step === "create" &&
            "Customize your Server according to your preferences, you can change later"}
          {step === "join" && "Enter an Invite below to join a server"}
        </DialogDescription>
        {step === "initial" && (
          <>
            <Item
              onClick={() => setStep("create")}
              className="cursor-pointer"
              variant="outline"
              size="sm"
            >
              <ItemMedia>
                <BadgeCheckIcon className="size-5" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Create My Own</ItemTitle>
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon className="size-4" />
              </ItemActions>
            </Item>

            <Separator />
            <div className="flex gap-5 flex-col">
              <DialogTitle>Have an Invite Already?</DialogTitle>
              <Button variant="outline" onClick={() => setStep("join")}>
                Join a Server
              </Button>
            </div>
          </>
        )}
        {step === "create" && (
          <>
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    {serverIcon.trim() ? (
                      <img
                        className="rounded-full w-20 h-20"
                        src={serverIcon}
                        alt={serverName}
                      />
                    ) : (
                      <UploadIcon />
                    )}
                  </div>
                  <Input
                    ref={profileImageRef}
                    type="file"
                    onChange={uploadImage}
                    accept="image/*"
                    hidden
                  />
                  <Button
                    onClick={(e) => handleImageUpload(e)}
                    size="icon"
                    className="absolute -bottom-1 -right-1 rounded-full h-8 w-8"
                  >
                    <UploadIcon className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Server Name</Label>
                <Input
                  autoFocus
                  type="text"
                  placeholder={`${user?.name}'s server`}
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                />
                <Label>Server Description</Label>
                <Textarea
                  placeholder="Enter Server Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <Label>Select Type</Label>
                <Select defaultValue="private">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Server Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serverTypes.map((server, index) => (
                      <SelectItem key={index} value={server.type}>
                        {server.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}
        {step === "join" && (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Invite Code</label>
                <Input
                  type="text"
                  placeholder="hTKzmak4"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Invites should look like: hTKzmak4
              </p>
            </div>
          </>
        )}
        {step !== "initial" && (
          <DialogFooter>
            <Button variant="ghost" onClick={() => setStep("initial")}>
              Back
            </Button>
            <Button onClick={handleSubmit}>
              {step === "create" && "Create"}
              {step === "join" && "Join"} Server
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function InviteServerDialog({ children }: { children?: ReactNode }) {
  const dispatch = useAppDispatch();

  const [inviteCode, setInviteCode] = useState<string>("");

  const { accessToken } = useAppSelector((state) => state.auth);
  const { currentServer } = useServerContext();

  const handleChange = async (open: boolean) => {
    try {
      if (!open || inviteCode) return;

      const response = await fetch(
        `${BACKEND_URL}/api/v1/server/create/invite`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ serverId: currentServer?._id }),
        }
      );

      const data = await response.json();

      if (data.type !== "success") throw new Error(data.message);

      setInviteCode(data.inviteCode);
    } catch (error) {
      console.error("Error in Editing Message");
      const message =
        error instanceof Error
          ? error.message
          : "Server Error, Try Again Later";

      dispatch(
        addNotification({
          title: "Error in Editing Message",
          description: message,
          type: "error",
        })
      );
    }
  };

  return (
    <Dialog onOpenChange={handleChange}>
      <Tooltip>
        <DialogTrigger asChild>
          {children ? (
            children
          ) : (
            <div>
              <TooltipTrigger asChild>
                <Button size="icon" className="rounded-2xl">
                  <UserPlus />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Invite to Server</TooltipContent>
            </div>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Invite friends to {currentServer?.name}</DialogTitle>
          <DialogDescription>
            Send a Server Invite Code to A Friend
          </DialogDescription>
          <div className="flex gap-2">
            <Input value={inviteCode} readOnly />
            <Button onClick={() => navigator.clipboard.writeText(inviteCode)}>
              Copy
            </Button>
          </div>
          <Label>Your invite expires in 7 days</Label>
        </DialogContent>
      </Tooltip>
    </Dialog>
  );
}
