import { IRecipeDto } from "@/zod/recipe.schema";
import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons/lib";
import { IRecipeCategory } from "./enumslist/recipe.constants";
import { IRecipeSeries } from "./enumslist/series.constants";

export interface IResponse {
  success: boolean;
  message: string;
}

export interface IRecipeIngredient {
  amount: string;
  ingredientId: number;
}

export type IRecipeIngredientEditorItem = IRecipeIngredient & {
  title: string;
  isSaved: boolean;
};

export type ICreateRecipeDto = IRecipeDto & {
  items: IRecipeIngredient[];
};

export interface IBreadcrumbItem {
  label: string;
  href?: string;
}

export type IOption<T extends string> = {
  value: T;
  label: string;
  className?: string;
  icon?: LucideIcon | IconType;
  iconClassName?: string;
  logo?: string;
};

export type IActionResponse<T> = IActionSuccess<T> | IActionError;

export type IActionSuccess<T> = {
  ok: true;
  data: T;
};
export type IActionError = {
  ok: false;
  message: string;
};

export interface IUser {
  pid: number;
  role: "USER" | "ADMIN";
  name: string;
  email: string;
  orderPhone: string | null;
  orderName: string | null;
  id?: string; // (Inherited from DefaultSession, which we left in)
}

export interface IPublicRecipeIngredient {
  id: number;
  title: string;
}

export type IPublicRecipe = {
  id: number;
  title: string;
  description: string;
  inStock: number;
  spicy: number;
  series: IRecipeSeries;
  notes: string;
  imageKey: string | null;
  category: IRecipeCategory;
  ingredients: IPublicRecipeIngredient[];
};
