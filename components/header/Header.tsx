"use client";

import { getImageUrl } from "@/lib/image.helper";
import { frontendUrls } from "@/lib/urls";
import { ClipboardList, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import Loader from "../loader/Loader";
import Draft from "../recipe-draft-sheet/Draft";
import { buttonVariants } from "../ui/button";
import { SidebarTrigger } from "../ui/sidebar";
import CartTrigger from "./cart-trigger/CartTrigger";
import { NavigationMenu } from "./nav-menu/NavigationMenu";
import Search from "./search/Search";

const Header = () => {
  return (
    <header
      className="h-app-header sticky justify-between top-0 border-b border-sidebar-border/70 z-header px-2 w-full bg-sidebar/85 backdrop-blur-xl supports-backdrop-filter:bg-sidebar/75 shadow-surface flex items-center gap-4
  "
    >
      <div className="h-full flex items-center gap-2 w-full max-w-content mx-auto md:px-8">
        {/* Left */}
        <div className="flex items-center justify-start gap-1 sm:gap-2 md:gap-4">
          <SidebarTrigger className="dark:text-foreground" />
          <Link href={frontendUrls.index} className="relative size-12 block">
            <Image alt="logo" src={getImageUrl()} fill />
          </Link>

          <NavigationMenu />
        </div>

        {/* Center */}
        <Suspense fallback={<Loader />}>
          <div className="flex w-full justify-center">
            <Search />
          </div>
        </Suspense>

        {/* Right */}
        <div className="flex items-center justify-end gap-1">
          <div className="items-center gap-1 hidden md:flex">
            <Link
              title="Замовлення"
              href={frontendUrls.public.orders}
              className={buttonVariants({
                size: "icon",
                variant: "ghost",
              })}
            >
              <ClipboardList />
            </Link>
            <Link
              title="Обране"
              href={frontendUrls.public.wishlist}
              className={buttonVariants({
                size: "icon",
                variant: "ghost",
              })}
            >
              <Heart />
            </Link>
          </div>

          <CartTrigger />
          <Draft />
        </div>
      </div>
    </header>
  );
};

export default Header;
