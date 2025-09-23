import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidebarMainContent } from "@/types/sidebar";
import Link from "next/link";

export default function NavMain({
  content,
  label,
}: {
  content: SidebarMainContent[];
  label: string | undefined;
}) {
  return (
    <SidebarGroup className="group-data">
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {content.map((item, index: number) => (
          <SidebarMenuItem key={index}>
            <SidebarMenuButton asChild tooltip={item.name}>
              <Link href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
