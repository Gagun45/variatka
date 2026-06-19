"use client";

import { Button } from "@/components/ui/button";
import { IOption } from "@/lib/types";

interface Props<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: IOption<T>[];
}

export function FilterButtons<T extends string>({
  value,
  onChange,
  options,
}: Props<T>) {
  return (
    <>
      {options.map((opt) => (
        <Button
          key={opt.value}
          variant={value === opt.value ? "default" : "outline"}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </>
  );
}
