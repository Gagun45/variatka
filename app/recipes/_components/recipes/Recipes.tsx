"use client";

import { IRecipe } from "@/lib/prisma.args";
import RecipeCard from "./recipe/RecipeCard";
import { useSearch } from "@/prisma/store/search";
import { Accordion } from "@/components/ui/accordion";

interface Props {
  recipes: IRecipe[];
}

const Recipes = ({ recipes }: Props) => {
  const searchQuery = useSearch((s) => s.query);
  const searchedRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (searchQuery && searchedRecipes.length === 0)
    return (
      <p>
        {searchedRecipes.length} recipes include{" "}
        <span className="italic">{searchQuery}</span> in title
      </p>
    );
  return (
    <Accordion type="multiple" className="w-full space-y-2">
      {searchedRecipes.map((rec) => (
        <RecipeCard key={rec.id} recipe={rec} />
      ))}
    </Accordion>
  );
};

export default Recipes;
