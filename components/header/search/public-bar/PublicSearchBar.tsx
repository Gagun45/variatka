"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";

type PublicSearchBarProps = {
  initialQuery: string;
};

const PublicSearchBar = ({ initialQuery }: PublicSearchBarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);

  const updateURL = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value.trim()) {
      params.set("query", value);
    } else {
      params.delete("query");
    }

    router.replace(`${pathname}?${params.toString()}`);
  }, 250);

  // Update URL when user types
  useEffect(() => {
    updateURL(query);
  }, [query, updateURL]);

  return (
    <div className="mx-auto w-full max-w-md">
      <Input
        placeholder="Search..."
        value={query}
        className="border-accent"
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
};

export default PublicSearchBar;
