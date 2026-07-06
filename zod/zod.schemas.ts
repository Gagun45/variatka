import { ingredientSchemas } from "./ingredient.schema";
import { orderSchemas } from "./order.schema";
import { recipeSchemas } from "./recipe.schema";
import { stuffSchemas } from "./stuff.schema";
import { userSchemas } from "./user.schema";

export const zodSchemas = {
  ingredient: ingredientSchemas,
  recipe: recipeSchemas,
  stuff: stuffSchemas,
  user: userSchemas,
  order: orderSchemas,
};
