import { IRecipeDto } from "@/zod/recipe.schema";

export interface IResponse {
  success: boolean;
  message: string;
}

export interface IRecipeIngredient {
  amount: string;
  ingredientId: number;
}

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
