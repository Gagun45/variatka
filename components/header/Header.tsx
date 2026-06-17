import Draft from "../recipe-draft-sheet/Draft";
import SearchBar from "../search-bar/SearchBar";
import { SidebarTrigger } from "../ui/sidebar";

const Header = () => {
  return (
    <header
      className="h-24 sticky justify-between top-0 border-b z-20 px-4 w-full bg-sidebar flex items-center gap-4
  "
    >
      <div className="grid h-full gap-4 grid-cols-[1fr_minmax(0,600px)_1fr] items-center w-full">
        {/* Left */}
        <div className="flex items-center ">
          <SidebarTrigger className="dark:text-foreground" />
        </div>

        {/* Center */}
        <div className="flex w-full justify-center ">
          <SearchBar />
        </div>

        {/* Right */}
        <div className="flex items-center justify-end ">
          <Draft />
        </div>
      </div>
    </header>
  );
};

export default Header;
