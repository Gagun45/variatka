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
import { ISearchBarItem, useSearch } from "@/zustand/search.store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import SuggestionsList from "./list/SuggestionsList";

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
  const [debouncedQuery] = useDebounce(query, 300);

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
  const q = debouncedQuery.toLowerCase();

  const recentSuggestions: ISearchBarItem[] = useMemo(
    () =>
      recentQueries
        .filter((i) => i.title.toLowerCase().includes(q))
        .slice(0, 5)
        .map((i) => ({
          type: i.type,
          id: i.id,
          title: i.title,
        })),
    [recentQueries, q],
  );

  const ingredientItems: ISearchBarItem[] = useMemo(
    () =>
      ingredients
        .filter((i) => i.title.toLowerCase().includes(q))
        .slice(0, 5)
        .map((i) => ({
          type: "ingredient",
          id: i.id,
          title: i.title,
        })),
    [ingredients, q],
  );

  const recipeItems: ISearchBarItem[] = useMemo(
    () =>
      recipes
        .filter((r) => r.title.toLowerCase().includes(q))
        .slice(0, 5)
        .map((r) => ({
          type: "recipe",
          id: r.id,
          title: r.title,
        })),
    [recipes, q],
  );

  const stuffItems: ISearchBarItem[] = useMemo(
    () =>
      stuff
        .filter((s) => s.title.toLowerCase().includes(q))
        .slice(0, 5)
        .map((s) => ({
          type: "stuff",
          id: s.id,
          title: s.title,
        })),
    [stuff, q],
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

  // -----------------------------
  // derived input value
  // -----------------------------
  const inputValue = query;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          value={inputValue}
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
