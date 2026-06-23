"use client";

import { IRecipe, IRecipeCategory } from "@/lib/prisma.args";
import { useState } from "react";

import CategoryButton from "@/components/cat-button/CategoryButton";
import { SortSelect } from "@/components/sort-select/SortSelect";
import { FilterButtons } from "@/components/stock-filter/StockFilter";
import { Separator } from "@/components/ui/separator";
import { useRecipesFilter } from "@/hooks/useRecipesFilter";
import {
  IReadyToMakeType,
  READY_TO_MAKE_OPTIONS,
} from "@/lib/constants/ready-to-make.options";
import { IStockType, STOCK_OPTIONS } from "@/lib/constants/stock.options";
import { IRecipeSortType, RECIPE_SORT_OPTIONS } from "@/lib/sorting.recipes";
import { useAuthStore } from "@/zustand/auth.store";
import { useSearchParams } from "next/navigation";
import RecipeFormsDialog from "./forms-dialog/RecipeFormsDialog";
import RecipesList from "./recipes-list/RecipesList";
import {
  CONFIRMED_OPTIONS,
  IConfirmedType,
} from "@/lib/constants/confirmed.optionts";

interface Props {
  categories: IRecipeCategory[];
  recipes: IRecipe[];
}

const RecipeTabs = ({ categories, recipes }: Props) => {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") ?? "";

  const [activeCategory, setActiveCategory] = useState(categories[0].title);

  const [stockFilter, setStockFilter] = useState<IStockType>("all");
  const [readyFilter, setReadyFilter] = useState<IReadyToMakeType>("all");
  const [confirmedFilter, setConfirmedFilter] = useState<IConfirmedType>("all");

  const [sort, setSort] = useState<IRecipeSortType>("newest");

  const active = categories.find((c) => c.title === activeCategory);

  const filteredRecipes = useRecipesFilter({
    recipes,
    searchQuery,
    categoryId: active?.id,
    stock: stockFilter,
    sort,
    readyToMake: readyFilter,
    confirmed: confirmedFilter,
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
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <FilterButtons
              value={stockFilter}
              onChange={setStockFilter}
              options={STOCK_OPTIONS}
            />
          </div>
          <div className="flex gap-2">
            <FilterButtons
              value={readyFilter}
              onChange={setReadyFilter}
              options={READY_TO_MAKE_OPTIONS}
            />
          </div>
          <div className="flex gap-2">
            <FilterButtons
              value={confirmedFilter}
              onChange={setConfirmedFilter}
              options={CONFIRMED_OPTIONS}
            />
          </div>
        </div>
        <div className="mt-auto ml-auto">
          <SortSelect
            value={sort}
            onChange={setSort}
            options={RECIPE_SORT_OPTIONS}
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

          <RecipesList recipes={filteredRecipes} />
        </>
      )}
    </div>
  );
};

export default RecipeTabs;
