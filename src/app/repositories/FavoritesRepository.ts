import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export class FavoritesRepository {
  static findAll = async (orderBy = 'asc', userId: string) => {
    const direction = orderBy === 'desc' ? 'desc' : 'asc'
    
    const favorites = await prisma.favorite.findMany({
      orderBy: {
        created_at: direction
      },
      where: {
        deleted_at: null,
        accountId: userId
      },
      include: {
        products: {
          include: {
            product: true
          }
        }
      }
    })

    return favorites
      .flatMap((favorite) => favorite.products
      .map((product) => {
        return {
          favoriteId: favorite.id,
          product: product.product,
        }
      }))
  }

  static findOne = async (id: string, userId: string) => {
    const product = await prisma.favoriteProduct.findFirst({
      where: {
        accountId: userId,
        productId: id,
      }
    })

    return product
  }

  static isProductFavorited = async (productId: string, userId: string) => {
    return await prisma.favoriteProduct.findFirst({
      where: { productId, accountId: userId },
    });
  }

  static create = async (productId: string, userId: string) => {
    const favorite = await prisma.favorite.create({
      data: {
        accountId: userId,
        products: {
          create: {
             product: {
              connect: {
                id: productId
              }
            },
            account: {
              connect: {
                id: userId
              }
            }
          },
        },
      },
    })

    return { favoriteId: favorite.id }
  }

  static delete = async (id: string, userId: string) => {
    const favoriteProduct = await prisma.favoriteProduct.findFirst({
      where: {
        productId: id,
        accountId: userId,
      }
    });

    const deletedFavoriteProduct = await prisma.favoriteProduct.delete({
      where: {
        favoriteId_productId: {
          favoriteId: favoriteProduct?.favoriteId!,
          productId: id,
        }
      }
    });

    return deletedFavoriteProduct
  }
}
