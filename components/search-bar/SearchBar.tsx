import { useSearch } from "@/prisma/store/search";
import { Input } from "../ui/input";

const SearchBar = () => {
  const query = useSearch((s) => s.query);
  const setQuery = useSearch((s) => s.setQuery);
  return (
    <div className="flex flex-1">
      <Input
        placeholder="Search..."
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
