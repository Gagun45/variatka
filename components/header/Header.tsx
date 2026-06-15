"use client";

import RecipeDraftSheet from "../recipe-draft-sheet/RecipeDraftSheet";
import SearchBar from "../search-bar/SearchBar";
import ThemeToggle from "../theme-toggle/ThemeToggle";

const Header = () => {
  return (
    <header
      className="h-24 sticky justify-between top-0 border-b z-20 px-4 w-full bg-sidebar flex items-center gap-4
  "
    >
      <ThemeToggle />
      <SearchBar />
      <RecipeDraftSheet />
    </header>
  );
};

export default Header;
