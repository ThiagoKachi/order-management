import { Request, Response } from 'express';

import { OrderStatus } from '../models/Order';
import { ordersRepository as OrdersRepository } from '../repositories/OrdersRepository';

export interface OrderFilters {
  direction: 'asc' | 'desc'
  orderStatus: OrderStatus
  orderId: string
  pageIndex: string
  pageSize: string
}

class OrderController {
  // Listar todos os registros
  async index(req: Request, res: Response) {
    const { direction, status, orderId, pageIndex, pageSize } = req.query

    const orderFilters = {
      direction,
      orderStatus: status,
      orderId,
      pageIndex,
      pageSize,
    } as OrderFilters

    const orders = await OrdersRepository.findAll(orderFilters)

    res.json(orders)
  }

  // Obter um registro
  async show(req: Request, res: Response) {
    const { id } = req.params

    const order = await OrdersRepository.findOne(id)

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    return res.json(order)
  }

  // Criar novo registro
  async store(req: Request, res: Response) {
    const { products } = req.body

    if (!products) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const order = await OrdersRepository.create({ products })

    res.status(201).json({
      ...order,
      quantity: order.products.reduce((acc, product) => acc + product.quantity, 0)
    })
  }

  // Editar um registro
  async update(req: Request, res: Response) {
    const { id } = req.params
    const { products } = req.body

    if (!products) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const order = await OrdersRepository.update(id, {
      products
    })

    res.json(order)
  }

  // Deletar um registro
  async delete(req: Request, res: Response) {
    const { id } = req.params

    const orderExists = await OrdersRepository.findOne(id)

    if (!orderExists) {
      return res.status(404).json({ error: 'Order not found' })
    }

    await OrdersRepository.delete(id)

    res.sendStatus(204)
  }

  // Deletar um produto de uma order existente
  async deleteProductFromOrder(req: Request, res: Response) {
    const { orderId, productId } = req.params

    const orderExists = await OrdersRepository.findOne(orderId)

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

    await OrdersRepository.deleteProductFromOrder(orderId, productId)

    res.sendStatus(204)
  }

  // Atualizar o status
  async changeStatus(req: Request, res: Response) {
    const { id } = req.params
    const { status } = req.body

    const orderExists = await OrdersRepository.findOne(id)

    if (!orderExists) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (!(status in OrderStatus)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    await OrdersRepository.changeStatus(id, status)

    res.sendStatus(204)
  }
}

export const orderController = new OrderController()
