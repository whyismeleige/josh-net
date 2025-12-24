import { Button } from "@/src/ui/button";
import { ChevronDown, PanelLeft } from "lucide-react";
import { Separator } from "@/src/ui/separator";
import { useJosephineContext } from "@/src/context/josephine.provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/ui/dropdown-menu";
import {
  ChangeTitleDialog,
  DeleteDialog,
  ShareDialog,
  StarToggle,
} from "./dialogs";

export default function JosephineHeader() {
  const { sidebar, setSidebar, currentChat, access } = useJosephineContext();
  return (
    <header className="flex shrink-0 items-center justify-between border-b gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex items-center justify-between m-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => setSidebar(!sidebar)}
        >
          <PanelLeft />
        </Button>
        {currentChat && (
          <>
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <span className="flex items-center cursor-pointer gap-1">
                  {currentChat?.title || "New Chat"}{" "}
                  {access === "private" && <ChevronDown size={20} />}
                </span>
              </DropdownMenuTrigger>
              {access === "private" && (
                <DropdownMenuContent className="flex flex-col">
                  <DropdownMenuItem asChild>
                    <StarToggle chat={currentChat} />
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <ChangeTitleDialog chat={currentChat} />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <DeleteDialog chatId={currentChat._id} />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          </>
        )}
      </div>
      {access === "private" && currentChat && <ShareDialog chat={currentChat} />}
    </header>
  );
}
