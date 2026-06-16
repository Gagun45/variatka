import { Input } from "@/components/ui/input";
import { useIngredients } from "@/features/ingredient/hooks/useIngredients";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";
import { useSearch } from "@/prisma/store/search";
import { useMemo, useState } from "react";

const SearchBar = () => {
  const query = useSearch((s) => s.query);
  const setQuery = useSearch((s) => s.setQuery);
  const { data: ingredients = [] } = useIngredients();
  const { data: recipes = [] } = useRecipes();

  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    if (!query) return [];

    const q = query.toLowerCase();

    return [
      ...ingredients
        .filter((i) => i.title.toLowerCase().includes(q))
        .slice(0, 5)
        .map((i) => ({ id: i.id, title: i.title, type: "ingredient" })),

      ...recipes
        .filter((r) => r.title.toLowerCase().includes(q))
        .slice(0, 5)
        .map((r) => ({ id: r.id, title: r.title, type: "recipe" })),
    ];
  }, [query, ingredients, recipes]);

  return (
    <div className="relative flex w-full">
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
        onBlur={() => setOpen(false)}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute w-fit top-full rounded-md border bg-background shadow-lg z-50">
          {suggestions.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="px-3 py-2 space-x-2 text-sm hover:bg-muted cursor-pointer"
              onMouseDown={() => {
                setQuery(item.title);
                setOpen(false);
              }}
            >
              <span>{item.title}</span>
              <span
                className={`text-xs px-2 rounded-md text-muted-foreground ${item.type === "recipe" ? "bg-accent" : ""}`}
              >
                {item.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
