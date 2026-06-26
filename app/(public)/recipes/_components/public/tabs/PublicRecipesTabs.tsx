"use client";

import { IRecipeCategory } from "@/lib/prisma.args";
import { useState } from "react";

import CategoryButton from "@/components/cat-button/CategoryButton";
import { SortSelect } from "@/components/sort-select/SortSelect";
import { FilterButtons } from "@/components/stock-filter/StockFilter";
import { Separator } from "@/components/ui/separator";
import { usePublicRecipesFilter } from "@/hooks/usePublicRecipesFilter";
import { IStockType, STOCK_OPTIONS } from "@/lib/constants/stock.options";
import {
  IPublicRecipeSortType,
  PUBLIC_RECIPE_SORT_OPTIONS,
} from "@/lib/public.sorting.recipes";
import { IPublicRecipe } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import PublicRecipesList from "../list/PublicRecipesList";

interface Props {
  categories: IRecipeCategory[];
  recipes: IPublicRecipe[];
}

const PublicRecipesTabs = ({ categories, recipes }: Props) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") ?? "";

  const [activeCategory, setActiveCategory] = useState(categories[0].title);

  const [stockFilter, setStockFilter] = useState<IStockType>("all");

  const [sort, setSort] = useState<IPublicRecipeSortType>("name-asc");

  const active = categories.find((c) => c.title === activeCategory);

  const filteredRecipes = usePublicRecipesFilter({
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
            (r) => r.recipeCategory.id === cat.id,
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
      </div>

      <Separator />

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <FilterButtons
              value={stockFilter}
              onChange={setStockFilter}
              options={STOCK_OPTIONS}
            />
          </div>
        </div>
        <div className="mt-auto ml-auto">
          <SortSelect
            value={sort}
            onChange={setSort}
            options={PUBLIC_RECIPE_SORT_OPTIONS}
          />
        </div>
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

          <PublicRecipesList recipes={filteredRecipes} />
        </>
      )}
    </div>
  );
};

export default PublicRecipesTabs;
