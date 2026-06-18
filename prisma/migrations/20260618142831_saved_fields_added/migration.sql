/*
  Warnings:

  - You are about to drop the column `isAdded` on the `Ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `isFavorited` on the `Recipe` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ingredient" DROP COLUMN "isAdded",
ADD COLUMN     "isSaved" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "isFavorited",
ADD COLUMN     "isSaved" BOOLEAN NOT NULL DEFAULT false;
