"use client";

import { Button } from "@/components/ui/button";
import { IFilterConfig } from "@/lib/enumslist/types";
import { cn } from "@/lib/utils";

interface Props<T extends string> {
  value: T;
  onChange: (value: T) => void;
  config: IFilterConfig<T>;
  onCategoryReset: () => void;
  isResetActive: boolean;
  resetLabel?: string;
}

export function CategoryNavigation<T extends string>({
  value,
  onChange,
  config,
  onCategoryReset,
  isResetActive,
  resetLabel = "Уся продукція",
}: Props<T>) {
  return (
    <section className="mb-4" aria-label="Категорії продукції">
      <nav
        aria-label="Оберіть категорію"
        className="grid grid-cols-2 gap-1.5 rounded-xl border bg-card/70 p-1.5 shadow-surface sm:grid-cols-4"
      >
        <Button
          type="button"
          variant={isResetActive ? "default" : "ghost"}
          onClick={onCategoryReset}
          aria-pressed={isResetActive}
          className="h-10 rounded-lg px-3 text-sm sm:h-11 sm:text-base"
        >
          {resetLabel}
        </Button>

        {config.options.map((option) => {
          const isActive = value === option.value;

          return (
            <Button
              key={option.value}
              type="button"
              variant={isActive ? "default" : "ghost"}
              onClick={() => onChange(option.value)}
              aria-pressed={isActive}
              className="h-10 rounded-lg px-3 text-sm sm:h-11 sm:text-base"
            >
              {option.label}
            </Button>
          );
        })}
      </nav>
    </section>
  );
}
