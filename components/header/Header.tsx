"use client";

import { Suspense } from "react";
import Loader from "../loader/Loader";
import Draft from "../recipe-draft-sheet/Draft";
import { SidebarTrigger } from "../ui/sidebar";
import Search from "./search/Search";

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
        <Suspense fallback={<Loader />}>
          <div className="flex w-full justify-center">
            <Search />
          </div>
        </Suspense>

        {/* Right */}
        <div className="flex items-center justify-end ">
          <Draft />
        </div>
      </div>
    </header>
  );
};

export default Header;
