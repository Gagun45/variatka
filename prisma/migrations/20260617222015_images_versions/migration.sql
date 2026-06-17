-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "imageVersion" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "imageVersion" INTEGER NOT NULL DEFAULT 0;
