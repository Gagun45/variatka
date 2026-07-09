// @/app/stuff/StuffTabs.tsx
"use client";

import ResultsFoundText from "@/components/results-found-p/ResultsFoundText";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
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
import {
  ActiveFilterBadges,
  IActiveBadge,
} from "@/components/filter-layout/ActiveFilterBadges";
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

  // Build the array of active badges matching your exact configuration schemas
  const activeBadges = useMemo(() => {
    const list: IActiveBadge[] = [];

    if (activeCategory && activeCategory !== "all") {
      const option = FILTER_CONFIGS.stuff.category.options.find(
        (o) => o.value === activeCategory,
      );
      if (option) {
        list.push({
          id: "category",
          label: option.label,
          icon: option.icon,
          iconClassName: option.iconClassName,
          onClear: () => setActiveCategory("all"),
        });
      }
    }

    return list;
  }, [activeCategory, setActiveCategory]);

  const onReset = () => {
    setActiveCategory("all");
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-2">
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
        sortSlot={null} // Left null since this layout does not have an active sorting dropdown
        resultsSlot={
          <ResultsFoundText
            amount={filteredStuff.length}
            searchQuery={searchQuery}
          />
        }
        badgesSlot={
          <ActiveFilterBadges
            badges={activeBadges}
            onClearAll={() => setActiveCategory("all")}
          />
        }
        listSlot={<StuffList stuff={filteredStuff} />}
      >
        {null}
      </FilterLayout>
    </div>
  );
};

export default StuffTabs;
