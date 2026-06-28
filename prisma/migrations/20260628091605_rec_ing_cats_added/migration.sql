-- CreateEnum
CREATE TYPE "IngredientCategories" AS ENUM ('SPICES', 'OTHER');

-- CreateEnum
CREATE TYPE "RecipeCategories" AS ENUM ('SPICES', 'SAUCES', 'JAMS');

-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "categoryNew" "IngredientCategories" NOT NULL DEFAULT 'SPICES';

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "category" "RecipeCategories" NOT NULL DEFAULT 'SPICES';
