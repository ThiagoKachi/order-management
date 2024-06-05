/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "orders_orderId_key" ON "orders"("orderId");
