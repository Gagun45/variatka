import { SidebarGroup, SidebarMenu } from "@/components/ui/sidebar";
import { PUBLIC_LINKS } from "@/lib/links";
import SidebarLink from "../link/SidebarLink";

const PublicLinks = () => {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {PUBLIC_LINKS.map(({ href, label }) => (
          <SidebarLink key={href} href={href} label={label} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default PublicLinks;
