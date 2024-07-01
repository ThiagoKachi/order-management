import { Request, Response } from 'express';

import z from 'zod';
import { ProductsRepository } from '../repositories/ProductsRepository';

const ListProductsSchema = z.object({
  orderByField: z.enum(['price', 'created_at']),
  direction: z.enum(['asc', 'desc']),
  productName: z.string().default(''),
  pageIndex: z.string().default('1'),
  pageSize: z.string().default('20'),
});

const getOrDeleteProductSchema = z.object({
  id: z.string()
});

const createOrUpdateProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    categoryId: z.string(),
    stock: z.number(),
    image: z.string().optional(),
    accountId: z.string()
});

export class ProductController {
  // Listar todos os registros
  static index = async (req: Request, res: Response) => {
    const userId = req.userId

    const result = ListProductsSchema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        issues: result.error.issues
      })
    }
    
    const { orderByField, direction, productName, pageIndex, pageSize } = result.data

    const products = await ProductsRepository.findAll({
      orderByField,
      direction,
      productName,
      pageIndex,
      pageSize
    }, userId!)

    res.status(200).json(products)
  }

  // Obter um registro
  static show = async (req: Request, res: Response) => {
    const userId = req.userId!

    const result = getOrDeleteProductSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        issues: result.error.issues
      })
    }

    const { id } = result.data

    const product = await ProductsRepository.findOne(id, userId)

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' })
    }

    return res.status(200).json(product)
  }

  // Obter o estoque de um produto
  static productStock = async (req: Request, res: Response) => {
    const userId = req.userId!

    const result = getOrDeleteProductSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        issues: result.error.issues
      })
    }

    const { id } = result.data

    const product = await ProductsRepository.findProductStock(id, userId)

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' })
    }

    return res.status(200).json(product)
  }

  // Criar novo registro
  static store = async (req: Request, res: Response) => {
    const userId = req.userId!

    const result = createOrUpdateProductSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        issues: result.error.issues
      })
    }
    
    const { name, description, price, categoryId, image, stock } = result.data

    const productExists = await ProductsRepository.findByName(name, userId)

    if (productExists) {
      return res.status(409).json({ error: 'Product already in use.' })
    }

    if (!name || !description || !price || !categoryId || !stock) {
      return res.status(400).json({ error: 'All fields are required.' })
    }

    const product = await ProductsRepository.create({
      name,
      description,
      price,
      categoryId,
      image,
      stock,
      accountId: userId!
    })

    res.status(201).json(product)
  }

  // Editar um registro
  static update = async (req: Request, res: Response) => {
    const { id } = req.params
    const userId = req.userId!

    const result = createOrUpdateProductSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        issues: result.error.issues
      })
    }

    const { name, description, price, categoryId, image, stock } = result.data

    const productExists = await ProductsRepository.findOne(id, userId)

    if (!productExists) {
      return res.status(404).json({ error: 'Product not found.' })
    }

    if (!name || !description || !price || !categoryId || !stock) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const product = await ProductsRepository.update(id, {
      name,
      description,
      price,
      categoryId,
      image,
      stock,
      accountId: userId!
    })

    res.status(200).json(product)
  }

  // Deletar um registro
  static delete = async (req: Request, res: Response) => {
    const userId = req.userId!

    const result = getOrDeleteProductSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        issues: result.error.issues
      })
    }
    
    const { id } = result.data

    const productExists = await ProductsRepository.findOne(id, userId)

    if (!productExists) {
      return res.status(404).json({ error: 'Product not found.' })
    }

    await ProductsRepository.delete(id, userId)

    res.sendStatus(204)
  }
}
