"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IFilterConfig } from "@/lib/enumslist/types";

interface Props<T extends string> {
  value: T;
  onChange: (value: T) => void;
  config: IFilterConfig<T>;
  onCategoryReset: () => void;
}

export function CategoryNavigation<T extends string>({
  value,
  onChange,
  config,
  onCategoryReset,
}: Props<T>) {
  return (
    <div className="mx-auto mb-10 w-full max-w-4xl px-4">
      <p className="pb-4 text-center text-sm text-muted-foreground">
        Перегляд за категоріями
      </p>

      <nav className="flex flex-wrap justify-center gap-8">
        {config.options.map((option) => {
          const isActive = value === option.value;

          return (
            <Button
              key={option.value}
              type="button"
              variant="outline"
              onClick={() =>
                isActive ? onCategoryReset() : onChange(option.value)
              }
              aria-label={option.label}
              title={option.label}
              className={cn(
                "relative size-36 overflow-hidden rounded-2xl p-0 transition-all duration-300",
                "hover:scale-[1.02]",
                isActive && "scale-[1.03] border-primary ring-4 ring-primary",
              )}
            >
              <Image
                src={option.logo ?? "/default-poster.png"}
                alt={option.label}
                fill
                sizes="144px"
                className={cn(
                  "object-contain transition-all duration-300",
                  isActive ? "brightness-110" : "hover:brightness-105",
                )}
              />

              <span
                className={cn(
                  "absolute inset-0 transition-colors",
                  isActive ? "bg-primary/10" : "bg-black/10 hover:bg-black/5",
                )}
              />
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
