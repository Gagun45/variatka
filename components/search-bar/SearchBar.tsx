"use client";

import { Input } from "@/components/ui/input";
import { useIngredients } from "@/features/ingredient/hooks/useIngredients";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";
import { useSearch } from "@/zustand/search";
import { useMemo, useState } from "react";
import { Button, buttonVariants } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { frontendUrls } from "@/lib/urls";
import Link from "next/link";

const SearchBar = () => {
  const query = useSearch((s) => s.query);
  const setQuery = useSearch((s) => s.setQuery);
  const { data: ingredients = [] } = useIngredients();
  const { data: recipes = [] } = useRecipes();

  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    const q = query.toLowerCase();

    return [
      ...ingredients
        .filter((i) => i.title.toLowerCase().includes(q))
        .sort((a, b) => a.title.localeCompare(b.title))
        .slice(0, 5)
        .map((i) => ({
          id: i.id,
          title: i.title,
          type: "ingredient",
        })),

      ...recipes
        .filter((r) => r.title.toLowerCase().includes(q))
        .sort((a, b) => a.title.localeCompare(b.title))
        .slice(0, 5)
        .map((r) => ({
          id: r.id,
          title: r.title,
          type: "recipe",
        })),
    ];
  }, [query, ingredients, recipes]);

  return (
    <div
      className="relative flex w-full"
      onBlur={(e) => {
        // if focus moves outside the whole wrapper → close
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <Input
        value={query}
        className="w-full"
        type="search"
        placeholder="Search ingredients or recipes..."
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />

      {open && (
        <Card className="absolute top-full z-50 mt-2 w-full py-1 shadow-lg">
          <CardContent className="p-1">
            <div className="h-fit space-y-2">
              {suggestions.map((item) => (
                <Button
                  variant={"ghost"}
                  className="w-full"
                  key={`${item.type}-${item.id}`}
                  onClick={() => {
                    setQuery(item.title);
                    setOpen(false);
                  }}
                >
                  {/* LEFT SIDE */}
                  <div className="flex items-center w-full justify-between gap-2 min-w-0">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    {item.type === "recipe" && <Badge>R</Badge>}
                  </div>

                  {/* RIGHT SIDE */}

                  <Link
                    href={
                      item.type === "recipe"
                        ? frontendUrls.recipes.view(item.id)
                        : frontendUrls.ingredients.view(item.id)
                    }
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}
                    onClick={() => {
                      setQuery(item.title);
                      setOpen(false);
                    }}
                  >
                    Go to
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchBar;
