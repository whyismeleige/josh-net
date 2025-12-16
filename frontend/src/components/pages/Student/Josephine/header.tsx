import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  ChevronDown,
  Delete,
  PanelLeft,
  Pen,
  Share,
  StarIcon,
  Trash,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useJosephineContext } from "@/src/context/josephine.provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function JosephineHeader() {
  const { sidebar, setSidebar } = useJosephineContext();
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
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <span className="flex items-center cursor-pointer gap-1">
              Chat Title <ChevronDown size={20} />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <StarIcon />
              Star
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Pen /> Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Trash /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Button variant="outline">
        <Share />
        Share
      </Button>
    </header>
  );
}
