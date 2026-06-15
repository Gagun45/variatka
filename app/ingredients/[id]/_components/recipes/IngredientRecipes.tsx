"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useRecipesByIngredientId } from "@/features/recipe/hooks/useRecipesByIngredientId";
import Link from "next/link";
import React from "react";

interface Props {
  id: number;
}

const IngredientRecipes = ({ id }: Props) => {
  const { data: recipes, isLoading, isError } = useRecipesByIngredientId(id);
  if (isLoading) return <Loader />;
  if (isError || !recipes) return <StateScreen title="Something went wrong" />;
  return (
    <div className="flex flex-wrap gap-4">
      {recipes.map((r) => (
        <Link href={`/recipes/${r.id}`} key={r.id}>
          {r.title}
        </Link>
      ))}
    </div>
  );
};

export default IngredientRecipes;
