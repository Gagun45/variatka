import { Boxes } from "lucide-react";
import { FaBottleDroplet } from "react-icons/fa6";
import { GiHoneyJar, GiSaltShaker } from "react-icons/gi";
import { TbSalt } from "react-icons/tb";
import { IOption } from "../types";
import { IOptionListType } from "./types";
// frontend/constants.ts

// 1. Create a browser-safe pseudo-enum
export const RECIPE_CATEGORIES = {
  SPICES: "SPICES",
  SAUCES: "SAUCES",
  JAMS: "JAMS",
  SEASONEDSALT: "SEASONEDSALT",
} as const;

// 2. Derive the type from the object
export type IRecipeCategory =
  (typeof RECIPE_CATEGORIES)[keyof typeof RECIPE_CATEGORIES];

// 3. Map your labels safely
export const RECIPE_CATEGORIES_DATA: Record<IRecipeCategory, IOptionListType> =
  {
    SPICES: {
      label: "Спеції",
      icon: GiSaltShaker,
      iconClassName: "text-orange-500",
    },
    JAMS: {
      label: "Повидло",
      icon: GiHoneyJar,
      iconClassName: "text-pink-500",
    },
    SAUCES: {
      label: "Соуси",
      icon: FaBottleDroplet,
      iconClassName: "text-blue-500",
    },
    SEASONEDSALT: {
      label: "Пряні солі",
      icon: TbSalt,
      iconClassName: "text-amber-500",
    },
  };

export type IRecipeCategoryFilter = "all" | IRecipeCategory;

export const RECIPE_CATEGORY_ONLY_OPTIONS: IOption<IRecipeCategory>[] =
  Object.values(RECIPE_CATEGORIES).map(
    (category): IOption<IRecipeCategory> => ({
      value: category,
      label: RECIPE_CATEGORIES_DATA[category].label,
      icon: RECIPE_CATEGORIES_DATA[category].icon,
      className: RECIPE_CATEGORIES_DATA[category].className,
      iconClassName: RECIPE_CATEGORIES_DATA[category].iconClassName,
    }),
  );

export const RECIPE_CATEGORY_FILTER_OPTIONS: IOption<IRecipeCategoryFilter>[] =
  [
    { value: "all", label: "All", icon: Boxes },
    ...RECIPE_CATEGORY_ONLY_OPTIONS,
  ];

export const RECIPE_CATEGORY_PUBLIC_FILTER_OPTIONS: IOption<IRecipeCategoryFilter>[] =
  [
    { value: "all", label: "All", icon: Boxes },
    ...RECIPE_CATEGORY_ONLY_OPTIONS.filter((o) => o.value !== "SEASONEDSALT"),
  ];
