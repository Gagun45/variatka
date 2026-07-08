// @/components/filter-layout/FilterLayout.tsx
"use client";

import { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

interface FilterLayoutProps {
  sortSlot: ReactNode; // The SortSelect component
  resultsSlot: ReactNode; // The ResultsFoundText component
  children: ReactNode; // The active FilterButtons group
  listSlot: ReactNode; // The product/recipe grid list
  badgesSlot?: ReactNode; // The ActiveFilterBadges component
  onReset: () => void; // Function to clear all filters
  isResetVisible?: boolean; // Optional flag to explicitly control reset button visibility
}

export const FilterLayout = ({
  sortSlot,
  resultsSlot,
  badgesSlot,
  children,
  listSlot,
  onReset,
  isResetVisible,
}: FilterLayoutProps) => {
  // Automatically show reset if badges exist OR if explicitly forced via prop
  const showReset = isResetVisible ?? !!badgesSlot;

  return (
    <div className="flex flex-col gap-4 w-full mx-auto py-4">
      {/* Top Header Control Row */}
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Mobile Filter Button & Overlay Sheet */}
        <div className="2xl:hidden flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Фільтри
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-75 px-3 overflow-y-auto py-5"
            >
              <div className="flex items-center justify-between mb-4 pr-6">
                <SheetTitle className="m-0">Фільтри</SheetTitle>
                {showReset && onReset && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReset}
                    className="h-8 px-2 text-xs text-neutral-500 hover:text-red-500 gap-1.5 transition-colors"
                  >
                    <RotateCcw className="size-3" /> Скинути
                  </Button>
                )}
              </div>

              <SheetDescription className="sr-only">
                Оберіть категорії та параметри для фільтрації рецептів
              </SheetDescription>

              <div className="flex flex-col gap-4">{children}</div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Primary Layout Engine */}
      <div className="flex items-start gap-6 w-full relative">
        {/* Static Desktop Left Sidebar Panel */}
        <aside className="hidden 2xl:flex flex-col gap-4 w-60 shrink-0 border-r pr-4 sticky top-32 max-h-[calc(100vh-8rem)] overflow-y-auto pb-6">
          <div className="flex items-center justify-between min-h-9">
            <span className="text-lg font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 pl-0.5">
              Фільтри
            </span>
            {showReset && onReset && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-8 px-2.5 text-xs text-neutral-500 hover:text-red-600 dark:hover:text-red-400 font-medium gap-1.5 transition-colors rounded-lg"
              >
                <RotateCcw className="size-3.5 transition-transform group-hover:rotate-180" />
                Очистити все
              </Button>
            )}
          </div>
          {children}
        </aside>

        {/* Content Feed Container */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            {resultsSlot}
            {sortSlot}
          </div>
          {badgesSlot && <div className="w-full">{badgesSlot}</div>}
          {listSlot}
        </div>
      </div>
    </div>
  );
};
