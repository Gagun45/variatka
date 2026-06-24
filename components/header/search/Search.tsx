import SearchBar from "@/components/search-bar/SearchBar";
import { useAuthStore } from "@/zustand/auth.store";
import { usePathname } from "next/navigation";

const Search = () => {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const pathname = usePathname();
  if (!isAdmin) return null;
  return <SearchBar key={pathname} />;
};

export default Search;
