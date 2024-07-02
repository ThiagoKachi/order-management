import { Request, Response } from 'express';

import z from 'zod';
import { OrderStatus } from '../models/Order';
import { OrdersRepository } from '../repositories/OrdersRepository';
import { ProductsRepository } from '../repositories/ProductsRepository';

const ListOrdersSchema = z.object({
  direction: z.enum(['asc', 'desc']).default('asc'),
  orderStatus: z.enum(['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']).optional(),
  orderId: z.string().optional(),
  pageIndex: z.string().default('1'),
  pageSize: z.string().default('20'),
});

const getOrDeleteOrdersSchema = z.object({
  id: z.string(),
});

const createOrUpdateOrdersSchema = z.object({
  products: z.array(z.object({
    productId: z.string(),
    quantity: z.number()
  })),
});

const deleteProductFromOrdersSchema = z.object({
  orderId: z.string(),
  productId: z.string(),
});

const changeOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PREPARING', 'READY', 'DELIVERED']),
});

interface ProductBody {
  productId: string
  quantity: number
}

export class OrderController {
  // Listar todos os registros
  static index = async (req: Request, res: Response) => {
    const userId = req.userId!

    const result = ListOrdersSchema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        issues: result.error.issues
      })
    }

    const { direction, orderStatus, orderId, pageIndex, pageSize } = result.data

    const orders = await OrdersRepository.findAll({
      direction,
      orderStatus,
      orderId,
      pageIndex,
      pageSize
    }, userId)

    res.status(200).json(orders)
  }

  // Obter um registro
  static show = async (req: Request, res: Response) => {
    const userId = req.userId!

    const result = getOrDeleteOrdersSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        issues: result.error.issues
      })
    }

    const { id } = result.data

    const order = await OrdersRepository.findOne(id, userId)

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' })
    }

    return res.status(200).json(order)
  }

  // Criar novo registro
  static store = async (req: Request, res: Response) => {
    const userId = req.userId!

    const storeResult = createOrUpdateOrdersSchema.safeParse(req.body);

    if (!storeResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        issues: storeResult.error.issues
      })
    }

    const { products } = storeResult.data

    if (!products) {
      return res.status(400).json({ error: 'All fields are required.' })
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
  static update = async (req: Request, res: Response) => {
    const userId = req.userId!
    const { id } = req.params

    const storeResult = createOrUpdateOrdersSchema.safeParse(req.body);

    if (!storeResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        issues: storeResult.error.issues
      })
    }

    const { products } = storeResult.data

    if (!products) {
      return res.status(400).json({ error: 'All fields are required.' })
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

    const order = await OrdersRepository.update(id, {
      products,
    }, userId)

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
  
      res.status(200).json(order)
    } catch (error) {
      return res.status(500).json({ error: "Failed to adjust stock after updating order." })
    }
  }

  // Deletar um registro
  static delete = async (req: Request, res: Response) => {
    const userId = req.userId!

    const storeResult = getOrDeleteOrdersSchema.safeParse(req.params);

    if (!storeResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        issues: storeResult.error.issues
      })
    }

    const { id } = storeResult.data;

    const order = await OrdersRepository.findOne(id, userId)

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' })
    }

    await OrdersRepository.changeStatus(id, 'CANCELLED' as OrderStatus, userId)

    order.products.forEach(async product => {
      await ProductsRepository.updateStock(product.productId, product.quantity)
    })

    res.sendStatus(204)
  }

  // Deletar um produto de uma order existente
  static deleteProductFromOrder = async (req: Request, res: Response) => {
    const userId = req.userId!

    const storeResult = deleteProductFromOrdersSchema.safeParse(req.params);

    if (!storeResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        issues: storeResult.error.issues
      })
    }

    const { orderId, productId } = storeResult.data;

    const orderExists = await OrdersRepository.findOne(orderId, userId)

    if (!orderExists) {
      return res.status(404).json({ error: 'Order not found.' })
    }

    const productExists = orderExists.products.find(product => product.productId === productId)

    if (!productExists) {
      return res.status(404).json({ error: 'Product not found in this order.' })
    }

    if (orderExists.status === 'DELIVERED') {
      return res.status(409).json({ error: 'Order already delivered.' })
    }

    await OrdersRepository.deleteProductFromOrder(orderId, productId, userId)

    res.sendStatus(204)
  }

  // Atualizar o status
  static changeStatus = async (req: Request, res: Response) => {
    const userId = req.userId!
    const { id } = req.params

    const storeResult = changeOrderStatusSchema.safeParse(req.body);

    if (!storeResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        issues: storeResult.error.issues
      })
    }

    const { status } = storeResult.data;

    const orderExists = await OrdersRepository.findOne(id, userId)

    if (!orderExists) {
      return res.status(404).json({ error: 'Order not found.' })
    }

    if (!(status in OrderStatus)) {
      return res.status(400).json({ error: 'Invalid status.' })
    }

    await OrdersRepository.changeStatus(id, status as OrderStatus, userId)

    res.sendStatus(204)
  }
}
