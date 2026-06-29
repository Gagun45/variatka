"use client";

import { useState } from "react";

import { Separator } from "@/components/ui/separator";

import StuffList from "../list/StuffList";

import { FilterButtons } from "@/components/filter-buttons/FilterButtons";
import ResultsFoundText from "@/components/results-found-p/ResultsFoundText";
import { FILTER_CONFIGS } from "@/lib/enumslist/filter.config";
import {
  IStuffCategory,
  IStuffCategoryFilter,
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

      <StuffFormsDialog initialCategory={initialCategory} />

      <Separator />
      <FilterButtons
        variant="bigger"
        value={activeCategory}
        onChange={setActiveCategory}
        config={FILTER_CONFIGS.stuff.category}
      />

      <ResultsFoundText
        amount={filteredStuff.length}
        searchQuery={searchQuery}
      />

      <StuffList stuff={filteredStuff} />
    </div>
  );
};

export default StuffTabs;
