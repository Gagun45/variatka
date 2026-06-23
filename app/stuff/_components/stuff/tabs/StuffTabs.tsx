"use client";

import { useState } from "react";
import { useSearch } from "@/zustand/search.store";
import { useAuthStore } from "@/zustand/auth.store";

import { Separator } from "@/components/ui/separator";
import CategoryButton from "@/components/cat-button/CategoryButton";

import StuffList from "../list/StuffList";
import StuffFormsDialog from "./forms-dialog/StuffFormsDialog";

import { IStuff, IStuffCategory } from "@/lib/prisma.args";
import { useSearchParams } from "next/navigation";

interface Props {
  categories: IStuffCategory[];
  stuff: IStuff[];
}

const StuffTabs = ({ categories, stuff }: Props) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") ?? "";
  const isAdmin = useAuthStore((s) => s.isAdmin);

  const [activeCategory, setActiveCategory] = useState(categories[0].title);

  const active = categories.find((c) => c.title === activeCategory);

  const isSearching = searchQuery.trim().length > 0;
  const query = searchQuery.toLowerCase().trim();

  // 1. BASE: search overrides category
  const baseStuff = isSearching
    ? stuff.filter((s) => s.title.toLowerCase().includes(query))
    : stuff.filter((s) => s.stuffCategoryId === active?.id);

  // 2. RESULT
  const filteredStuff = baseStuff;

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

      {filteredStuff.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isSearching
            ? `No items found for "${searchQuery}"`
            : "Found 0 items"}
        </p>
      ) : (
        <>
          {isSearching && (
            <p className="text-sm text-muted-foreground">
              {filteredStuff.length} items found for{" "}
              <span className="italic">&quot;{searchQuery}&quot;</span>
            </p>
          )}

          <StuffList stuff={filteredStuff} />
        </>
      )}
    </div>
  );
};

export default StuffTabs;
