"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Ingredient = {
  id: number;
  title: string;
  isSaved: boolean;
  isInStock: boolean;
};

interface Props {
  ingredients: Ingredient[];
  disabled?: boolean;
  onSelect: (ingredient: Ingredient) => void;
}

export default function IngredientCombobox({
  ingredients,
  disabled,
  onSelect,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const hasIngredients = ingredients.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || !hasIngredients}
          className="h-9 flex-1 justify-between"
        >
          <span className="inline-flex min-w-0 items-center gap-2">
            <Plus className="size-4" />
            <span className="truncate">
              {hasIngredients ? "Add ingredient" : "All ingredients added"}
            </span>
          </span>
          <ChevronsUpDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Search ingredient..." />

          <CommandList>
            <CommandEmpty>No ingredient found.</CommandEmpty>

            <CommandGroup>
              {ingredients.map((ingredient) => (
                <CommandItem
                  key={ingredient.id}
                  value={ingredient.title}
                  onSelect={() => {
                    onSelect(ingredient);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4 opacity-0")} />
                  {ingredient.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
