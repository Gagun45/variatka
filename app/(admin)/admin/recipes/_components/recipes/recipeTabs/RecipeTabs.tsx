"use client";

import { IRecipe, IRecipeCategory } from "@/lib/prisma.args";
import { useState } from "react";

import CategoryButton from "@/components/cat-button/CategoryButton";
import { SortSelect } from "@/components/sort-select/SortSelect";
import { FilterButtons } from "@/components/stock-filter/StockFilter";
import { Separator } from "@/components/ui/separator";
import { useRecipesFilter } from "@/hooks/useRecipesFilter";
import {
  CONFIRMED_OPTIONS,
  IConfirmedType,
} from "@/lib/constants/confirmed.optionts";
import {
  IReadyToMakeType,
  READY_TO_MAKE_OPTIONS,
} from "@/lib/constants/ready-to-make.options";
import { IStockType, STOCK_OPTIONS } from "@/lib/constants/stock.options";
import { IRecipeSortType, RECIPE_SORT_OPTIONS } from "@/lib/sorting.recipes";
import { useSearchParams } from "next/navigation";
import RecipeFormsDialog from "./forms-dialog/RecipeFormsDialog";
import RecipesList from "./recipes-list/RecipesList";
import {
  IRecipeSeriesFilter,
  RECIPE_SERIES_OPTIONS,
} from "@/lib/constants/series.options";

type CategoryFilter = "all" | number;

interface Props {
  categories: IRecipeCategory[];
  recipes: IRecipe[];
}

const RecipeTabs = ({ categories, recipes }: Props) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") ?? "";

  // ✅ category is now id-based + supports "all"
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

  const [stockFilter, setStockFilter] = useState<IStockType>("all");
  const [readyFilter, setReadyFilter] = useState<IReadyToMakeType>("all");
  const [confirmedFilter, setConfirmedFilter] = useState<IConfirmedType>("all");
  const [series, setSeries] = useState<IRecipeSeriesFilter>("all");

  const [sort, setSort] = useState<IRecipeSortType>("newest");

  const filteredRecipes = useRecipesFilter({
    recipes,
    searchQuery,
    categoryId: activeCategory,
    stock: stockFilter,
    sort,
    readyToMake: readyFilter,
    confirmed: confirmedFilter,
    series,
  });

  return (
    <div className="flex flex-col gap-4 w-full mx-auto">
      {/* CATEGORY ROW */}
      <div className="flex flex-wrap gap-4 justify-center">
        {[{ id: "all" as const, title: "All" }, ...categories].map((cat) => {
          const isActive = cat.id === activeCategory;

          const totalItems =
            cat.id === "all"
              ? recipes.length
              : recipes.filter((r) => r.recipeCategoryId === cat.id).length;

          return (
            <CategoryButton
              key={cat.id}
              title={`${cat.title} (${totalItems})`}
              isActive={isActive}
              onClick={() => setActiveCategory(cat.id)}
            />
          );
        })}

        <RecipeFormsDialog />
      </div>

      <Separator />

      {/* FILTERS */}
      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2">
          <FilterButtons
            value={stockFilter}
            onChange={setStockFilter}
            options={STOCK_OPTIONS}
          />

          <FilterButtons
            value={readyFilter}
            onChange={setReadyFilter}
            options={READY_TO_MAKE_OPTIONS}
          />

          <FilterButtons
            value={series}
            onChange={setSeries}
            options={RECIPE_SERIES_OPTIONS}
          />

          <FilterButtons
            value={confirmedFilter}
            onChange={setConfirmedFilter}
            options={CONFIRMED_OPTIONS}
          />
        </div>

        <div className="mt-auto ml-auto">
          <SortSelect
            value={sort}
            onChange={setSort}
            options={RECIPE_SORT_OPTIONS}
          />
        </div>
      </div>

      {/* RESULTS */}
      {filteredRecipes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {searchQuery.trim()
            ? `No recipes found for "${searchQuery}"`
            : "Found 0 recipes"}
        </p>
      ) : (
        <>
          {searchQuery.trim() && (
            <p className="text-sm text-muted-foreground">
              {filteredRecipes.length} recipes include{" "}
              <span className="italic">&quot;{searchQuery}&quot;</span>
            </p>
          )}

          <RecipesList recipes={filteredRecipes} />
        </>
      )}
    </div>
  );
};

export default RecipeTabs;
