import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

class FavoritesRepository {
  async findAll(orderBy = 'asc') {
    const direction = orderBy === 'desc' ? 'desc' : 'asc'
    
    const favorites = await prisma.favorite.findMany({
      orderBy: {
        created_at: direction
      },
      where: {
        deleted_at: null
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

  async findOne(id: string) {    
    const product = await prisma.favoriteProduct.findFirst({
      where: {
        productId: id,
      }
    })

    return product
  }

  async isProductFavorited(productId: string) {
    return await prisma.favoriteProduct.findFirst({
      where: { productId },
    });
  }

  async create(productId: string) {    
    const favorite = await prisma.favorite.create({
      data: {
        products: {
          create: {
             product: {
              connect: {
                id: productId
              }
            }
          }
        },
      },
    })

    return { favoriteId: favorite.id }
  }

  async delete(id: string) {    
    const favorite = await prisma.favorite.update({
      where: {
        id
      },
      data: {
        deleted_at: new Date()
      }
    })

    return favorite
  }
}

export const favoritesRepository = new FavoritesRepository()
