import AdminSearchBar from "@/components/header/search/admin-bar/AdminSearchBar";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import PublicSearchBar from "./public-bar/PublicSearchBar";

const Search = () => {
  const { isAdmin } = useAuth();
  const pathname = usePathname();
  if (isAdmin) return <AdminSearchBar key={pathname} />;
  return <PublicSearchBar />;
};

export default Search;
