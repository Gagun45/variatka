-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "spicy" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "RecipeCategory" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '';
