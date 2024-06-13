import { Request, Response } from 'express';

import { categoriesRepository as CategoriesRepository } from '../repositories/CategoriesRepository';

class CategoryController {
  // Listar todos os registros
  async index(req: Request, res: Response) {
    const { orderBy } = req.query

    const categories = await CategoriesRepository.findAll(orderBy as string)

    res.json(categories)
  }

  // Obter um registro
  async show(req: Request, res: Response) {
    const { id } = req.params

    const categorie = await CategoriesRepository.findOne(id)

    if (!categorie) {
      return res.status(404).json({ error: 'Categorie not found' })
    }

    return res.json(categorie)
  }

  // Criar novo registro
  async store(req: Request, res: Response) {
    const { name } = req.body

    const categoryExists = await CategoriesRepository.findByName(name)

    if (categoryExists) {
      return res.status(404).json({ error: 'Category already in use!' })
    }

    if (!name) {
      return res.status(400).json({ error: 'Name is required' })
    }

    const category = await CategoriesRepository.create(name)

    res.status(201).json(category)
  }

  // Editar um registro
  async update(req: Request, res: Response) {
    const { id } = req.params
    const { name } = req.body

    const categoryExists = await CategoriesRepository.findByName(name)

    if (categoryExists) {
      return res.status(404).json({ error: 'Category already in use!' })
    }

    if (!name) {
      return res.status(400).json({ error: 'Name is required' })
    }

    const category = await CategoriesRepository.update(id, name)

    res.json(category)
  }

  // Deletar um registro
  async delete(req: Request, res: Response) {
    const { id } = req.params

    const categoryExists = await CategoriesRepository.findOne(id)

    if (!categoryExists) {
      return res.status(404).json({ error: 'Category not found' })
    }

    await CategoriesRepository.delete(id)

    res.sendStatus(204)
  }
}

export const categoryController = new CategoryController()
