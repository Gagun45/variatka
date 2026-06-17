"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

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
};

interface Props {
  ingredients: Ingredient[];
  onSelect: (ingredient: Ingredient) => void;
}

export default function IngredientCombobox({ ingredients, onSelect }: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          Add ingredient...
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
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
