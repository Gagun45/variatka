/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Recipe` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "StuffCategory" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "StuffCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stuff" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "inStock" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stuffCategoryId" INTEGER,

    CONSTRAINT "Stuff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StuffCategory_title_key" ON "StuffCategory"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Stuff_title_key" ON "Stuff"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_title_key" ON "Recipe"("title");

-- AddForeignKey
ALTER TABLE "Stuff" ADD CONSTRAINT "Stuff_stuffCategoryId_fkey" FOREIGN KEY ("stuffCategoryId") REFERENCES "StuffCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
