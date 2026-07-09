import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type React from "react";

interface Props {
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  iconClassName?: string;
  label: string;
}

export default function IconBadge({ icon: Icon, iconClassName, label }: Props) {
  if (!Icon) {
    return (
      <Badge variant="outline" className="h-7 px-2.5">
        {label}
      </Badge>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="h-7 gap-1.5 px-2.5">
          <Icon className={cn("size-3.5", iconClassName)} />
          {label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
