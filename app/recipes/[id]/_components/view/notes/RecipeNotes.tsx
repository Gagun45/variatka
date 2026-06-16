interface Props {
  notes: string;
}

const RecipeNotes = ({ notes }: Props) => {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-muted-foreground">Notes</h3>

      <p className="text-sm text-muted-foreground leading-relaxed">{notes}</p>
    </div>
  );
};

export default RecipeNotes;
