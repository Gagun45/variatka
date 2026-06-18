/*
  Warnings:

  - Made the column `stuffCategoryId` on table `Stuff` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Stuff" DROP CONSTRAINT "Stuff_stuffCategoryId_fkey";

-- AlterTable
ALTER TABLE "Stuff" ALTER COLUMN "stuffCategoryId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Stuff" ADD CONSTRAINT "Stuff_stuffCategoryId_fkey" FOREIGN KEY ("stuffCategoryId") REFERENCES "StuffCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
