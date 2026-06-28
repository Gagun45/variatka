"use client";

import { useState } from "react";

import { Separator } from "@/components/ui/separator";

import StuffList from "../list/StuffList";

import { FilterButtons } from "@/components/stock-filter/StockFilter";
import {
  IStuffCategory,
  IStuffCategoryFilter,
  STUFF_CATEGORY_FILTER_OPTIONS,
} from "@/lib/enumslist/stuff.constants";
import { IStuff } from "@/lib/prisma.args";
import { useSearchParams } from "next/navigation";
import StuffFormsDialog from "./forms-dialog/StuffFormsDialog";

interface Props {
  stuff: IStuff[];
}

const StuffTabs = ({ stuff }: Props) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") ?? "";

  const [activeCategory, setActiveCategory] =
    useState<IStuffCategoryFilter>("all");

  const isSearching = searchQuery.trim().length > 0;
  const query = searchQuery.toLowerCase().trim();

  const base =
    activeCategory === "all"
      ? stuff
      : stuff.filter((s) => s.category === activeCategory);

  // 1. BASE: search overrides category
  const baseStuff = isSearching
    ? base.filter((s) => s.title.toLowerCase().includes(query))
    : base;

  // 2. RESULT
  const filteredStuff = baseStuff;

  const initialCategory: IStuffCategory =
    activeCategory === "all" ? "DECOR" : activeCategory;

  return (
    <div className="flex flex-col gap-4 w-full mx-auto">
      {/* CATEGORY BAR */}

      <StuffFormsDialog activeCategory={initialCategory} />

      <Separator />
      <FilterButtons
        onChange={setActiveCategory}
        options={STUFF_CATEGORY_FILTER_OPTIONS}
        value={activeCategory}
      />

      <p className="text-sm text-muted-foreground">
        {filteredStuff.length} results found
        {isSearching && <span> including &quot;{searchQuery}&quot;</span>}
      </p>

      <StuffList stuff={filteredStuff} />
    </div>
  );
};

export default StuffTabs;
