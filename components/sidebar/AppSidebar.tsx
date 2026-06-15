"use client";

import { LINKS } from "@/lib/links";
import {
  Sidebar,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import SidebarLink from "./link/SidebarLink";
import ThemeToggle from "../theme-toggle/ThemeToggle";

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
      <SidebarFooter className="mt-auto pb-4">
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
