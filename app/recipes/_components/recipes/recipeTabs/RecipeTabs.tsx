"use client";

import { Button } from "@/components/ui/button";
import { IRecipe, IRecipeCategory } from "@/lib/prisma.args";
import { useSearch } from "@/zustand/search";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/zustand/auth.store";
import RecipesList from "./accordion/RecipesList";
import NewRecipeDialog from "./new-recipe-form-dialog/NewRecipeDialog";

interface Props {
  categories: IRecipeCategory[];
  recipes: IRecipe[];
}

type SortType = "name-asc" | "name-desc" | "created-desc" | "created-asc";

const RecipeTabs = ({ categories, recipes }: Props) => {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const searchQuery = useSearch((s) => s.query);
  const [activeCategory, setActiveCategory] = useState(categories[0].title);

  const [sort, setSort] = useState<SortType>("created-desc");

  const sorters = {
    "name-asc": (a: IRecipe, b: IRecipe) => a.title.localeCompare(b.title),

    "name-desc": (a: IRecipe, b: IRecipe) => b.title.localeCompare(a.title),

    "created-desc": (a: IRecipe, b: IRecipe) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),

    "created-asc": (a: IRecipe, b: IRecipe) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  } satisfies Record<SortType, (a: IRecipe, b: IRecipe) => number>;

  const applySorting = (list: IRecipe[]) => {
    return [...list].sort(sorters[sort]);
  };

  const active = categories.find((c) => c.title === activeCategory);
  const filteredRecipes = applySorting(
    recipes.filter((i) => i.recipeCategoryId === active?.id),
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
            <RecipesList recipes={searchedRecipes} />
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
            {isAdmin && <NewRecipeDialog />}
          </div>
          <Separator />
          {active && (
            <>
              <div className="flex justify-end">
                <Select
                  value={sort}
                  onValueChange={(v) => setSort(v as SortType)}
                >
                  <SelectTrigger className="w-45">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="created-desc">New to old</SelectItem>
                    <SelectItem value="created-asc">Old to new</SelectItem>
                    <SelectItem value="name-asc">A-Z</SelectItem>
                    <SelectItem value="name-desc">Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <RecipesList recipes={filteredRecipes} />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default RecipeTabs;
