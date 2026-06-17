import { ILink } from "@/lib/links";
import { useSidebar } from "@/components/ui/sidebar";
import Link from "next/link";

const SidebarLink = ({
  href,
  label,
  className,
}: ILink & { className?: string }) => {
  const { setOpenMobile, openMobile } = useSidebar();
  const handleClick = () => {
    if (openMobile) setOpenMobile(false);
  };
  return (
    <Link
      className={`${className} text-base! tracking-widest`}
      onClick={handleClick}
      href={href}
    >
      {label}
    </Link>
  );
};

export default SidebarLink;
