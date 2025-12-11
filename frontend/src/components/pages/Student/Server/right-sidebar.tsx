import { useServerContext } from "@/src/context/server.provider";
import { useStudentContext } from "@/src/context/student.provider";
import { Tv } from "lucide-react";

export default function RightSidebar() {
    const { channelData } = useServerContext();
  return (
    <>
      {channelData.map((channel) => (
        <a
          href="#"
          key={channel._id}
          className="flex gap-2 border-b p-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <Tv size={20} />
          {channel.name}
        </a>
      ))}
    </>
  );
}
