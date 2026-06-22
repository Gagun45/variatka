"use client";

import { Separator } from "@/components/ui/separator";
import { IIngredient, IIngredientCategory } from "@/lib/prisma.args";
import {
  IIngredientSortType,
  INGREDIENT_SORT_OPTIONS,
} from "@/lib/sorting.ingredients";
import { useAuthStore } from "@/zustand/auth.store";
import { useSearch } from "@/zustand/search.store";
import { useState } from "react";

import CategoryButton from "@/components/cat-button/CategoryButton";
import { SortSelect } from "@/components/sort-select/SortSelect";
import { FilterButtons } from "@/components/stock-filter/StockFilter";
import { useIngredientsFilter } from "@/hooks/useIngredientsFilter";
import { IStockType, STOCK_OPTIONS } from "@/lib/constants/stock.options";
import IngredientFormsDialog from "./forms-dialog/IngredientFormsDialog";
import IngredienstList from "./list/IngredienstList";

interface Props {
  categories: IIngredientCategory[];
  ingredients: IIngredient[];
}

const IngredientsTabs = ({ categories, ingredients }: Props) => {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const searchQuery = useSearch((s) => s.query);

  const [activeCategory, setActiveCategory] = useState(categories[0].title);

  const [stockFilter, setStockFilter] = useState<IStockType>("all");

  const [sort, setSort] = useState<IIngredientSortType>("usage-desc");

  const active = categories.find((c) => c.title === activeCategory);

  const filteredIngredients = useIngredientsFilter({
    ingredients,
    searchQuery: searchQuery.trim(),
    sort,
    stock: stockFilter,
    categoryId: active?.id,
  });

  return (
    <div className="flex flex-col gap-4 w-full mx-auto">
      <div className="flex flex-wrap gap-4 justify-center">
        {categories.map((cat) => {
          const isActive = cat.title === activeCategory;
          const totalItems = ingredients.filter(
            (i) => i.categoryId === cat.id,
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

        {isAdmin && (
          <IngredientFormsDialog
            activeCategoryId={active?.id}
            categories={categories}
          />
        )}
      </div>
      <Separator />
      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-wrap gap-2">
          <FilterButtons
            value={stockFilter}
            onChange={setStockFilter}
            options={STOCK_OPTIONS}
          />
        </div>
        <SortSelect
          value={sort}
          onChange={setSort}
          options={INGREDIENT_SORT_OPTIONS}
        />
      </div>
      {filteredIngredients.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {searchQuery.trim()
            ? `No ingredients found for "${searchQuery}"`
            : "Found 0 ingredients"}
        </p>
      ) : (
        <>
          {searchQuery.trim() && (
            <p className="text-sm text-muted-foreground">
              {filteredIngredients.length} ingredients include{" "}
              <span className="italic">&quot;{searchQuery}&quot;</span> in title
            </p>
          )}

          <IngredienstList ingredients={filteredIngredients} />
        </>
      )}
    </div>
  );
};

export default IngredientsTabs;
