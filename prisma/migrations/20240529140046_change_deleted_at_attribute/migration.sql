/*
  Warnings:

  - The `deleted_at` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted_at` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "deleted_at",
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "products" DROP COLUMN "deleted_at",
ADD COLUMN     "deleted_at" TIMESTAMP(3);
