"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import SearchField from "../SearchField";

type AdminSearchBarProps = {
  initialQuery: string;
  placeholder: string;
};

const AdminSearchBar = ({ initialQuery, placeholder }: AdminSearchBarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [urlQuery, setUrlQuery] = useState(initialQuery);

  if (initialQuery !== urlQuery) {
    setUrlQuery(initialQuery);
    setQuery(initialQuery);
  }

  const updateURL = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const normalizedQuery = value.trim();

    if (normalizedQuery) {
      params.set("query", normalizedQuery);
    } else {
      params.delete("query");
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }, 500);

  return (
    <div className="mx-auto w-full max-w-md">
      <SearchField
        value={query}
        placeholder={placeholder}
        onChange={(event) => {
          const value = event.target.value;
          setQuery(value);
          updateURL(value);
        }}
      />
    </div>
  );
};

export default AdminSearchBar;
