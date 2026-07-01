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
  const isBigger = variant === "bigger";

  return (
    <div className="space-y-2">
      {label && (
        <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block ml-0.5">
          {label}
        </span>
      )}

      <div
        className={`
  grid gap-2 w-full grid-cols-1
`}
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = value === opt.value;

          return (
            <Button
              key={opt.value}
              // Dynamically adjust button size variant
              size={isBigger ? "default" : "sm"}
              variant={isSelected ? "default" : "secondary"}
              onClick={() => onChange(opt.value)}
              className={`
                relative font-medium gap-2 transition-all duration-200 active:scale-95 select-none rounded-lg border
                ${
                  isBigger
                    ? "h-11 px-5 text-sm sm:text-base font-semibold shadow-sm"
                    : "h-9 px-3.5 text-xs shadow-xs"
                }

              `}
            >
              {Icon && (
                <Icon
                  className={`
                    shrink-0 transition-all duration-200
                    ${isBigger ? "size-5" : "size-4"}
                    ${opt.iconClassName || ""} 
                    ${isSelected ? "brightness-125 dark:brightness-90 scale-105" : "opacity-80"} 
                  `}
                />
              )}
              <span className="truncate text-left w-full">{opt.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
