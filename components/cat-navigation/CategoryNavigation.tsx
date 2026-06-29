"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IFilterConfig } from "@/lib/enumslist/types";

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
    <div className="mb-10 w-full max-w-4xl mx-auto px-4">
      <nav className="flex justify-center gap-8 flex-wrap">
        {config.options.map((option) => {
          const isActive = value === option.value;

          return (
            <Button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              variant="outline"
              className={cn(
                "relative size-32 md:w-32 rounded-2xl p-0 overflow-hidden transition-all duration-300",
                "hover:scale-[1.02]",
                isActive &&
                  "border-primary ring-2 ring-primary/30 scale-[1.03]",
              )}
            >
              <Image
                src={option.logo ?? "/default-poster.png"}
                alt={option.label}
                fill
                className={cn(
                  "object-cover transition-all duration-300",
                  isActive ? "brightness-110" : "hover:opacity-100",
                )}
              />

              {/* subtle overlay for readability / active state */}
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
