-- CreateEnum
CREATE TYPE "StuffCategories" AS ENUM ('DECOR', 'JARS');

-- AlterTable
ALTER TABLE "Stuff" ADD COLUMN     "category" "StuffCategories" NOT NULL DEFAULT 'JARS';
