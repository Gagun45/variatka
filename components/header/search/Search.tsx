import SearchBar from "@/components/search-bar/SearchBar";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";

const Search = () => {
  const { isAdmin } = useAuth();
  const pathname = usePathname();
  if (!isAdmin) return null;
  return <SearchBar key={pathname} />;
};

export default Search;
