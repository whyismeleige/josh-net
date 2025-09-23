import { SidebarBranding } from "@/types/sidebar";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { IconInnerShadowTop } from "@tabler/icons-react";

export default function NavHeader({ data }: { data: SidebarBranding }) {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            className="data-[slot=sidebar-menu-button]:!p-1.5"
          >
            <Link href={data.href ? data.href : "#"}>
              {data.icon ? (
                <data.icon className="!size-5" />
              ) : (
                <IconInnerShadowTop className="!size-5" />
              )}
              <span className="text-base font-semibold">{data.name}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
