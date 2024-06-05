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
  }: ProductFilters) {
    const directionSearch = direction === 'desc' ? 'desc' : 'asc'
    const orderBy = orderByField === 'price' ? 'price' : 'created_at'
    
    const products = await prisma.product.findMany({
      orderBy: {
        [orderBy]: directionSearch
      },
      where: {
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

  async findOne(id: string) {    
    const product = await prisma.product.findUnique({
      where: {
        id,
        deleted_at: null
      }
    })

    return product
  }

  async findByName(name: string) {    
    const product = await prisma.product.findUnique({
      where: {
        name,
      }
    })

    return product
  }

  async create({ name, description, price, categoryId }: Product) {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        categoryId: categoryId,
      }
    })

    return product
  }

  async update(id: string, data: Product) {   
    const categorie = await prisma.product.update({
      where: { id },
      data,
    })

    return categorie
  }

  async delete(id: string) {    
    const product = await prisma.product.update({
      where: {
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
