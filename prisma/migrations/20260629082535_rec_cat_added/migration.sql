-- AlterEnum
ALTER TYPE "RecipeCategories" ADD VALUE 'SEASONEDSALT';

-- AlterTable
ALTER TABLE "Ingredient" ALTER COLUMN "categoryNew" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Recipe" ALTER COLUMN "series" DROP DEFAULT,
ALTER COLUMN "category" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Stuff" ALTER COLUMN "category" DROP DEFAULT;
