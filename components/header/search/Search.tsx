"use client";

import { frontendUrls } from "@/lib/urls";
import { usePathname, useSearchParams } from "next/navigation";
import AdminSearchBar from "./admin-bar/AdminSearchBar";
import PublicSearchBar from "./public-bar/PublicSearchBar";

const ADMIN_SEARCH_ROUTES: Record<string, string> = {
  [frontendUrls.ingredients.index]: "Search ingredients...",
  [frontendUrls.ingredients.saved]: "Search saved ingredients...",
  [frontendUrls.recipes.index]: "Search recipes...",
  [frontendUrls.recipes.saved]: "Search saved recipes...",
  [frontendUrls.stuff.index]: "Search stuff...",
};

const Search = () => {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const pathname = usePathname();
  const adminPlaceholder = ADMIN_SEARCH_ROUTES[pathname];

  if (adminPlaceholder) {
    return (
      <AdminSearchBar
        initialQuery={initialQuery}
        placeholder={adminPlaceholder}
        key={pathname}
      />
    );
  }

  if (pathname.startsWith("/admin")) return null;

  return <PublicSearchBar initialQuery={initialQuery} />;
};

export default Search;
