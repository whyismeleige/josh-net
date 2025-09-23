import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { IconInnerShadowTop } from "@tabler/icons-react";
import {
  Bot,
  ChartBar,
  HelpCircle,
  Home,
  Library,
  Server,
  Settings,
} from "lucide-react";
import NavMain from "./NavMain";
import Link from "next/link";
import NavSecondary from "./NavSecondary";
import NavUser from "./NavUser";
import { AppSidebarProps } from "@/types/sidebar";
import NavUtils from "./NavUtils";
import NavHeader from "./NavHeader";

export default function AppSidebar({
  mainContent,
  secondaryContent,
  userData,
  branding = {
    name: "JOSH Net",
  },
  utils,
  mainContentLabel,
  secondaryContentLabel,
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <NavHeader data={branding} />
      <SidebarContent>
        {mainContent && (
          <NavMain content={mainContent} label={mainContentLabel} />
        )}
        {(secondaryContent || secondaryContentLabel) && (
          <NavSecondary
            content={secondaryContent || []}
            label={secondaryContentLabel}
          />
        )}
        {utils && <NavUtils utils={utils} className="mt-auto" />}
      </SidebarContent>
      <SidebarFooter>{userData && <NavUser data={userData} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
