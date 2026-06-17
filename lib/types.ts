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
