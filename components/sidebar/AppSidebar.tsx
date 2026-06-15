"use client";

import { LINKS } from "@/lib/links";
import {
  Sidebar,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import SidebarLink from "./link/SidebarLink";

export function AppSidebar() {
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="h-24 p-0 flex items-center justify-center">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem className="flex justify-center">
              <SidebarLink
                href={"/"}
                label="Ahrrrr"
                className="text-4xl! tracking-widest"
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarHeader>

      <SidebarGroup>
        <SidebarMenu>
          {LINKS.map(({ href, label }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton asChild>
                <SidebarLink href={href} label={label} />
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </Sidebar>
  );
}
