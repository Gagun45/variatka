"use client";

import { IRecipe } from "@/lib/prisma.args";
import RecipeCard from "./recipe/RecipeCard";
import { useSearch } from "@/prisma/store/search";

interface Props {
  recipes: IRecipe[];
}

const Recipes = ({ recipes }: Props) => {
  const searchQuery = useSearch((s) => s.query);
  const searchedRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  if (searchQuery && searchedRecipes.length === 0)
    return <p>No recipes found</p>;
  return (
    <div className="flex flex-col gap-4">
      {searchedRecipes.map((rec) => (
        <RecipeCard key={rec.id} recipe={rec} />
      ))}
    </div>
  );
};

export default Recipes;
