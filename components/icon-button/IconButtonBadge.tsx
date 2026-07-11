import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";

const IconButtonBadge = ({ children }: { children: ReactNode }) => (
  <Badge className="absolute -right-1.5 -top-1.5 h-4 min-w-4 rounded-full border-2 border-sidebar bg-primary px-1 text-[10px] leading-none text-primary-foreground shadow-sm">
    {children}
  </Badge>
);

export default IconButtonBadge;
