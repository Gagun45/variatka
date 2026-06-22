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
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import SuggestionsList from "./list/SuggestionsList";

const SearchBar = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const query = useSearch((s) => s.query);
  const setQuery = useSearch((s) => s.setQuery);
  const recentQueries = useSearch((s) => s.recentQueries);
  const addRecentQuery = useSearch((s) => s.addRecentQuery);

  const [debouncedQuery] = useDebounce(query, 300);
  const [open, setOpen] = useState(false);

  const initialized = useRef(false);

  const { data: ingredients = [] } = useIngredients();
  const { data: recipes = [] } = useRecipes();
  const { data: stuff = [] } = useStuff();

  // init from URL once
  useEffect(() => {
    if (initialized.current) return;

    setQuery(searchParams.get("search") ?? "");
    initialized.current = true;
  }, [searchParams, setQuery]);

  // sync Zustand -> URL (debounced)
  useEffect(() => {
    if (!initialized.current) return;

    const params = new URLSearchParams();

    if (debouncedQuery.trim()) {
      params.set("search", debouncedQuery);
    }

    const qs = params.toString();

    router.replace(qs ? `${pathname}?${qs}` : pathname, {
      scroll: false,
    });
  }, [debouncedQuery, pathname, router]);

  // suggestions

  const q = query.toLowerCase();

  const ingredientItems: ISearchBarItem[] = ingredients
    .filter((i) => i.title.toLowerCase().includes(q))
    .slice(0, 5)
    .map((item) => ({
      type: "ingredient",
      id: item.id,
      title: item.title,
    }));

  const recipeItems: ISearchBarItem[] = recipes
    .filter((i) => i.title.toLowerCase().includes(q))
    .slice(0, 5)
    .map((item) => ({
      type: "recipe",
      id: item.id,
      title: item.title,
    }));

  const stuffItems: ISearchBarItem[] = stuff
    .filter((i) => i.title.toLowerCase().includes(q))
    .slice(0, 5)
    .map((item) => ({
      type: "stuff",
      id: item.id,
      title: item.title,
    }));

  const totalItemsLength =
    recentQueries.length +
    stuffItems.length +
    recipeItems.length +
    ingredientItems.length;
  const itemsNotFound = totalItemsLength === 0;

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

      {/* interleaveOpenFocus={false} prevents focus from jumping into the popover,
        keeping the cursor active inside your Input.
      */}
      <PopoverContent
        className="p-3 space-y-4 w-(--radix-popover-trigger-width)"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {itemsNotFound && <p>No matching items</p>}
        <SuggestionsList
          items={recentQueries}
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
