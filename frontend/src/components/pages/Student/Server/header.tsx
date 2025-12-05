import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Bookmark, Hash, Pin, Search, User2, Users } from "lucide-react";

export default function ServerHeader() {
  return (
    <header className="flex shrink-0 items-center justify-between border-b gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <span className="flex">
        <Hash /> playground{" "}
      </span>
      <div className="flex items-center">
        <Button  variant="ghost" size="icon-lg">
          <Bell />
        </Button>
        <Button  variant="ghost" size="icon-lg">
          <Pin />
        </Button>
        <Button variant="ghost" size="icon-lg">
          <Users />
        </Button>
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
          />
          <Input
            id="text"
            className="pl-10 h-1.5/2"
            placeholder="Search"
          />
        </div>
        <Button variant="ghost" size="icon-lg">
          <Bookmark/>
        </Button>
      </div>
    </header>
  );
}
