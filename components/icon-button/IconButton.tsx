import { Button } from "@/components/ui/button";
import type { ComponentProps } from "react";

type IconButtonProps = Omit<
  ComponentProps<typeof Button>,
  "aria-label" | "title"
> & {
  label: string;
  title?: string;
};

const IconButton = ({ label, title, ...props }: IconButtonProps) => {
  return <Button {...props} aria-label={label} title={title ?? label} />;
};

export default IconButton;
