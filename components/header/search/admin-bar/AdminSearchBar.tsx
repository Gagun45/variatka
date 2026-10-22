"use client";

import { useAdminSearchStore } from "@/zustand/admin.search.store";
import SearchField from "../SearchField";

type AdminSearchBarProps = {
  placeholder: string;
};

const AdminSearchBar = ({ placeholder }: AdminSearchBarProps) => {
  const { searchQuery, setSearchQuery } = useAdminSearchStore();

  return (
    <div className="mx-auto w-full max-w-md">
      <SearchField
        value={searchQuery}
        placeholder={placeholder}
        onChange={(event) => {
          setSearchQuery(event.target.value);
        }}
      />
    </div>
  );
};

export default AdminSearchBar;
