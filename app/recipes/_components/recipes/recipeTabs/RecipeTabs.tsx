"use client";

import { Button } from "@/components/ui/button";
import { IRecipe, IRecipeCategory } from "@/lib/prisma.args";
import { useSearch } from "@/zustand/search";
import { useState } from "react";

import { SortSelect } from "@/components/sort-select/SortSelect";
import { Separator } from "@/components/ui/separator";
import { useRecipesFilter } from "@/hooks/useRecipesFilter";
import { IRecipeSortType, RECIPE_SORT_OPTIONS } from "@/lib/sorting.recipes";
import { useAuthStore } from "@/zustand/auth.store";
import RecipeFormsDialog from "./forms-dialog/RecipeFormsDialog";
import RecipesList from "./recipes-list/RecipesList";
import { StockFilter } from "@/components/stock-filter/StockFilter";
import { IStockType, STOCK_OPTIONS } from "@/lib/constants/stock.options";
import CategoryButton from "@/components/cat-button/CategoryButton";

interface Props {
  categories: IRecipeCategory[];
  recipes: IRecipe[];
}

const RecipeTabs = ({ categories, recipes }: Props) => {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const searchQuery = useSearch((s) => s.query);

  const [activeCategory, setActiveCategory] = useState(categories[0].title);

  const [stockFilter, setStockFilter] = useState<IStockType>("all");

  const [sort, setSort] = useState<IRecipeSortType>("newest");

  const active = categories.find((c) => c.title === activeCategory);

  const filteredRecipes = useRecipesFilter({
    recipes,
    searchQuery,
    categoryId: active?.id,
    stock: stockFilter,
    sort,
  });

  return (
    <div className="flex flex-col gap-4 w-full mx-auto">
      <div className="flex flex-wrap gap-4 justify-center">
        {categories.map((cat) => {
          const isActive = cat.title === activeCategory;
          const totalItems = recipes.filter(
            (r) => r.recipeCategoryId === cat.id,
          ).length;

          return (
            <CategoryButton
              key={cat.id}
              title={`${cat.title} (${totalItems})`}
              isActive={isActive}
              onClick={() => setActiveCategory(cat.title)}
            />
          );
        })}

        {isAdmin && <RecipeFormsDialog />}
      </div>

      <Separator />

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex gap-2">
          <StockFilter
            value={stockFilter}
            onChange={setStockFilter}
            options={STOCK_OPTIONS}
          />
        </div>

        <SortSelect
          value={sort}
          onChange={setSort}
          options={RECIPE_SORT_OPTIONS}
        />
      </div>
      {filteredRecipes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {searchQuery.trim()
            ? `No recipes found for "${searchQuery}"`
            : "Found 0 ingredients"}
        </p>
      ) : (
        <>
          {searchQuery.trim() && (
            <p className="text-sm text-muted-foreground">
              {filteredRecipes.length} recipes include{" "}
              <span className="italic">&quot;{searchQuery}&quot;</span> in title
            </p>
          )}

          <RecipesList recipes={filteredRecipes} />
        </>
      )}
    </div>
  );
};

export default RecipeTabs;
