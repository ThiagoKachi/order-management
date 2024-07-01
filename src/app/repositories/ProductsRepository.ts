import { PrismaClient } from "@prisma/client"
import { Product } from "../models/Product"

export interface ProductFilters {
  orderByField: ProductSearchField
  direction: 'asc' | 'desc'
  productName: string
  pageIndex: string
  pageSize: string
}

export type ProductSearchField = 'created_at' | 'price'

const prisma = new PrismaClient()

export class ProductsRepository {
  static findAll = async ({
    orderByField = 'created_at',
    direction = 'asc',
    productName = '',
    pageIndex = '1',
    pageSize = '20',
  }: ProductFilters, userId: string) => {
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

  static findOne = async (id: string, userId: string) => {
    const product = await prisma.product.findUnique({
      where: {
        accountId: userId,
        id,
        deleted_at: null
      }
    })

    return product
  }

  static findProductStock = async (id: string, userId: string) => {
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

  static updateStock = async (id: string, newStock: number) => {
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

  static findByName = async (name: string, userId: string) => { 
    const product = await prisma.product.findUnique({
      where: {
        accountId: userId,
        name,
      }
    })

    return product
  }

  static create = async ({ name, description, price, categoryId, image, stock, accountId }: Product) => {
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

  static update = async (id: string, data: Product) => {
    const categorie = await prisma.product.update({
      where: { id, accountId: data.accountId },
      data,
    })

    return categorie
  }

  static delete = async (id: string, userId: string) => {
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
