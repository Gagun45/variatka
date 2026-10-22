"use client";

import type { FilterDefinition } from "@/components/filter-layout/filterDefinitions";
import { useAdminSearchStore } from "@/zustand/admin.search.store";
import { Search } from "lucide-react";

export const useAdminSearchFilter = () => {
  const { searchQuery, setSearchQuery } = useAdminSearchStore();
  const value = searchQuery.trim();
  const searchFilter: FilterDefinition = {
    id: "search",
    value,
    defaultValue: "",
    options: [{ value, label: `Search: “${value}”`, icon: Search }],
    reset: () => setSearchQuery(""),
  };

  return { searchQuery, searchFilter };
};
