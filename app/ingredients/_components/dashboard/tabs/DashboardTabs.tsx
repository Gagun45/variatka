"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ICategory, IIngredient } from "@/lib/prisma.args";
import NewIngredientForm from "@/forms/add-ingredient/NewIngredientForm";
import IngredienstList from "./list/IngredienstList";

interface Props {
  categories: ICategory[];
  ingredients: IIngredient[];
}

const DashboardTabs = ({ categories, ingredients }: Props) => {
  const [activeCategory, setActiveCategory] = useState(categories[0].name);
  const active = categories.find((c) => c.name === activeCategory);
  const filteredIngredients = ingredients.filter(
    (i) => i.categoryId === active?.id,
  );
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-wrap gap-4 justify-center">
        {categories.map((cat) => {
          const isActive = cat.name === activeCategory;
          const totalIngredients = ingredients.filter(
            (i) => i.categoryId === cat.id,
          );
          const totalIngredientsLength = totalIngredients.length;
          return (
            <Button
              key={cat.id}
              variant={isActive ? "default" : "outline"}
              onClick={() => setActiveCategory(cat.name)}
              className="min-w-36 text-xl h-12"
            >
              {cat.name} ({totalIngredientsLength})
            </Button>
          );
        })}{" "}
      </div>
      {active && (
        <div className="flex flex-col gap-2">
          <NewIngredientForm category={active} />
          <IngredienstList ingredients={filteredIngredients} />
        </div>
      )}
    </div>
  );
};

export default DashboardTabs;
