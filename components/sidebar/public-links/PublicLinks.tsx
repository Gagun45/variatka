"use client";

import { useWishlistIds } from "@/features/recipe/hooks/useWishlistIds";
import { SidebarGroup, SidebarMenu } from "@/components/ui/sidebar";
import { PUBLIC_LINKS } from "@/lib/links";
import { frontendUrls } from "@/lib/urls";
import SidebarLink from "../link/SidebarLink";

const PublicLinks = () => {
  const { data: wishlistIds = [] } = useWishlistIds();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {PUBLIC_LINKS.map(({ href, label }) => (
          <SidebarLink
            key={href}
            href={href}
            label={label}
            count={
              href === frontendUrls.public.wishlist
                ? wishlistIds.length
                : undefined
            }
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default PublicLinks;
