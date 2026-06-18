"use client";

import { Button } from "@/components/ui/button";
import { IIngredient, IIngredientCategory } from "@/lib/prisma.args";
import { useSearch } from "@/zustand/search";
import { useState } from "react";
import IngredienstList from "./list/IngredienstList";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/zustand/auth.store";
import IngredientFormsDialog from "./forms-dialog/IngredientFormsDialog";

interface Props {
  categories: IIngredientCategory[];
  ingredients: IIngredient[];
}

type SortType = "name-asc" | "name-desc" | "usage-desc" | "usage-asc";

const IngredientsTabs = ({ categories, ingredients }: Props) => {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const searchQuery = useSearch((s) => s.query);
  const [activeCategory, setActiveCategory] = useState(categories[0].title);

  const [stockFilter, setStockFilter] = useState<"all" | "in" | "out">("all");
  const [sort, setSort] = useState<SortType>("usage-desc");

  const sorters = {
    "name-asc": (a: IIngredient, b: IIngredient) =>
      a.title.localeCompare(b.title),

    "name-desc": (a: IIngredient, b: IIngredient) =>
      b.title.localeCompare(a.title),

    "usage-desc": (a: IIngredient, b: IIngredient) =>
      (b._count?.recipeIngredients ?? 0) - (a._count?.recipeIngredients ?? 0),
    "usage-asc": (a: IIngredient, b: IIngredient) =>
      (a._count?.recipeIngredients ?? 0) - (b._count?.recipeIngredients ?? 0),
  } satisfies Record<SortType, (a: IIngredient, b: IIngredient) => number>;

  const applySorting = (list: IIngredient[]) => {
    return [...list].sort(sorters[sort]);
  };

  const applyStockFilter = (list: IIngredient[]) => {
    if (stockFilter === "in") return list.filter((i) => i.isInStock);
    if (stockFilter === "out") return list.filter((i) => !i.isInStock);
    return list;
  };

  const active = categories.find((c) => c.title === activeCategory);
  const filteredIngredients = applySorting(
    applyStockFilter(ingredients.filter((i) => i.categoryId === active?.id)),
  );

  const searchedIngredients = applySorting(
    ingredients.filter((ing) =>
      ing.title.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );
  const isSearching = searchQuery.trim() !== "";
  return (
    <div className="flex flex-col gap-4 w-full mx-auto">
      {isSearching ? (
        <>
          <p>
            {searchedIngredients.length} ingredients include{" "}
            <span className="italic">{searchQuery}</span> in title
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
            {isAdmin && <IngredientFormsDialog categories={categories} />}
          </div>
          <Separator />
          {active && (
            <>
              <div className="flex justify-between flex-wrap gap-4">
                <div className="flex gap-2 justify-center">
                  <Button
                    variant={stockFilter === "all" ? "default" : "outline"}
                    onClick={() => setStockFilter("all")}
                  >
                    All
                  </Button>

                  <Button
                    variant={stockFilter === "in" ? "default" : "outline"}
                    onClick={() => setStockFilter("in")}
                  >
                    In stock
                  </Button>

                  <Button
                    variant={stockFilter === "out" ? "default" : "outline"}
                    onClick={() => setStockFilter("out")}
                  >
                    Out of stock
                  </Button>
                </div>
                <div>
                  <Select
                    value={sort}
                    onValueChange={(v) => setSort(v as SortType)}
                  >
                    <SelectTrigger className="w-45">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="usage-desc">Most used</SelectItem>
                      <SelectItem value="usage-asc">Least used</SelectItem>
                      <SelectItem value="name-asc">A-Z</SelectItem>
                      <SelectItem value="name-desc">Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredIngredients.length === 0 ? (
                <p>Found 0 ingredients</p>
              ) : (
                <IngredienstList ingredients={filteredIngredients} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default IngredientsTabs;
