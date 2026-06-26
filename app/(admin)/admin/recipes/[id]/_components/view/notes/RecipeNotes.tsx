import ConfirmToggleButton from "@/components/confirmation-btn/ConfirmToggleButton";
import { Separator } from "@/components/ui/separator";
import { useToggleConfirmedRecipe } from "@/features/recipe/hooks/useToggleConfirmedRecipe";
import { IRecipe } from "@/lib/prisma.args";

interface Props {
  recipe: IRecipe;
}

const RecipeNotes = ({ recipe }: Props) => {
  const { confirmationNotes, notes, isConfirmed, id } = recipe;
  const { mutate } = useToggleConfirmedRecipe();
  const onToggleConfirm = () => {
    mutate(id);
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 whitespace-pre-wrap">
        <p className="text-sm font-bold">Notes</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{notes}</p>
      </div>
      <Separator />
      <div className="flex flex-col gap-2 whitespace-pre-wrap">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold">Confirmation notes</p>

          <ConfirmToggleButton
            isConfirmed={isConfirmed}
            onToggle={onToggleConfirm}
          />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {confirmationNotes}
        </p>
      </div>
    </div>
  );
};

export default RecipeNotes;
