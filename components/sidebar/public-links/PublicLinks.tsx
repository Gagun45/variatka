import { SidebarGroup, SidebarMenu } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { frontendUrls } from "@/lib/urls";
import SidebarLink from "../link/SidebarLink";

const PublicLinks = () => {
  const { isAuthenticated } = useAuth();
  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarLink
          key={frontendUrls.public.recipes}
          href={frontendUrls.public.recipes}
          label={"Продукція"}
        />
        {isAuthenticated && (
          <SidebarLink
            key={frontendUrls.public.wishlist}
            href={frontendUrls.public.wishlist}
            label={"Обране"}
          />
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default PublicLinks;
