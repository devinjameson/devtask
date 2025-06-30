/*
  Warnings:

  - A unique constraint covering the columns `[profileId,name]` on the table `Status` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `profileId` to the `Status` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Status" ADD COLUMN     "profileId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Status_profileId_name_key" ON "Status"("profileId", "name");

-- AddForeignKey
ALTER TABLE "Status" ADD CONSTRAINT "Status_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
