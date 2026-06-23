import ConfirmToggleButton from "@/components/confirmation-btn/ConfirmToggleButton";
import { Separator } from "@/components/ui/separator";
import { IRecipe } from "@/lib/prisma.args";

interface Props {
  recipe: IRecipe;
}

const RecipeNotes = ({ recipe }: Props) => {
  const { confirmationNotes, notes } = recipe;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-muted-foreground">Notes</p>

      <p className="text-sm text-muted-foreground leading-relaxed">{notes}</p>
    </div>
  );
};

export default RecipeNotes;
