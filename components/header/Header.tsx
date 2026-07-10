"use client";

import { Suspense } from "react";
import Loader from "../loader/Loader";
import Draft from "../recipe-draft-sheet/Draft";
import { SidebarTrigger } from "../ui/sidebar";
import CartTrigger from "./cart-trigger/CartTrigger";
import { NavigationMenu } from "./nav-menu/NavigationMenu";
import Search from "./search/Search";

const Header = () => {
  return (
    <header
      className="h-app-header sticky justify-between top-0 border-b z-header px-4 w-full bg-sidebar flex items-center gap-4
  "
    >
      <div className="grid h-full gap-2 grid-cols-[1fr_auto_1fr] items-center w-full max-w-content mx-auto px-2 md:px-8">
        {/* Left */}
        <div className="flex items-center justify-start gap-4">
          <SidebarTrigger className="dark:text-foreground" />
          <NavigationMenu />
        </div>

        {/* Center */}
        <Suspense fallback={<Loader />}>
          <div className="flex w-full justify-center">
            <Search />
          </div>
        </Suspense>

        {/* Right */}
        <div className="flex items-center justify-end gap-2">
          {/* <Link
            href={frontendUrls.public.wishlist}
            className={buttonVariants({ size: "icon", variant: "ghost" })}
          >
            <Heart />
          </Link> */}
          <CartTrigger />
          <Draft />
        </div>
      </div>
    </header>
  );
};

export default Header;
