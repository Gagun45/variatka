/*
  Warnings:

  - You are about to drop the column `isPremium` on the `Recipe` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RecipeSeries" AS ENUM ('DEFAULT', 'NOMLYGOLD');

-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "isPremium",
ADD COLUMN     "series" "RecipeSeries" NOT NULL DEFAULT 'DEFAULT';
