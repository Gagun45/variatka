interface Props {
  title: string;
}

export default function IngredientItem({ title }: Props) {
  return (
    <div className="flex min-h-14 items-center gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/50">
      <span className="size-2.5 shrink-0 rounded-full bg-muted-foreground/40" />
      <span className="min-w-0 text-sm font-medium leading-snug">
        {title}
      </span>
    </div>
  );
}
