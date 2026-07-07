"use client";

import { Button } from "@/components/ui/button";
import { IFilterConfig } from "@/lib/enumslist/types";

interface Props<T extends string> {
  value: T;
  onChange: (value: T) => void;
  config: IFilterConfig<T>;
}

export function AdminCategoryButtons<T extends string>({
  value,
  onChange,
  config,
}: Props<T>) {
  const { options } = config;

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <Button
            className="p-5 text-base font-semibold"
            variant={isSelected ? "default" : "secondary"}
            onClick={() => onChange(opt.value)}
            key={opt.value}
          >
            {opt.label}
          </Button>
        );
      })}
    </div>
  );
}
