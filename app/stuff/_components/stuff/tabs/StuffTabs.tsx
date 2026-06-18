"use client";

import { Button } from "@/components/ui/button";
import { IStuff, IStuffCategory } from "@/lib/prisma.args";
import { useSearch } from "@/zustand/search";
import { useState } from "react";

import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/zustand/auth.store";
import StuffList from "../list/StuffList";
import StuffFormsDialog from "./forms-dialog/StuffFormsDialog";

interface Props {
  categories: IStuffCategory[];
  stuff: IStuff[];
}

const StuffTabs = ({ categories, stuff }: Props) => {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const searchQuery = useSearch((s) => s.query);
  const [activeCategory, setActiveCategory] = useState(categories[0].title);

  const active = categories.find((c) => c.title === activeCategory);
  const filteredStuff = stuff.filter((i) => i.stuffCategoryId === active?.id);

  const searchedStuff = stuff.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const isSearching = searchQuery.trim() !== "";
  return (
    <div className="flex flex-col gap-4 w-full mx-auto">
      {isSearching ? (
        <>
          <p>
            {searchedStuff.length} items include{" "}
            <span className="italic">{searchQuery}</span> in title
          </p>
          {searchedStuff.length !== 0 && <StuffList stuff={searchedStuff} />}
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((cat) => {
              const isActive = cat.title === activeCategory;
              const items = stuff.filter((i) => i.stuffCategoryId === cat.id);
              const totalItems = items.length;

              return (
                <Button
                  key={cat.id}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setActiveCategory(cat.title)}
                  className="min-w-36 text-xl h-12"
                >
                  {cat.title} ({totalItems})
                </Button>
              );
            })}
            {isAdmin && <StuffFormsDialog />}
          </div>
          <Separator />
          {active && (
            <>
              {filteredStuff.length === 0 ? (
                <p>Found 0 items</p>
              ) : (
                <StuffList stuff={filteredStuff} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default StuffTabs;
