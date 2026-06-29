"use client";

import { Button } from "@/components/ui/button";
import { IFilterConfig } from "@/lib/enumslist/types";

interface Props<T extends string> {
  value: T;
  onChange: (value: T) => void;
  config: IFilterConfig<T>;
  variant?: "bigger";
}

export function FilterButtons<T extends string>({
  value,
  onChange,
  config,
  variant,
}: Props<T>) {
  const { label, options } = config;
  let styles = "";
  let iconStyles = "";
  switch (variant) {
    case "bigger":
      styles = "text-lg p-6 font-bold";
      iconStyles = "size-5";
      break;
    default:
  }
  return (
    <div className="space-y-1.5">
      {label && (
        <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
          {label}
        </span>
      )}
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = value === opt.value;

          return (
            <Button
              key={opt.value}
              size="sm"
              variant={isSelected ? "default" : "outline"}
              onClick={() => onChange(opt.value)}
              className={`
    h-8 px-3 text-xs font-medium gap-1.5 transition-all rounded-md
    ${
      !isSelected
        ? "text-neutral-600 bg-neutral-50/50 hover:bg-neutral-100 dark:text-neutral-400 dark:bg-transparent"
        : ""
    }
    ${styles}
  `}
            >
              {Icon && (
                <Icon
                  className={`size-3.5 shrink-0 transition-transform ${opt.iconClassName} 
              ${isSelected ? "text-current" : ""} ${iconStyles}`}
                />
              )}
              {opt.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
