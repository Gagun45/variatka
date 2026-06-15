"use client";

import NewCategoryDialog from "@/components/new-cat-dialog/NewCategoryDialog";
import { Button } from "@/components/ui/button";
import NewIngredientForm from "@/forms/add-ingredient/NewIngredientForm";
import { ICategory, IIngredient } from "@/lib/prisma.args";
import { useSearch } from "@/prisma/store/search";
import { useState } from "react";
import IngredienstList from "./list/IngredienstList";
import NewIngredientAccordion from "./new-ing-accordion/NewIngredientAccordion";

interface Props {
  categories: ICategory[];
  ingredients: IIngredient[];
}

const DashboardTabs = ({ categories, ingredients }: Props) => {
  const searchQuery = useSearch((s) => s.query);
  const [activeCategory, setActiveCategory] = useState(
    categories[0]?.title ?? "",
  );

  const active = categories.find((c) => c.title === activeCategory);
  const filteredIngredients = ingredients.filter(
    (i) => i.categoryId === active?.id,
  );
  const searchedIngredients = ingredients.filter((ing) =>
    ing.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const isSearching = searchQuery.trim() !== "";
  return (
    <div className="flex flex-col gap-4 w-full mx-auto">
      {isSearching ? (
        <>
          <p>
            {searchedIngredients.length} results include{" "}
            <span className="italic">{searchQuery}</span>
          </p>
          {searchedIngredients.length !== 0 && (
            <IngredienstList ingredients={searchedIngredients} />
          )}
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((cat) => {
              const isActive = cat.title === activeCategory;
              const items = ingredients.filter((i) => i.categoryId === cat.id);
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
            <NewCategoryDialog />
          </div>

          {active && (
            <div className="flex flex-col gap-2">
              <NewIngredientAccordion category={active} />
              <IngredienstList ingredients={filteredIngredients} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardTabs;
