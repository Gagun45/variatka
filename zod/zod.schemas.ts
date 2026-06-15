import { categorySchemas } from "./category.schema";
import { ingredientSchemas } from "./ingredient.schema";
import { recipeSchemas } from "./recipe.schema";

export const zodSchemas = {
  category: categorySchemas,
  ingredient: ingredientSchemas,
  recipe: recipeSchemas,
};
