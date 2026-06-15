"use client";

import { Button } from "@/components/ui/button";
import { IRecipe, IRecipeCategory } from "@/lib/prisma.args";
import { useSearch } from "@/prisma/store/search";
import { useState } from "react";

import { Separator } from "@/components/ui/separator";
import NewRecipeCategoryForm from "@/forms/add-recipe-category/NewRecipeCategoryForm";
import RecipesAccordion from "../accordion/RecipesAccordion";

interface Props {
  categories: IRecipeCategory[];
  recipes: IRecipe[];
}

const RecipeTasb = ({ categories, recipes }: Props) => {
  const searchQuery = useSearch((s) => s.query);
  const [activeCategory, setActiveCategory] = useState(categories[0].title);

  const active = categories.find((c) => c.title === activeCategory);
  const filteredRecipes = recipes.filter(
    (i) => i.recipeCategoryId === active?.id,
  );
  const searchedRecipes = recipes.filter((ing) =>
    ing.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const isSearching = searchQuery.trim() !== "";
  return (
    <div className="flex flex-col gap-4 w-full mx-auto">
      {isSearching ? (
        <>
          <p>
            {searchedRecipes.length} ingredients include{" "}
            <span className="italic">{searchQuery}</span> in title
          </p>
          {searchedRecipes.length !== 0 && (
            <RecipesAccordion recipes={searchedRecipes} />
          )}
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((cat) => {
              const isActive = cat.title === activeCategory;
              const items = recipes.filter(
                (i) => i.recipeCategoryId === cat.id,
              );
              const totalItems = items.length;

              return (
                <Button
                  key={cat.id}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setActiveCategory(cat.title)}
                  className="min-w-36 text-xl h-12"
                >
                  {cat.title} ({totalItems})
                </Button>
              );
            })}
            <NewRecipeCategoryForm />
          </div>
          <Separator />
          {active && <RecipesAccordion recipes={filteredRecipes} />}
        </>
      )}
    </div>
  );
};

export default RecipeTasb;
