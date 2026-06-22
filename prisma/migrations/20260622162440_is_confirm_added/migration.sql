-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "confirmationNotes" TEXT,
ADD COLUMN     "isConfirmed" BOOLEAN NOT NULL DEFAULT false;
