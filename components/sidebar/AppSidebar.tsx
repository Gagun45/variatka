"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { getImageUrl } from "@/lib/image.helper";
import { MAIN_LINKS } from "@/lib/links";
import { frontendUrls } from "@/lib/urls";
import Image from "next/image";
import Link from "next/link";
import AuthSidebar from "../auth/AuthSidebar";
import ThemeToggle from "../theme-toggle/ThemeToggle";
import SidebarLink from "./link/SidebarLink";
import PublicLinks from "./public-links/PublicLinks";
import SavedLinks from "./saved-links/SavedLinks";

export function AppSidebar() {
  const { isAdmin } = useAuth();

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="h-app-header p-0 flex items-center border-b justify-center">
        <Link
          href={frontendUrls.index}
          className="flex justify-center gap-2 size-full items-center text-4xl"
        >
          <div className="p-1 h-full aspect-square">
            <div className="size-full relative">
              <Image
                src={getImageUrl()}
                alt="Logo"
                sizes="256px"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <span>Nomly</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <PublicLinks />
        {isAdmin && (
          <>
            <SidebarGroup>
              <SidebarMenu>
                {MAIN_LINKS.map(({ href, label }) => (
                  <SidebarLink key={href} href={href} label={label} />
                ))}
              </SidebarMenu>
            </SidebarGroup>
            <SavedLinks />
          </>
        )}
      </SidebarContent>
      <SidebarFooter className="mt-auto py-4 border-t">
        <div className="flex justify-evenly gap-4">
          <ThemeToggle />
          <AuthSidebar />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
