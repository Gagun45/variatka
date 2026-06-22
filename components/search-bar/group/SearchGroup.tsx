"use client";

import { useRouter } from "next/navigation";
import { CommandGroup, CommandItem } from "@/components/ui/command";
import { ISearchBarItem } from "@/zustand/search.store";
import { getSearchItemHref } from "@/lib/urls";

interface SearchGroupProps {
  heading: string;
  items: ISearchBarItem[];
  onSelect: (item: ISearchBarItem) => void;
}

export function SearchGroup({ heading, items, onSelect }: SearchGroupProps) {
  const router = useRouter();

  // If there are no items in this category, don't render the section at all
  if (items.length === 0) return null;

  return (
    <CommandGroup heading={heading} className="border-b">
      {items.map((item) => {
        const uniqueValue = `${heading.toLowerCase()}-${item.id}`;
        return (
          <CommandItem
            key={uniqueValue}
            value={uniqueValue}
            onSelect={() => {
              onSelect(item); // Fires store update & closes popover
              router.push(getSearchItemHref(item)); // Triggers navigation safely
            }}
            className="w-full cursor-pointer"
          >
            {item.title}
          </CommandItem>
        );
      })}
    </CommandGroup>
  );
}
