"use client";

import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIngredients } from "@/features/ingredient/hooks/useIngredients";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";
import { useStuff } from "@/features/stuff/hooks/useStuff";
import {
  ISearchBarItem,
  ISearchBarItemType,
  useSearch,
} from "@/zustand/search.store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import SuggestionsList from "./list/SuggestionsList";
import { IIngredient, IRecipe, IStuff } from "@/lib/prisma.args";

const SearchBar = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const recentQueries = useSearch((s) => s.recentQueries);
  const addRecentQuery = useSearch((s) => s.addRecentQuery);

  const [open, setOpen] = useState(false);

  const { data: ingredients = [] } = useIngredients();
  const { data: recipes = [] } = useRecipes();
  const { data: stuff = [] } = useStuff();

  // -----------------------------
  // URL is the single source of truth
  // -----------------------------

  const query = searchParams.get("search") ?? "";
  const queryLowerCase = query.toLowerCase();

  const filterItems = (
    items: (IIngredient | IRecipe | IStuff)[],
    type: ISearchBarItemType,
  ): ISearchBarItem[] =>
    items
      .filter((i) => i.title.toLowerCase().includes(queryLowerCase))
      .slice(0, 5)
      .map((i) => ({ id: i.id, title: i.title, type }));

  // -----------------------------
  // update URL
  // -----------------------------
  const setQuery = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value.trim()) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    router.replace(params.toString() ? `${pathname}?${params}` : pathname, {
      scroll: false,
    });
  };

  // -----------------------------
  // suggestions
  // -----------------------------

  const ingredientItems = filterItems(ingredients, "ingredient");
  const recipeItems = filterItems(recipes, "recipe");
  const stuffItems = filterItems(stuff, "stuff");
  const recentSuggestions = recentQueries.filter((i) =>
    i.title.toLowerCase().includes(queryLowerCase),
  );

  const totalItemsLength =
    recentSuggestions.length +
    ingredientItems.length +
    recipeItems.length +
    stuffItems.length;

  const itemsNotFound = totalItemsLength === 0;

  // -----------------------------
  // select handler
  // -----------------------------
  const onSelect = (item: ISearchBarItem) => {
    addRecentQuery(item);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          value={query}
          type="search"
          placeholder="Search..."
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
        />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="p-3 space-y-4 w-(--radix-popover-trigger-width)"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {itemsNotFound && query.trim() && (
          <p className="text-muted-foreground text-sm py-2">
            No matching items found
          </p>
        )}

        <SuggestionsList
          items={recentSuggestions}
          title="Recent"
          onSelect={onSelect}
        />

        <SuggestionsList
          items={ingredientItems}
          title="Ingredients"
          onSelect={onSelect}
        />

        <SuggestionsList
          items={recipeItems}
          title="Recipes"
          onSelect={onSelect}
        />

        <SuggestionsList items={stuffItems} title="Stuff" onSelect={onSelect} />
      </PopoverContent>
    </Popover>
  );
};

export default SearchBar;
