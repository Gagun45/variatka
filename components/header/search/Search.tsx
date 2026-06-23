import SearchBar from "@/components/search-bar/SearchBar";
import { usePathname } from "next/navigation";
import React from "react";

const Search = () => {
  const pathname = usePathname();
  return <SearchBar key={pathname} />;
};

export default Search;
