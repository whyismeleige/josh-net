import { Avatar, AvatarFallback, AvatarImage } from "@/src/ui/avatar";
import { useServerContext } from "@/src/context/server.provider";
import { Fragment, useState } from "react";
import { Button } from "@/src/ui/button";
import { PanelLeft, Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/ui/input-group";

export default function RightSidebar() {
  const { currentServer, rightSidebar, setRightSidebar } = useServerContext();
  const [userId, setUserId] = useState<string | null>(null);

  return (
    <>
      {rightSidebar && (
        <div
          onClick={() => setRightSidebar(!rightSidebar)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
        />
      )}
      <div
        className={`border-l w-fit h-full transition-all bg-sidebar duration-300 ease-in-out fixed right-0 md:relative z-50 md:z-auto
    ${
      rightSidebar
        ? "max-w-100 opacity-100"
        : "max-w-0 opacity-0 overflow-hidden"
    }`}
      >
        <div className="w-fit p-2">
          <div className="flex items-center">
            <Button
              className="md:hidden p-1 hover:bg-sidebar-accent rounded-md transition-colors size-7"
              variant="ghost"
              onClick={() => setRightSidebar(!rightSidebar)}
              size="icon"
            >
              <PanelLeft />
            </Button>
            <span className="font-semibold text-sm px-3 py-2 block">
              Users:
            </span>
            <InputGroup>
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput placeholder="Search Users"/>
            </InputGroup>
          </div>
          {currentServer?.users.map((user) => (
            <Fragment key={user._id}>
              <div
                onMouseEnter={() => setUserId(user._id)}
                onMouseLeave={() => setUserId(null)}
                className="relative group"
              >
                {/* Main user item */}
                <div className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted-foreground cursor-pointer">
                  <Avatar className="h-10 w-10 rounded-lg ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                    <AvatarImage src={user?.avatarURL} alt={user?.name} />
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Hover state / Expanded details - Positioned on TOP */}
                {userId === user._id && (
                  <div className="absolute left-0 top-0 -translate-y-1/2 -translate-x-full mb-1 p-4 bg-card border rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 min-w-[250px]">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 rounded-lg">
                        <AvatarImage src={user?.avatarURL} alt={user?.name} />
                        <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                          {user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-1">
                        <h4 className="font-semibold text-sm">{user?.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {user?.email}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground capitalize">
                            {user?.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
