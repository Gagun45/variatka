import { usePathname, useSearchParams } from "next/navigation";
import PublicSearchBar from "./public-bar/PublicSearchBar";

const Search = () => {
  // const { isAdmin } = useAuth();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const pathname = usePathname();
  // if (isAdmin) return <AdminSearchBar key={pathname} />;
  return <PublicSearchBar initialQuery={initialQuery} key={pathname} />;
};

export default Search;
