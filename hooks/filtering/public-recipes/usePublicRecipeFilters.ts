"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import {
  IStockType,
  STOCK_OPTIONS_VALUES,
} from "@/lib/constants/stock.options";
import {
  IRecipeCategoryFilter,
  RECIPE_CATEGORY_FILTER_OPTIONS_VALUES,
} from "@/lib/enumslist/recipe.constants";
import {
  IRecipeSeriesFilter,
  RECIPES_SERIES_FILTER_OPTIONS_VALUES,
} from "@/lib/enumslist/series.constants";
import {
  IPublicRecipeSortType,
  PUBLIC_RECIPE_SORT_OPTIONS_VALUES,
} from "@/lib/public.sorting.recipes";
import { parseUrlParam } from "../url.helper";
import { IPublicRecipeFilters } from "./types";

const DEFAULT_QUERY: IPublicRecipeFilters = {
  searchQuery: "",
  category: "all",
  stock: "all",
  sort: "recommended",
  series: "all",
};

export const usePublicRecipeFilters = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  /**
   * 1. READ FROM URL → build typed query
   */
  const query = useMemo<IPublicRecipeFilters>(() => {
    const searchQuery = searchParams.get("query") ?? "";

    const category = parseUrlParam(
      searchParams.get("category"),
      RECIPE_CATEGORY_FILTER_OPTIONS_VALUES,
      DEFAULT_QUERY.category,
    );

    const stock = parseUrlParam(
      searchParams.get("stock"),
      STOCK_OPTIONS_VALUES,
      DEFAULT_QUERY.stock,
    );

    const series = parseUrlParam(
      searchParams.get("series"),
      RECIPES_SERIES_FILTER_OPTIONS_VALUES,
      DEFAULT_QUERY.series,
    );

    const sort = parseUrlParam(
      searchParams.get("sort"),
      PUBLIC_RECIPE_SORT_OPTIONS_VALUES,
      DEFAULT_QUERY.sort,
    );

    return {
      searchQuery,
      category,
      stock,

      series,
      sort,
    };
  }, [searchParams]);

  /**
   * 2. WRITE TO URL (generic updater like your product hook)
   */
  const setQuery = useCallback(
    (updates: Partial<IPublicRecipeFilters>) => {
      const params = new URLSearchParams(searchParams.toString());

      // SEARCH
      if (updates.searchQuery !== undefined) {
        if (!updates.searchQuery) params.delete("query");
        else params.set("query", updates.searchQuery);
      }

      // CATEGORY
      if (updates.category !== undefined) {
        if (updates.category === "all") params.delete("category");
        else params.set("category", updates.category);
      }

      // STOCK
      if (updates.stock !== undefined) {
        if (updates.stock === "all") params.delete("stock");
        else params.set("stock", updates.stock);
      }

      // SERIES
      if (updates.series !== undefined) {
        if (updates.series === "all") params.delete("series");
        else params.set("series", updates.series);
      }

      // SORT
      if (updates.sort !== undefined) {
        if (updates.sort === "recommended") params.delete("sort");
        else params.set("sort", updates.sort);
      }

      const queryString = params.toString();
      const destination = queryString ? `${pathname}?${queryString}` : pathname;

      // These filters only affect the already-loaded client-side recipe list.
      // Native history updates stay in sync with useSearchParams without
      // triggering an unnecessary server navigation.
      window.history.pushState(null, "", destination);
    },
    [searchParams, pathname],
  );

  /**
   * 3. helpers (optional but convenient)
   */

  const setSearchQuery = useCallback(
    (value: string) => {
      setQuery({ searchQuery: value });
    },
    [setQuery],
  );

  const setCategory = useCallback(
    (value: IRecipeCategoryFilter) => {
      setQuery({ category: value });
    },
    [setQuery],
  );

  const setStock = useCallback(
    (value: IStockType) => {
      setQuery({ stock: value });
    },
    [setQuery],
  );

  const setSeries = useCallback(
    (value: IRecipeSeriesFilter) => {
      setQuery({ series: value });
    },
    [setQuery],
  );

  const setSort = useCallback(
    (value: IPublicRecipeSortType) => {
      setQuery({ sort: value });
    },
    [setQuery],
  );

  /**
   * 4. reset
   */
  const resetQuery = useCallback(() => {
    setQuery(DEFAULT_QUERY);
  }, [setQuery]);

  return {
    query,
    setQuery,

    // convenience setters
    setSearchQuery,
    setCategory,
    setStock,

    setSeries,
    setSort,

    resetQuery,
  };
};
