"use client";

import { Button } from "@/components/ui/button";
import { IIngredient, IIngredientCategory } from "@/lib/prisma.args";
import { useSearch } from "@/prisma/store/search";
import { useState } from "react";
import FormsDialog from "./forms-dialog/FormsDialog";
import IngredienstList from "./list/IngredienstList";
import { Separator } from "@/components/ui/separator";

interface Props {
  categories: IIngredientCategory[];
  ingredients: IIngredient[];
}

const DashboardTabs = ({ categories, ingredients }: Props) => {
  const searchQuery = useSearch((s) => s.query);
  const [activeCategory, setActiveCategory] = useState(categories[0].title);

  const [stockFilter, setStockFilter] = useState<"all" | "in" | "out">("all");

  const applyStockFilter = (list: IIngredient[]) => {
    if (stockFilter === "in") return list.filter((i) => i.isInStock);
    if (stockFilter === "out") return list.filter((i) => !i.isInStock);
    return list;
  };

  const active = categories.find((c) => c.title === activeCategory);
  const filteredIngredients = applyStockFilter(
    ingredients.filter((i) => i.categoryId === active?.id),
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
            <FormsDialog categories={categories} />
          </div>
          <Separator />
          {active && (
            <>
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
              <IngredienstList ingredients={filteredIngredients} />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardTabs;
