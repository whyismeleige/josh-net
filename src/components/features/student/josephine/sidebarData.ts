import { AppSidebarProps } from "@/types/sidebar";
import { FolderOpenDot, MessageCircle, MessageCirclePlus } from "lucide-react";

export const sidebarData: AppSidebarProps = {
  mainContent: [
    {
      name: "New Chat",
      url: "",
      icon: MessageCirclePlus,
    },
    {
      name: "Chats",
      url: "",
      icon: MessageCircle,
    },
    {
      name: "Project",
      url: "",
      icon: FolderOpenDot,
    },
  ],
  secondaryContentLabel: "Recents",
  userData: {
    name: "Piyush Jain",
    email: "121423408006@josephscollege.ac.in",
    avatar: "https://api.dicebear.com/8.x/big-ears/svg?seed=6olczqw856",
  },
};
