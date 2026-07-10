"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FILTER_CONFIGS } from "@/lib/enumslist/filter.config";
import { frontendUrls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ChevronDown,
  LayoutGrid,
  PackageOpen,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function NavigationMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="hidden md:block">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="group/catalog-trigger gap-2 bg-background/80 shadow-surface"
          >
            <LayoutGrid data-icon="inline-start" />
            <span>Каталог</span>
            <ChevronDown
              data-icon="inline-end"
              className="transition-transform duration-200 group-aria-expanded/catalog-trigger:rotate-180"
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-72 gap-0 overflow-hidden p-0 shadow-raised"
        >
          <nav aria-label="Каталог продукції">
            <div className="border-b bg-muted/40 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Каталог</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Оберіть категорію
              </p>
            </div>

            <ul className="grid gap-1 p-2">
              <li>
                <CatalogLink
                  href={frontendUrls.public.recipes}
                  onSelect={() => setIsOpen(false)}
                  featured
                >
                  <PackageOpen />
                  <span className="flex-1">Вся продукція</span>
                  <ArrowRight className="text-muted-foreground transition-transform group-hover/catalog-link:translate-x-0.5 group-hover/catalog-link:text-foreground" />
                </CatalogLink>
              </li>
              <li aria-hidden="true" className="my-1 border-t" />
              {FILTER_CONFIGS.publicRecipes.category.options.map((category) => (
                <li key={category.value}>
                  <CatalogLink
                    href={`/recipes?category=${category.value}`}
                    onSelect={() => setIsOpen(false)}
                  >
                    <Tag className="text-muted-foreground" />
                    <span className="truncate">{category.label}</span>
                  </CatalogLink>
                </li>
              ))}
            </ul>
          </nav>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function CatalogLink({
  href,
  onSelect,
  featured = false,
  children,
}: {
  href: string;
  onSelect: () => void;
  featured?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className={cn(
        "group/catalog-link flex min-h-10 items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:size-4 [&_svg]:shrink-0",
        featured
          ? "bg-primary/5 font-medium text-foreground hover:bg-primary/10"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      {children}
    </Link>
  );
}
