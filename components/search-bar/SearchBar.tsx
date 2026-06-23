"use client";

import { useMemo, useState } from "react";

import { useIngredients } from "@/features/ingredient/hooks/useIngredients";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";
import { useStuff } from "@/features/stuff/hooks/useStuff";
import { IIngredient, IRecipe, IStuff } from "@/lib/prisma.args";
import {
  ISearchBarItem,
  ISearchBarItemType,
  useSearch,
} from "@/zustand/search.store";

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SearchGroup } from "./group/SearchGroup";

const SearchBar = () => {
  const recentQueries = useSearch((s) => s.recentQueries);
  const addRecentQuery = useSearch((s) => s.addRecentQuery);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { data: ingredients = [] } = useIngredients();
  const { data: recipes = [] } = useRecipes();
  const { data: stuff = [] } = useStuff();

  const queryLowerCase = query.toLowerCase();

  const filterItems = (
    items: (IIngredient | IRecipe | IStuff)[],
    type: ISearchBarItemType,
  ): ISearchBarItem[] =>
    items
      .filter((i) => i.title.toLowerCase().includes(queryLowerCase))
      .slice(0, 5)
      .map((i) => ({
        id: i.id,
        title: i.title,
        type,
      }));

  const ingredientItems = useMemo(
    () => filterItems(ingredients, "ingredient"),
    [ingredients, queryLowerCase],
  );

  const recipeItems = useMemo(
    () => filterItems(recipes, "recipe"),
    [recipes, queryLowerCase],
  );

  const stuffItems = useMemo(
    () => filterItems(stuff, "stuff"),
    [stuff, queryLowerCase],
  );

  const recentSuggestions = useMemo(
    () =>
      recentQueries.filter((i) =>
        i.title.toLowerCase().includes(queryLowerCase),
      ),
    [recentQueries, queryLowerCase],
  );

  const onSelect = (item: ISearchBarItem) => {
    addRecentQuery(item);
    setOpen(false);
  };

  const groups: { heading: string; items: ISearchBarItem[] }[] = [
    { heading: "Recent", items: recentSuggestions },
    { heading: "Ingredients", items: ingredientItems },
    { heading: "Recipes", items: recipeItems },
    { heading: "Stuff", items: stuffItems },
  ];

  const activeGroups = groups.filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto w-full max-w-md">
      <Command shouldFilter={false} className="overflow-visible bg-transparent">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="w-full">
              <CommandInput
                placeholder="Search..."
                value={query}
                onValueChange={(value) => {
                  setQuery(value);
                  setOpen(
                    value.trim().length > 0 &&
                      activeGroups.some((g) => g.items.length > 0),
                  );
                }}
              />
            </div>
          </PopoverTrigger>

          <PopoverContent
            align="start"
            className="mt-1 w-(--radix-popover-trigger-width) p-0"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <CommandList>
              <CommandEmpty>No matching items found</CommandEmpty>

              {activeGroups.map((group, index) => (
                <div key={group.heading}>
                  <SearchGroup
                    heading={group.heading}
                    items={group.items}
                    onSelect={onSelect}
                  />

                  {index < activeGroups.length - 1 && <CommandSeparator />}
                </div>
              ))}
            </CommandList>
          </PopoverContent>
        </Popover>
      </Command>
    </div>
  );
};

export default SearchBar;
