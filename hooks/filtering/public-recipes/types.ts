import { IStockType } from "@/lib/constants/stock.options";
import { IRecipeCategoryFilter } from "@/lib/enumslist/recipe.constants";
import { IRecipeSeriesFilter } from "@/lib/enumslist/series.constants";
import { IRecipe } from "@/lib/prisma.args";
import { IPublicRecipeSortType } from "@/lib/public.sorting.recipes";

export interface IPublicRecipeFilters {
  searchQuery: string;
  category: IRecipeCategoryFilter;
  stock: IStockType;
  sort: IPublicRecipeSortType;
  series: IRecipeSeriesFilter;
}

export interface IUsePublicRecipesFilterParams {
  recipes: IRecipe[];
  filters: IPublicRecipeFilters;
}
