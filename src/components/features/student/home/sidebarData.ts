import { AppSidebarProps } from "@/types/sidebar";
import {
  Home,
  ChartBar,
  Library,
  Server,
  Bot,
  Settings,
  HelpCircle,
} from "lucide-react";

export const sidebarData: AppSidebarProps = {
  mainContent: [
    {
      name: "Home",
      url: "",
      icon: Home,
    },
    {
      name: "Attendance",
      url: "#",
      icon: ChartBar,
    },
    {
      name: "Materials",
      url: "#",
      icon: Library,
    },
    {
      name: "JOSH Net",
      url: "",
      icon: Server,
    },
    {
      name: "Josephine",
      url: "",
      icon: Bot,
    },
  ],
  utils: [
    {
      title: "Settings",
      url: "",
      icon: Settings,
    },
    {
      title: "Get Help",
      url: "",
      icon: HelpCircle,
    },
  ],
  userData: {
    name: "Piyush Jain",
    email: "121423408006@josephscollege.ac.in",
    avatar: "https://api.dicebear.com/8.x/big-ears/svg?seed=6olczqw856",
  },
};
