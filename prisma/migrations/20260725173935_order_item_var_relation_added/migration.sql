/*
  Warnings:

  - A unique constraint covering the columns `[id,recipeId]` on the table `RecipeVariant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `variantId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variantLabel` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "variantId" INTEGER NOT NULL,
ADD COLUMN     "variantLabel" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "OrderItem_variantId_idx" ON "OrderItem"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeVariant_id_recipeId_key" ON "RecipeVariant"("id", "recipeId");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_recipeId_fkey" FOREIGN KEY ("variantId", "recipeId") REFERENCES "RecipeVariant"("id", "recipeId") ON DELETE RESTRICT ON UPDATE CASCADE;
