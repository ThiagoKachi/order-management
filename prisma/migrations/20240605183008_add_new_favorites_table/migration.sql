-- AlterTable
ALTER TABLE "order_products" ADD COLUMN     "favoriteId" UUID;

-- CreateTable
CREATE TABLE "favorites" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_products" (
    "favoriteId" UUID NOT NULL,
    "productId" UUID NOT NULL,

    CONSTRAINT "favorite_products_pkey" PRIMARY KEY ("favoriteId","productId")
);

-- AddForeignKey
ALTER TABLE "favorite_products" ADD CONSTRAINT "favorite_products_favoriteId_fkey" FOREIGN KEY ("favoriteId") REFERENCES "favorites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_products" ADD CONSTRAINT "favorite_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
