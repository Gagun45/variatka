import { SidebarGroup, SidebarMenu } from "@/components/ui/sidebar";
import { frontendUrls } from "@/lib/urls";
import SidebarLink from "../link/SidebarLink";
import { useAuthStore } from "@/zustand/auth.store";

const PublicLinks = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarLink
          key={frontendUrls.public.recipes}
          href={frontendUrls.public.recipes}
          label={"Рецепти"}
        />
        {isAuthenticated && (
          <SidebarLink
            key={frontendUrls.public.wishlist}
            href={frontendUrls.public.wishlist}
            label={"Wishlist"}
          />
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default PublicLinks;
