/*
  Warnings:

  - You are about to drop the column `inStock` on the `Recipe` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "inStock";

-- CreateTable
CREATE TABLE "RecipeVariant" (
    "id" SERIAL NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "inStock" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecipeVariant_recipeId_idx" ON "RecipeVariant"("recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeVariant_recipeId_label_key" ON "RecipeVariant"("recipeId", "label");

-- AddForeignKey
ALTER TABLE "RecipeVariant" ADD CONSTRAINT "RecipeVariant_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
