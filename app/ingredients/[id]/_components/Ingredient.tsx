"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { Separator } from "@/components/ui/separator";
import { useIngredient } from "@/features/ingredient/hooks/useIngredient";
import { useIngredientCategories } from "@/features/ingredient/hooks/useIngredientCategories";
import Link from "next/link";
import IngredientRecipes from "./recipes/IngredientRecipes";
import IngredientView from "./view/IngredientView";
import { buttonVariants } from "@/components/ui/button";

interface Props {
  id: number;
}

const Ingredient = ({ id }: Props) => {
  const { data: categories } = useIngredientCategories();
  const { data: ingredient, isLoading, isError } = useIngredient(id);

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !ingredient || !categories) {
    return (
      <StateScreen
        title="Couldn't load this ingredient"
        description="Please try again in a moment."
      />
    );
  }
  return (
    <>
      <IngredientView ingredient={ingredient} />
      <Link
        className={buttonVariants({ className: "px-8 text-base!" })}
        href={`/ingredients/${id}/edit`}
      >
        Edit
      </Link>
      <Separator />
      <IngredientRecipes id={id} />
    </>
  );
};

export default Ingredient;
