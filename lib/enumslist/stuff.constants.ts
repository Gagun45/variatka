import { Boxes, Gift } from "lucide-react";
import { IOption } from "../types";
import { IOptionListType } from "./types";
import { FaJar } from "react-icons/fa6";
// frontend/constants.ts

// 1. Create a browser-safe pseudo-enum
export const STUFF_CATEGORIES = {
  DECOR: "DECOR",
  JARS: "JARS",
} as const;

// 2. Derive the type from the object
export type IStuffCategory =
  (typeof STUFF_CATEGORIES)[keyof typeof STUFF_CATEGORIES];

// 3. Map your labels safely
export const STUFF_CATEGORIES_DATA: Record<IStuffCategory, IOptionListType> = {
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
};

export type IStuffCategoryFilter = "all" | IStuffCategory;

export const STUFF_CATEGORY_ONLY_OPTIONS: IOption<IStuffCategory>[] = [
  ...Object.values(STUFF_CATEGORIES).map(
    (category): IOption<IStuffCategory> => ({
      value: category,
      label: STUFF_CATEGORIES_DATA[category].label,
      className: STUFF_CATEGORIES_DATA[category].className,
      iconClassName: STUFF_CATEGORIES_DATA[category].iconClassName,
      icon: STUFF_CATEGORIES_DATA[category].icon,
    }),
  ),
];

export const STUFF_CATEGORY_FILTER_OPTIONS: IOption<IStuffCategoryFilter>[] = [
  { value: "all", label: "All", icon: Boxes },
  ...STUFF_CATEGORY_ONLY_OPTIONS,
];
