import { Accordion } from "@/components/ui/accordion";
import { IRecipe } from "@/lib/prisma.args";
import { useSearch } from "@/prisma/store/search";
import React from "react";
import RecipeCard from "./recipe/RecipeCard";

interface Props {
  recipes: IRecipe[];
}

const RecipesAccordion = ({ recipes }: Props) => {
  return (
    <Accordion type="multiple" className="w-full space-y-2">
      {recipes.map((rec) => (
        <RecipeCard key={rec.id} recipe={rec} />
      ))}
    </Accordion>
  );
};

export default RecipesAccordion;
