"use client";

import { useState } from "react";
import { useSearch } from "@/zustand/search";
import { useAuthStore } from "@/zustand/auth.store";

import { Separator } from "@/components/ui/separator";
import CategoryButton from "@/components/cat-button/CategoryButton";

import StuffList from "../list/StuffList";
import StuffFormsDialog from "./forms-dialog/StuffFormsDialog";

import { IStuff, IStuffCategory } from "@/lib/prisma.args";

interface Props {
  categories: IStuffCategory[];
  stuff: IStuff[];
}

const StuffTabs = ({ categories, stuff }: Props) => {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const searchQuery = useSearch((s) => s.query);

  const [activeCategory, setActiveCategory] = useState(categories[0].title);

  const active = categories.find((c) => c.title === activeCategory);

  const isSearching = searchQuery.trim().length > 0;
  const query = searchQuery.toLowerCase().trim();

  // 1. CATEGORY FILTER (always applied)
  const categoryStuff = stuff.filter((s) => s.stuffCategoryId === active?.id);

  // 2. SEARCH (category-aware)
  const filteredStuff = isSearching
    ? categoryStuff.filter((s) => s.title.toLowerCase().includes(query))
    : categoryStuff;

  return (
    <div className="flex flex-col gap-4 w-full mx-auto">
      {/* CATEGORY BAR */}
      <div className="flex flex-wrap gap-4 justify-center">
        {categories.map((cat) => {
          const isActive = cat.title === activeCategory;

          const totalItems = stuff.filter(
            (s) => s.stuffCategoryId === cat.id,
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

        {isAdmin && <StuffFormsDialog activeCategoryId={active?.id} />}
      </div>

      <Separator />

      {/* SEARCH INFO */}
      {isSearching && (
        <p className="text-sm text-muted-foreground">
          {filteredStuff.length} items include{" "}
          <span className="italic">&quot;{searchQuery}&quot;</span> in title
        </p>
      )}

      {/* EMPTY STATE + LIST */}
      {filteredStuff.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isSearching
            ? `No items found for "${searchQuery}"`
            : "Found 0 items"}
        </p>
      ) : (
        <StuffList stuff={filteredStuff} />
      )}
    </div>
  );
};

export default StuffTabs;
