import { IPublicRecipe } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NotebookText } from "lucide-react";
import ContentBlock from "../shared/ContentBlock";
import IngredientItem from "../shared/IngredientItem";

interface Props {
  recipe: IPublicRecipe;
  hasNotes: boolean;
}

export default function RecipeDetailsSection({ recipe, hasNotes }: Props) {
  const { ingredients, notes } = recipe;

  return (
    <section
      className={cn(
        "mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10",
        hasNotes && "lg:grid-cols-[minmax(0,1fr)_22rem]",
      )}
    >
      <ContentBlock
        title={`Ingredients (${ingredients.length})`}
        description="Everything inside this recipe."
      >
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {ingredients.map((ingredient) => (
            <IngredientItem
              key={ingredient.id}
              title={ingredient.title}
            />
          ))}
        </div>
      </ContentBlock>

      {hasNotes && (
        <div className="space-y-6">
          <ContentBlock
            title="Notes"
            description="Extra context from the kitchen."
            icon={NotebookText}
          >
            <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
              {notes.trim()}
            </p>
          </ContentBlock>
        </div>
      )}
    </section>
  );
}
