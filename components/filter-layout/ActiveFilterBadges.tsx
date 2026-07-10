// @/components/filter-layout/ActiveFilterBadges.tsx
"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComponentType } from "react";

export interface IActiveBadge {
  id: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  iconClassName?: string;
  onClear: () => void;
}

interface ActiveFilterBadgesProps {
  badges: IActiveBadge[];
  onClearAll: () => void;
}

export const ActiveFilterBadges = ({
  badges,
  onClearAll,
}: ActiveFilterBadgesProps) => {
  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-1">
      {badges.map((badge) => {
        const Icon = badge.icon;

        return (
          <Button
            key={badge.id}
            size="sm"
            variant="default" // Emulates the isSelected styling engine
            onClick={badge.onClear}
            className="
              relative font-medium gap-2 transition-all duration-200 active:scale-95 select-none rounded-lg border
              h-9 px-3.5 text-xs shadow-xs
              border-transparent bg-foreground text-background shadow-md shadow-foreground/10
              group
            "
          >
            {Icon && (
              <Icon
                className={`
                  shrink-0 transition-all duration-200 size-4
                  brightness-125 dark:brightness-90 scale-105
                  ${badge.iconClassName || ""}
                `}
              />
            )}

            <span className="max-w-filter-badge truncate">{badge.label}</span>

            {/* Clear indicator micro-icon built inside style system */}
            <X className="size-3 shrink-0 ml-0.5 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
          </Button>
        );
      })}

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-9 rounded-lg px-3.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        Очистити все
      </Button>
    </div>
  );
};
