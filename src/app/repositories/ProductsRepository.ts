import { PrismaClient } from "@prisma/client"
import { ProductFilters } from "../controllers/ProductController"
import { Product } from "../models/Product"

export type ProductSearchField = 'created_at' | 'price'

const prisma = new PrismaClient()

class ProductsRepository {
  async findAll({
    orderByField = 'created_at',
    direction = 'asc',
    productName = '',
    pageIndex = '1',
    pageSize = '20',
  }: ProductFilters, userId: string) {
    const directionSearch = direction === 'desc' ? 'desc' : 'asc'
    const orderBy = orderByField === 'price' ? 'price' : 'created_at'
    
    const products = await prisma.product.findMany({
      orderBy: {
        [orderBy]: directionSearch
      },
      where: {
        accountId: userId,
        name: {
          contains: productName
        },
        deleted_at: null,
      },
      skip: (Number(pageIndex) - 1) * Number(pageSize),
      take: Number(pageSize),
    })

    return products
  }

  async findOne(id: string, userId: string) {    
    const product = await prisma.product.findUnique({
      where: {
        accountId: userId,
        id,
        deleted_at: null
      }
    })

    return product
  }

  async findProductStock(id: string, userId: string) {    
    const product = await prisma.product.findFirst({
      where: {
        id,
        accountId: userId
      },
      select: {
        stock: true,
        name: true
      }
    })

    return product
  }

  async updateStock(id: string, newStock: number) {   
    const product = await prisma.product.update({
      where: {
        id,
      },
      data: {
        stock: newStock
      }
    })

    return product
  }

  async findByName(name: string, userId: string) {    
    const product = await prisma.product.findUnique({
      where: {
        accountId: userId,
        name,
      }
    })

    return product
  }

  async create({ name, description, price, categoryId, image, stock, accountId }: Product) {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        categoryId: categoryId,
        product_image: image,
        stock,
        accountId
      }
    })

    return product
  }

  async update(id: string, data: Product) {   
    const categorie = await prisma.product.update({
      where: { id, accountId: data.accountId },
      data,
    })

    return categorie
  }

  async delete(id: string, userId: string) {    
    const product = await prisma.product.update({
      where: {
        accountId: userId,
        id
      },
      data: {
        deleted_at: new Date()
      }
    })

    return product
  }
}

export const productsRepository = new ProductsRepository()
