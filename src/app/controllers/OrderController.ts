import { Request, Response } from 'express';

import { OrderStatus } from '../models/Order';
import { ordersRepository as OrdersRepository } from '../repositories/OrdersRepository';
import { productsRepository as ProductsRepository } from '../repositories/ProductsRepository';

export interface OrderFilters {
  direction: 'asc' | 'desc'
  orderStatus: OrderStatus
  orderId: string
  pageIndex: string
  pageSize: string
}

interface ProductBody {
  productId: string
  quantity: number
}

class OrderController {
  // Listar todos os registros
  async index(req: Request, res: Response) {
    const userId = req.userId!

    const { direction, status, orderId, pageIndex, pageSize } = req.query

    const orderFilters = {
      direction,
      orderStatus: status,
      orderId,
      pageIndex,
      pageSize,
    } as OrderFilters

    const orders = await OrdersRepository.findAll(orderFilters, userId)

    res.json(orders)
  }

  // Obter um registro
  async show(req: Request, res: Response) {
    const userId = req.userId!

    const { id } = req.params

    const order = await OrdersRepository.findOne(id, userId)

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    return res.json(order)
  }

  // Criar novo registro
  async store(req: Request, res: Response) {
    const { products } = req.body
    const userId = req.userId!

    if (!products) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const hasStock = async (products: ProductBody[]): Promise<{ result: boolean, error?: string }> => {
      for (const product of products) {
        const stock = await ProductsRepository
          .findProductStock(product.productId, userId) ?? { stock: 0, name: '' };
        if (stock?.stock < product.quantity) {
          return { result: false, error: `Insufficient stock for product ${stock.name}` };
        }
      }
      return { result: true };
    };

    const { result, error } = await hasStock(products);

    if (!result) {
      return res.status(400).json({ error });
    }

    const order = await OrdersRepository.create({ products }, userId)

    const adjustStock = async (products: ProductBody[]): Promise<void> => {
      for (const product of products) {
        const stock = await ProductsRepository
          .findProductStock(product.productId, userId) ?? { stock: 0 };

        const newStock = stock?.stock - product.quantity ?? 0;

        await ProductsRepository.updateStock(product.productId, newStock);
      }
    };

    try {
      await adjustStock(products);
  
      res.status(201).json({
        ...order,
        quantity: order.products.reduce((acc, product) => acc + product.quantity, 0)
      })

    } catch (error) {
      return res.status(500).json({ error: "Failed to adjust stock after creating order." })
    }
  }

  // Editar um registro
  async update(req: Request, res: Response) {
    const { id } = req.params
    const { products } = req.body
    const userId = req.userId!

    if (!products) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const order = await OrdersRepository.update(id, {
      products,
    }, userId)

    res.json(order)
  }

  // Deletar um registro
  async delete(req: Request, res: Response) {
    const { id } = req.params
    const userId = req.userId!

    const orderExists = await OrdersRepository.findOne(id, userId)

    if (!orderExists) {
      return res.status(404).json({ error: 'Order not found' })
    }

    await OrdersRepository.delete(id, userId)

    res.sendStatus(204)
  }

  // Deletar um produto de uma order existente
  async deleteProductFromOrder(req: Request, res: Response) {
    const { orderId, productId } = req.params
    const userId = req.userId!

    const orderExists = await OrdersRepository.findOne(orderId, userId)

    if (!orderExists) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const productExists = orderExists.products.find(product => product.productId === productId)

    if (!productExists) {
      return res.status(404).json({ error: 'Product not found in this order' })
    }

    if (orderExists.status === 'DELIVERED') {
      return res.status(400).json({ error: 'Order already delivered' })
    }

    await OrdersRepository.deleteProductFromOrder(orderId, productId, userId)

    res.sendStatus(204)
  }

  // Atualizar o status
  async changeStatus(req: Request, res: Response) {
    const { id } = req.params
    const { status } = req.body
    const userId = req.userId!

    const orderExists = await OrdersRepository.findOne(id, userId)

    if (!orderExists) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (!(status in OrderStatus)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    await OrdersRepository.changeStatus(id, status, userId)

    res.sendStatus(204)
  }
}

export const orderController = new OrderController()
