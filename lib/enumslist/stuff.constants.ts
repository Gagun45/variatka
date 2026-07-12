import { Boxes, Gift } from "lucide-react";
import { FaJar } from "react-icons/fa6";
import { IOption } from "../types";
import { IOptionListType } from "./types";
import type { StuffCategories } from "@prisma/client";

export const STUFF_CATEGORIES = [
  "DECOR",
  "JARS",
] as const satisfies readonly StuffCategories[];

export type IStuffCategory = StuffCategories;

export const STUFF_CATEGORIES_DATA = {
  DECOR: {
    label: "Пакування та декор",
    icon: Gift,
    iconClassName: "text-purple-500",
  },
  JARS: {
    label: "Слоїчки",
    icon: FaJar,
    iconClassName: "text-cyan-500",
  },
} satisfies Record<StuffCategories, IOptionListType>;

export type IStuffCategoryFilter = "all" | IStuffCategory;

export const STUFF_CATEGORY_ONLY_OPTIONS: IOption<IStuffCategory>[] =
  STUFF_CATEGORIES.map(
    (category): IOption<IStuffCategory> => ({
      value: category,
      ...STUFF_CATEGORIES_DATA[category],
    }),
  );

export const STUFF_CATEGORY_FILTER_OPTIONS: IOption<IStuffCategoryFilter>[] = [
  { value: "all", label: "All", icon: Boxes },
  ...STUFF_CATEGORY_ONLY_OPTIONS,
];
