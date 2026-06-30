"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IFilterConfig } from "@/lib/enumslist/types";
import { X } from "lucide-react";

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
    <div className="mb-10 w-full max-w-4xl mx-auto px-4">
      <p className="text-sm text-muted-foreground text-center pb-4">
        Перегляд за категоріями
      </p>
      <nav className="flex flex-wrap justify-center gap-8">
        {config.options.map((option) => {
          const isActive = value === option.value;

          return (
            <div key={option.value} className="relative">
              <Button
                type="button"
                onClick={() => onChange(option.value)}
                variant="outline"
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
                    isActive ? "brightness-110" : "hover:opacity-100",
                  )}
                />

                <span
                  className={cn(
                    "absolute inset-0 transition-colors",
                    isActive ? "bg-primary/10" : "bg-black/10 hover:bg-black/5",
                  )}
                />
              </Button>

              {isActive && (
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  onClick={onCategoryReset}
                  className="absolute right-1 top-1 rounded-full shadow-md"
                  aria-label="Скинути категорію"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
