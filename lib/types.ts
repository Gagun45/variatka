import { IRecipeDto } from "@/zod/recipe.schema";

export interface IResponse {
  success: boolean;
  message: string;
}

export type ICreateRecipeDto = IRecipeDto & {
  items: {
    amount: string;
    ingredientId: number;
  }[];
};

export interface IBreadcrumbItem {
  label: string;
  href?: string;
}
