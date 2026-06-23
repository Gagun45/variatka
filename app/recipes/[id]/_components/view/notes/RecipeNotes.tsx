import { Separator } from "@/components/ui/separator";
import { IRecipe } from "@/lib/prisma.args";

interface Props {
  recipe: IRecipe;
}

const RecipeNotes = ({ recipe }: Props) => {
  const { confirmationNotes, notes } = recipe;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 whitespace-pre-wrap">
        <p className="text-sm font-bold">Notes</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{notes}</p>
      </div>
      <Separator />
      <div className="flex flex-col gap-2 whitespace-pre-wrap">
        <p className="text-sm font-bold">Confirmation notes</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {confirmationNotes}
        </p>
      </div>
    </div>
  );
};

export default RecipeNotes;
