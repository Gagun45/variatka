"use client";

import { Button } from "@/components/ui/button";

type Option<T extends string> = {
  value: T;
  label: string;
};

interface Props<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
}

export function StockFilter<T extends string>({
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
