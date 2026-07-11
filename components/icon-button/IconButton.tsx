import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";
import IconButtonBadge from "./IconButtonBadge";

type IconButtonProps = Omit<
  ComponentProps<typeof Button>,
  "aria-label" | "title"
> & {
  label: string;
  title?: string;
  badge?: ReactNode;
};

const IconButton = ({ label, title, badge, className, children, ...props }: IconButtonProps) => {
  return (
    <Button
      {...props}
      className={cn(badge !== undefined && "relative", className)}
      aria-label={label}
      title={title ?? label}
    >
      {children}
      {badge !== undefined && (
        <IconButtonBadge>
          {badge}
        </IconButtonBadge>
      )}
    </Button>
  );
};

export default IconButton;
