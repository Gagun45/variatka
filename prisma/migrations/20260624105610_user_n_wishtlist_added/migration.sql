-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "kindeId" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithlistItem" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "recipeId" INTEGER NOT NULL,

    CONSTRAINT "WithlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_kindeId_key" ON "User"("kindeId");

-- CreateIndex
CREATE INDEX "WithlistItem_userId_idx" ON "WithlistItem"("userId");

-- CreateIndex
CREATE INDEX "WithlistItem_recipeId_idx" ON "WithlistItem"("recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "WithlistItem_userId_recipeId_key" ON "WithlistItem"("userId", "recipeId");

-- AddForeignKey
ALTER TABLE "WithlistItem" ADD CONSTRAINT "WithlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithlistItem" ADD CONSTRAINT "WithlistItem_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
