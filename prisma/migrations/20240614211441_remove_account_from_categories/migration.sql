/*
  Warnings:

  - You are about to drop the column `accountId` on the `categories` table. All the data in the column will be lost.
  - Added the required column `accountId` to the `favorites` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_accountId_fkey";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "accountId";

-- AlterTable
ALTER TABLE "favorites" ADD COLUMN     "accountId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
