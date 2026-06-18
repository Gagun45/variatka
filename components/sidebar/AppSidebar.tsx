"use client";

import {
  Sidebar,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ADMIN_LINKS, PUBLIC_LINKS } from "@/lib/links";
import ThemeToggle from "../theme-toggle/ThemeToggle";
import SidebarLink from "./link/SidebarLink";
import Auth from "../auth/Auth";
import { useAuthStore } from "@/zustand/auth.store";
import { frontendUrls } from "@/lib/urls";

export function AppSidebar() {
  const isAdmin = useAuthStore((s) => s.isAdmin);
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
        <SidebarMenu className="space-y-2">
          {PUBLIC_LINKS.map(({ href, label }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton asChild>
                <SidebarLink href={href} label={label} />
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <SidebarLink href={frontendUrls.stuff.index} label={"Stuff"} />
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroup>
      {isAdmin && (
        <SidebarGroup className="mt-8">
          <SidebarMenu className="space-y-2">
            {ADMIN_LINKS.map(({ href, label }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton asChild>
                  <SidebarLink href={href} label={label} />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      )}
      <SidebarFooter className="mt-auto pb-4">
        <div className="flex justify-center gap-4">
          <ThemeToggle />
          <Auth />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
