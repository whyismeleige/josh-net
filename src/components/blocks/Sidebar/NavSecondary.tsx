import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { SidebarSecondaryContent } from "@/types/sidebar";
import Link from "next/link";

export default function NavSecondary({
  content,
  label,
}: {
  content: SidebarSecondaryContent[];
  label: string | undefined;
}) {
  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {content.map((item, index: number) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton asChild tooltip={item.name}>
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
