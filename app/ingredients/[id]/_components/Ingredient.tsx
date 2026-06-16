"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useIngredientCategories } from "@/features/ingredient/hooks/useIngredientCategories";
import { useIngredients } from "@/features/ingredient/hooks/useIngredients";
import Link from "next/link";
import IngredientRecipes from "./recipes/IngredientRecipes";
import IngredientView from "./view/IngredientView";
import { frontendUrls } from "@/lib/urls";

interface Props {
  id: number;
}

const Ingredient = ({ id }: Props) => {
  const { data: categories } = useIngredientCategories();
  const { data: ingredients, isLoading, isError } = useIngredients();

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !ingredients || !categories) {
    return (
      <StateScreen
        title="Couldn't load this ingredient"
        description="Please try again in a moment."
      />
    );
  }
  const ingredient = ingredients.find((ing) => ing.id === id);
  if (!ingredient) return <StateScreen title="Ingredient not found" />;
  return (
    <>
      <IngredientView ingredient={ingredient} />
      <Link
        className={buttonVariants({ className: "px-8 text-base!" })}
        href={frontendUrls.ingredients.edit(id)}
      >
        Edit
      </Link>
      <Separator />
      <IngredientRecipes id={id} />
    </>
  );
};

export default Ingredient;
