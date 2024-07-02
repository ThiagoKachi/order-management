import { PrismaClient } from "@prisma/client"
import { Order, OrderStatus } from "../models/Order"

const prisma = new PrismaClient()

export interface OrderFilters {
  direction: 'asc' | 'desc'
  orderStatus?: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'
  orderId?: string
  pageIndex: string
  pageSize: string
}

export class OrdersRepository {
  static findAll = async ({
    direction = 'asc',
    orderStatus,
    orderId,
    pageIndex = '1',
    pageSize = '20'
  }: OrderFilters, userId: string) => {
    const orderBy = direction === 'desc' ? 'desc' : 'asc'
    const orderIdNumber = orderId ? Number(orderId) : undefined
    
    const orders = await prisma.order.findMany({
      orderBy: {
        created_at: orderBy
      },
      where: {
        accountId: userId,
        deleted_at: null,
        status: orderStatus,
        orderId: orderIdNumber
      },
      include: {
        products: {
          include: {
            product: true
          }
        },
      },
      skip: (Number(pageIndex) - 1) * Number(pageSize),
      take: Number(pageSize),
    })

    return orders
  }

  static findOne = async (id: string, userId: string) => {
    const order = await prisma.order.findUnique({
      where: {
        accountId: userId,
        id,
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

    return order
  }

  static create = async ({ products }: Order, userId: string) => {
    const order = await prisma.order.create({
      data: {
        products: {
          create: products.map((product) => ({
            productId: product.productId,
            quantity: product.quantity
          })),
        },
        accountId: userId
      },
      include: {
        products: true
      }
    })

    return order
  }

  static update = async (id: string, { products }: Order, userId: string) => {
    const order = await prisma.order.update({
      where: { id, accountId: userId },
      data: {
        products: {
          upsert: products.map(product => ({
            where: { 
              orderId_productId: {
                orderId: id,
                productId: product.productId
              }
            },
            update: {
              quantity: product.quantity
            },
            create: {
              productId: product.productId,
              quantity: product.quantity
            }
          }))
        }
      },
      include: {
        products: true
      }
    })

    return order
  }

  static delete = async (id: string, userId: string) => {
    const order = await prisma.order.update({
      where: {
        accountId: userId,
        id
      },
      data: {
        deleted_at: new Date()
      }
    })

    return order
  }

  static deleteProductFromOrder = async (orderId: string, productId: string, userId: string) => {
    const order = await prisma.order.update({
      where: {
        accountId: userId,
        id: orderId
      },
      data: {
        products: {
          delete: {
            orderId_productId: {
              orderId,
              productId
            }
          }
        }
      }
    })

    return order
  }

  static changeStatus = async (id: string, status: OrderStatus, userId: string) => {
    const order = await prisma.order.update({
      where: {
        accountId: userId,
        id
      },
      data: {
        status
      }
    })

    return order
  }
}
