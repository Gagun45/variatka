import { Boxes } from "lucide-react";
import { FaBottleDroplet } from "react-icons/fa6";
import { GiHoneyJar, GiSaltShaker } from "react-icons/gi";
import { TbSalt } from "react-icons/tb";
import type { RecipeCategories } from "@prisma/client";
import { IOption } from "../types";
import { IOptionListType } from "./types";
export const RECIPE_CATEGORIES = [
  "SPICES",
  "SAUCES",
  "JAMS",
  "SEASONEDSALT",
] as const satisfies readonly RecipeCategories[];

export type IRecipeCategory = RecipeCategories;

export const RECIPE_CATEGORIES_DATA = {
    SPICES: {
      label: "Спеції",
      icon: GiSaltShaker,
      iconClassName: "text-orange-500",
      logo: "/spices-poster.png",
    },
    JAMS: {
      label: "Повидло",
      icon: GiHoneyJar,
      iconClassName: "text-pink-500",
      logo: "/jams-poster.png",
    },
    SAUCES: {
      label: "Соуси",
      icon: FaBottleDroplet,
      iconClassName: "text-blue-500",
      logo: "/sauces-poster.png",
    },
    SEASONEDSALT: {
      label: "Пряні солі",
      icon: TbSalt,
      iconClassName: "text-amber-500",
    },
  } satisfies Record<RecipeCategories, IOptionListType>;

export type IRecipeCategoryFilter = "all" | IRecipeCategory;

export const RECIPE_CATEGORY_ONLY_OPTIONS: IOption<IRecipeCategory>[] =
  RECIPE_CATEGORIES.map(
    (category): IOption<IRecipeCategory> => ({
      value: category,
      ...RECIPE_CATEGORIES_DATA[category],
    }),
  );

export const RECIPE_CATEGORY_FILTER_OPTIONS: IOption<IRecipeCategoryFilter>[] =
  [
    { value: "all", label: "All", icon: Boxes },
    ...RECIPE_CATEGORY_ONLY_OPTIONS,
  ];

export const RECIPE_PUBLIC_CATEGORIES = [
  "SPICES",
  "SAUCES",
  "JAMS",
] as const satisfies readonly RecipeCategories[];

export const RECIPE_CATEGORY_PUBLIC_FILTER_OPTIONS: IOption<IRecipeCategoryFilter>[] =
  RECIPE_PUBLIC_CATEGORIES.map((category) => ({
    value: category,
    ...RECIPE_CATEGORIES_DATA[category],
  }));

export const RECIPE_CATEGORY_FILTER_OPTIONS_VALUES =
  RECIPE_CATEGORY_FILTER_OPTIONS.map((o) => o.value);

export const RECIPE_CATEGORY_PUBLIC_FILTER_OPTIONS_VALUES =
  RECIPE_CATEGORY_PUBLIC_FILTER_OPTIONS.map((o) => o.value);
