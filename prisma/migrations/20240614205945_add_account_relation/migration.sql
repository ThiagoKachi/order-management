/*
  Warnings:

  - Added the required column `accountId` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "accountId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "accountId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "accountId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
