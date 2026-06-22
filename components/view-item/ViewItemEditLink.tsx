import Link from "next/link";
import { buttonVariants } from "../ui/button";

interface Props {
  href: string;
  className?: string;
}

const ViewItemEditLink = ({ href, className }: Props) => {
  return (
    <Link
      className={buttonVariants({
        className: `${className} w-full px-8 text-base!`,
      })}
      href={href}
    >
      Edit
    </Link>
  );
};

export default ViewItemEditLink;
