"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useState, type ReactNode } from "react";

interface FilterLayoutProps {
  filters?: ReactNode;
  results: ReactNode;
  sort?: ReactNode;
  activeFilters?: ReactNode;
  content: ReactNode;
  activeFilterCount: number;
  onReset: () => void;
}

export const FilterLayout = ({
  filters,
  results,
  sort,
  activeFilters,
  content,
  activeFilterCount,
  onReset,
}: FilterLayoutProps) => {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const hasActiveFilters = activeFilterCount > 0;

  const resetMobileFilters = () => {
    onReset();
    setIsFilterSheetOpen(false);
  };

  return (
    <div className="mx-auto flex w-full flex-col gap-4 py-4">
      <div className="flex w-full flex-wrap items-center gap-3">
        {filters && (
          <div className="xl:hidden">
            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <SlidersHorizontal />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1 min-w-5 px-1.5">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>

              <SheetContent
                side="left"
                className="w-[min(22rem,calc(100vw-2rem))] max-w-none overflow-y-auto px-4 py-5"
              >
                <div className="mb-5 flex items-center justify-between gap-3 pr-8">
                  <SheetTitle>Filters</SheetTitle>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetMobileFilters}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <RotateCcw />
                      Clear all
                    </Button>
                  )}
                </div>

                <SheetDescription className="sr-only">
                  Choose filters to narrow the displayed results.
                </SheetDescription>

                <div className="flex flex-col gap-4">{filters}</div>
              </SheetContent>
            </Sheet>
          </div>
        )}

        <div className="order-3 w-full min-w-0 sm:order-none sm:w-auto">
          {results}
        </div>

        {sort && <div className="ml-auto shrink-0">{sort}</div>}
      </div>

      <div className="relative flex w-full items-start gap-6">
        {filters && (
          <aside className="sticky top-32 hidden max-h-[calc(100vh-8rem)] w-60 shrink-0 flex-col gap-4 overflow-y-auto border-r pb-6 pr-4 xl:flex">
            <div className="flex min-h-9 items-center justify-between gap-2">
              <h2 className="text-lg font-semibold tracking-tight">Filters</h2>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReset}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <RotateCcw className="transition-transform group-hover/button:rotate-180" />
                  Clear all
                </Button>
              )}
            </div>

            {filters}
          </aside>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {hasActiveFilters && activeFilters}
          {content}
        </div>
      </div>
    </div>
  );
};
