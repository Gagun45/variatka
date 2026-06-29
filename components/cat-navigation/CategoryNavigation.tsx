"use client";

import { cn } from "@/lib/utils";
import { IFilterConfig } from "@/lib/enumslist/types";
import { Button } from "@/components/ui/button";

interface Props<T extends string> {
  value: T;
  onChange: (value: T) => void;
  config: IFilterConfig<T>;
}

export function CategoryNavigation<T extends string>({
  value,
  onChange,
  config,
}: Props<T>) {
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-2">
      {config.options.map((option) => {
        const Icon = option.icon;

        return (
          <Button
            key={option.value}
            variant={value === option.value ? "default" : "outline"}
            size="lg"
            onClick={() => onChange(option.value)}
            className={cn(
              "h-12 rounded-xl px-5 transition-all",
              value === option.value && "shadow-sm",
            )}
          >
            {Icon && (
              <Icon size={18} className={cn("mr-2", option.iconClassName)} />
            )}

            {option.label}
          </Button>
        );
      })}
    </nav>
  );
}
