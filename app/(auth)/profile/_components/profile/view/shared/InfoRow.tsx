import { ComponentType } from "react";

interface Props {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
  fallback?: string;
}

export default function InfoRow({
  icon: Icon,
  label,
  value,
  fallback = "-",
}: Props) {
  const displayValue = value?.trim() ? value : fallback;
  const isFallback = displayValue === fallback;

  return (
    <div className="grid gap-2 p-4 sm:grid-cols-[minmax(10rem,0.75fr)_1fr] sm:items-center">
      <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </dt>
      <dd
        className={`break-words font-medium sm:text-right ${isFallback ? "font-normal italic text-muted-foreground/70" : "text-foreground"}`}
      >
        {displayValue}
      </dd>
    </div>
  );
}
