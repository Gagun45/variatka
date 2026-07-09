interface Props {
  title: string;
  description: string;
}

export default function SectionHeader({ title, description }: Props) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
