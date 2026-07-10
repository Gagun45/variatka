// @/app/stuff/StuffTabs.tsx
"use client";

import ResultsFoundText from "@/components/results-found-p/ResultsFoundText";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import StuffList from "../list/StuffList";
import StuffFormsDialog from "./forms-dialog/StuffFormsDialog";

import { FILTER_CONFIGS } from "@/lib/enumslist/filter.config";
import {
  IStuffCategory,
  IStuffCategoryFilter,
} from "@/lib/enumslist/stuff.constants";
import { IStuff } from "@/lib/prisma.args";

// Reusable Layout and Badge Elements
import { AdminCategoryButtons } from "@/components/admin-cat-buttons/AdminCategoryButtons";
import { ActiveFilterBadges } from "@/components/filter-layout/ActiveFilterBadges";
import {
  createActiveFilterBadges,
  type FilterDefinition,
  resetFilterDefinitions,
} from "@/components/filter-layout/filterDefinitions";
import { FilterLayout } from "@/components/filter-layout/FilterLayout";

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

  const filteredStuff = baseStuff;

  const initialCategory: IStuffCategory =
    activeCategory === "all" ? "DECOR" : activeCategory;

  const filterDefinitions: FilterDefinition[] = [
    {
      id: "category",
      value: activeCategory,
      defaultValue: "all",
      options: FILTER_CONFIGS.stuff.category.options,
      reset: () => setActiveCategory("all"),
    },
  ];
  const activeBadges = createActiveFilterBadges(filterDefinitions);

  const onReset = () => {
    resetFilterDefinitions(filterDefinitions);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2">
        <h1>Stuff</h1>
        <StuffFormsDialog initialCategory={initialCategory} />
      </div>
      <Separator className="mb-2" />
      <AdminCategoryButtons
        config={FILTER_CONFIGS.stuff.category}
        value={activeCategory}
        onChange={setActiveCategory}
      />

      <FilterLayout
        onReset={onReset}
        activeFilterCount={activeBadges.length}
        results={
          <ResultsFoundText
            amount={filteredStuff.length}
            searchQuery={searchQuery}
          />
        }
        activeFilters={
          <ActiveFilterBadges
            badges={activeBadges}
            onClearAll={onReset}
          />
        }
        content={<StuffList stuff={filteredStuff} />}
      />
    </div>
  );
};

export default StuffTabs;
