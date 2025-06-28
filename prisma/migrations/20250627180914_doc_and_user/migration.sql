/*
  Warnings:

  - You are about to drop the column `permission` on the `Share` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[documentId,userId]` on the table `Share` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Share" DROP COLUMN "permission",
ADD COLUMN     "canEdit" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Share_documentId_userId_key" ON "Share"("documentId", "userId");
