import { SidebarGroup, SidebarMenu } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { frontendUrls } from "@/lib/urls";
import SidebarLink from "../link/SidebarLink";

const PublicLinks = () => {
  const { isAuthenticated } = useAuth();
  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarLink href={frontendUrls.public.recipes} label={"Продукція"} />
        {isAuthenticated && (
          <>
            <SidebarLink href={frontendUrls.public.wishlist} label={"Обране"} />
            <SidebarLink
              href={frontendUrls.public.orders}
              label={"Замовлення"}
            />
          </>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default PublicLinks;
