import { LucideIcon } from "lucide-react";
import { ComponentType } from "react";

export interface SidebarMainContent {
  name: string;
  url: string;
  icon: LucideIcon;
}

export interface SidebarSecondaryContent {
  name: string;
  url: string;
  icon?: LucideIcon;
}

export interface SidebarUtils {
  title: string;
  url: string;
  icon: LucideIcon;
}

export interface SidebarUserData {
  name: string;
  email: string;
  avatar: string;
}

export interface SidebarBranding {
  name: string;
  icon?: LucideIcon;
  href?: string;
}

export interface AppSidebarProps {
  mainContent?: SidebarMainContent[];
  secondaryContent?: SidebarSecondaryContent[];
  userData?: SidebarUserData;
  branding?: SidebarBranding;
  utils?: SidebarUtils[];
  mainContentLabel?: string;
  secondaryContentLabel?: string;
}
