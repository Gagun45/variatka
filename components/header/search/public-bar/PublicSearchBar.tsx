"use client";

import { FormEvent, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { frontendUrls } from "@/lib/urls";
import SearchField from "../SearchField";

type PublicSearchBarProps = {
  initialQuery: string;
};

const PublicSearchBar = ({ initialQuery }: PublicSearchBarProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState(initialQuery);
  const [urlQuery, setUrlQuery] = useState(initialQuery);

  if (initialQuery !== urlQuery) {
    setUrlQuery(initialQuery);
    setQuery(initialQuery);
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params =
      pathname === frontendUrls.public.recipes
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();
    const normalizedQuery = query.trim();

    if (normalizedQuery) {
      params.set("query", normalizedQuery);
    } else {
      params.delete("query");
    }

    const queryString = params.toString();
    const destination = queryString
      ? `${frontendUrls.public.recipes}?${queryString}`
      : frontendUrls.public.recipes;
    router.push(destination);
  };

  return (
    <form
      role="search"
      className="mx-auto w-full max-w-md"
      onSubmit={handleSubmit}
    >
      <SearchField
        placeholder="Пошук продукції..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        submitButton
      />
    </form>
  );
};

export default PublicSearchBar;
