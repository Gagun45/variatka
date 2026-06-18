import { ingredientSchemas } from "./ingredient.schema";
import { recipeSchemas } from "./recipe.schema";
import { stuffSchemas } from "./stuff.schema";

export const zodSchemas = {
  ingredient: ingredientSchemas,
  recipe: recipeSchemas,
  stuff: stuffSchemas,
};
