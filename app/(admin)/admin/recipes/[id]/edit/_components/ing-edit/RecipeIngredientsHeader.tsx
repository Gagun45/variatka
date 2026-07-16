import { Badge } from "@/components/ui/badge";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type RecipeIngredientsHeaderProps = {
  selectedCount: number;
  availableCount: number;
  emptyAmountCount: number;
  isDirty: boolean;
};

const RecipeIngredientsHeader = ({
  selectedCount,
  availableCount,
  emptyAmountCount,
  isDirty,
}: RecipeIngredientsHeaderProps) => {
  return (
    <CardHeader className="p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle>Recipe ingredients</CardTitle>
          <CardDescription>
            {selectedCount} selected, {availableCount} available
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {emptyAmountCount > 0 ? (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="size-3" />
              {emptyAmountCount} missing
            </Badge>
          ) : null}

          <Badge variant={isDirty ? "outline" : "secondary"} className="gap-1">
            {isDirty ? (
              <AlertCircle className="size-3" />
            ) : (
              <CheckCircle2 className="size-3" />
            )}
            {isDirty ? "Unsaved" : "Saved"}
          </Badge>
        </div>
      </div>
    </CardHeader>
  );
};

export default RecipeIngredientsHeader;
