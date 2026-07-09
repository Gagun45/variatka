import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { RotateCcw, Save } from "lucide-react";

type RecipeIngredientsActionsProps = {
  canSave: boolean;
  isDirty: boolean;
  isPending: boolean;
  onReset: () => void;
  onSave: () => void;
};

const RecipeIngredientsActions = ({
  canSave,
  isDirty,
  isPending,
  onReset,
  onSave,
}: RecipeIngredientsActionsProps) => {
  return (
    <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
      <Button
        disabled={isPending || !isDirty}
        variant="outline"
        onClick={onReset}
        className="w-full sm:w-auto"
      >
        <RotateCcw className="size-4" />
        Reset
      </Button>

      <LoadingButton
        disabled={!canSave}
        onClick={onSave}
        isPending={isPending}
        className="w-full sm:w-auto"
      >
        <Save className="size-4" />
        Save ingredients
      </LoadingButton>
    </CardFooter>
  );
};

export default RecipeIngredientsActions;
