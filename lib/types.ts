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

export interface IUser {
  pid: number;
  role: "USER" | "ADMIN";
  name: string;
  email: string;
  image?: string | null;
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
  isInStock: boolean;
  isPremium: boolean;
  spicy: number;
  notes: string;
  imageKey: string | null;
  recipeCategory: {
    id: number;
    title: string;
  };
  ingredients: IPublicRecipeIngredient[];
};
