import { SidebarInset } from "@/components/ui/sidebar";
import AppHeader from "@/components/blocks/Header";

export default function SiteMain() {
  return (
    <SidebarInset className="rounded-xs">
      <AppHeader title="Home" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1"></div>
      </div>
    </SidebarInset>
  );
}
