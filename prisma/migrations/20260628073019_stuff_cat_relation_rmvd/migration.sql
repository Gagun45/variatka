/*
  Warnings:

  - You are about to drop the column `stuffCategoryId` on the `Stuff` table. All the data in the column will be lost.
  - You are about to drop the `StuffCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Stuff" DROP CONSTRAINT "Stuff_stuffCategoryId_fkey";

-- AlterTable
ALTER TABLE "Stuff" DROP COLUMN "stuffCategoryId";

-- DropTable
DROP TABLE "StuffCategory";
