"use client";

import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ILink } from "@/lib/links";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SidebarLink = ({ href, label }: ILink) => {
  const { setOpenMobile, openMobile } = useSidebar();
  const pathname = usePathname();

  const isActive = href !== "/" && pathname === href;

  const handleClick = () => {
    if (openMobile) setOpenMobile(false);
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link
          href={href}
          onClick={handleClick}
          className="tracking-widest transition-all text-base!"
        >
          {label}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default SidebarLink;
