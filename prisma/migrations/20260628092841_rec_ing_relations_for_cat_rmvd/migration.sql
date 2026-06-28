/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `recipeCategoryId` on the `Recipe` table. All the data in the column will be lost.
  - You are about to drop the `IngredientCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RecipeCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Ingredient" DROP CONSTRAINT "Ingredient_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Recipe" DROP CONSTRAINT "Recipe_recipeCategoryId_fkey";

-- AlterTable
ALTER TABLE "Ingredient" DROP COLUMN "categoryId";

-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "recipeCategoryId";

-- DropTable
DROP TABLE "IngredientCategory";

-- DropTable
DROP TABLE "RecipeCategory";
