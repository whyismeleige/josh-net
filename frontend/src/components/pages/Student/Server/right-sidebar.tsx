import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useServerContext } from "@/src/context/server.provider";

export default function RightSidebar() {
  const { currentServer } = useServerContext();
  return (
    <>
      {currentServer?.users.map((user) => (
        <div key={user._id} className="flex items-center gap-1 p-2">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user?.avatarURL} alt={user?.name} />
            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user?.name}</span>
          </div>
        </div>
      ))}
    </>
  );
}
