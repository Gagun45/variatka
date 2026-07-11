"use client";

import {
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ILink } from "@/lib/links";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = ILink & {
  count?: number;
};

const SidebarLink = ({ href, label, count }: Props) => {
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
      {count !== undefined && count > 0 && (
        <SidebarMenuBadge className="bg-primary text-primary-foreground">
          {count}
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
};

export default SidebarLink;
