import { Request, Response } from 'express';

import { ProductSearchField, productsRepository as ProductsRepository } from '../repositories/ProductsRepository';

export interface ProductFilters {
  orderByField: ProductSearchField
  direction: 'asc' | 'desc'
  productName: string
  pageIndex: string
  pageSize: string
}

class ProductController {
  // Listar todos os registros
  async index(req: Request, res: Response) {
    const userId = req.userId
    
    const { orderByField, direction, productName, pageIndex, pageSize } = req.query

    const filters = {
      orderByField: orderByField,
      direction: direction,
      productName: productName,
      pageIndex,
      pageSize,
    } as ProductFilters

    const products = await ProductsRepository.findAll(filters, userId!)

    res.json(products)
  }

  // Obter um registro
  async show(req: Request, res: Response) {
    const userId = req.userId!

    const { id } = req.params

    const product = await ProductsRepository.findOne(id, userId)

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    return res.json(product)
  }

  // Obter o estoque de um produto
  async productStock(req: Request, res: Response) {
    const userId = req.userId!
    const { id } = req.params

    const product = await ProductsRepository.findProductStock(id, userId)

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    return res.json(product)
  }

  // Criar novo registro
  async store(req: Request, res: Response) {
    const userId = req.userId!
    const { name, description, price, categoryId, image, stock } = req.body

    const productExists = await ProductsRepository.findByName(name, userId)

    if (productExists) {
      return res.status(404).json({ error: 'Product already in use!' })
    }

    if (!name || !description || !price || !categoryId || !stock) {
      return res.status(400).json({ error: 'All fields are required' })
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
  async update(req: Request, res: Response) {
    const { id } = req.params
    const userId = req.userId!
    const { name, description, price, categoryId, image, stock } = req.body

    const productExists = await ProductsRepository.findOne(id, userId)

    if (!productExists) {
      return res.status(404).json({ error: 'Product not found' })
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

    res.json(product)
  }

  // Deletar um registro
  async delete(req: Request, res: Response) {
    const userId = req.userId!
    const { id } = req.params

    const productExists = await ProductsRepository.findOne(id, userId)

    if (!productExists) {
      return res.status(404).json({ error: 'Product not found' })
    }

    await ProductsRepository.delete(id, userId)

    res.sendStatus(204)
  }
}

export const productController = new ProductController()
