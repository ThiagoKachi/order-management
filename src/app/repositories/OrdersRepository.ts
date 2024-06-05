import { PrismaClient } from "@prisma/client"
import { OrderFilters } from "../controllers/OrderController"
import { Order, OrderStatus } from "../models/Order"

const prisma = new PrismaClient()

class OrdersRepository {
  async findAll({
    direction = 'asc',
    orderStatus,
    orderId,
    pageIndex = '1',
    pageSize = '20'
  }: OrderFilters) {
    const orderBy = direction === 'desc' ? 'desc' : 'asc'
    const orderIdNumber = orderId ? Number(orderId) : undefined
    
    const orders = await prisma.order.findMany({
      orderBy: {
        created_at: orderBy
      },
      where: {
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

  async findOne(id: string) {    
    const order = await prisma.order.findUnique({
      where: {
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

  async create({ products }: Order) {
    const order = await prisma.order.create({
      data: {
        products: {
          create: products.map((product) => ({
            productId: product.productId,
            quantity: product.quantity
          })),
        }
      },
      include: {
        products: true
      }
    })

    return order
  }

  async update(id: string, { products }: Order) {   
    const order = await prisma.order.update({
      where: { id },
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

  async delete(id: string) {    
    const order = await prisma.order.update({
      where: {
        id
      },
      data: {
        deleted_at: new Date()
      }
    })

    return order
  }

  async deleteProductFromOrder(orderId: string, productId: string) {    
    const order = await prisma.order.update({
      where: {
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

  async changeStatus(id: string, status: OrderStatus) {    
    const order = await prisma.order.update({
      where: {
        id
      },
      data: {
        status
      }
    })

    return order
  }
}

export const ordersRepository = new OrdersRepository()
