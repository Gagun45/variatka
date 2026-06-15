import { ICreateRecipeFormValues } from "@/zod/recipe.schema";

export interface IResponse {
  success: boolean;
  message: string;
}

export type ICreateRecipeDto = ICreateRecipeFormValues & {
  items: {
    amount: string;
    ingredientId: number;
  }[];
};
