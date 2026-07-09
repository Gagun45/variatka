"use client";

import { IPublicRecipe } from "@/lib/types";
import RecipeDetailsSection from "./sections/RecipeDetailsSection";
import RecipeHero from "./hero/RecipeHero";

interface Props {
  recipe: IPublicRecipe;
}

export default function PublicRecipeView({ recipe }: Props) {
  const hasNotes = recipe.notes.trim().length > 0;

  return (
    <article className="bg-background">
      <RecipeHero recipe={recipe} />
      <RecipeDetailsSection recipe={recipe} hasNotes={hasNotes} />
    </article>
  );
}
