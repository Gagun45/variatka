"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { PUBLIC_LINKS } from "@/lib/links";
import { frontendUrls } from "@/lib/urls";
import { useAuthStore } from "@/zustand/auth.store";
import Auth from "../auth/Auth";
import ThemeToggle from "../theme-toggle/ThemeToggle";
import SidebarLink from "./link/SidebarLink";
import SavedLinks from "./saved-links/SavedLinks";

export function AppSidebar() {
  const isAdmin = useAuthStore((s) => s.isAdmin);

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="h-24 p-0 flex items-center border-b justify-center">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem className="flex justify-center">
              <SidebarLink
                href={"/"}
                label="Nomly"
                className="text-4xl! tracking-widest"
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="border-b">
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
                  <SidebarLink
                    href={frontendUrls.stuff.index}
                    label={"Stuff"}
                  />
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
        {isAdmin && <SavedLinks />}
        {isAdmin && (
          <SidebarGroup className="mt-auto">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <SidebarLink href={frontendUrls.admin} label={"Admin"} />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="mt-auto py-4 border-t">
        <div className="flex justify-evenly gap-4">
          <ThemeToggle />
          <Auth />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
