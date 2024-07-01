import { Request, Response } from 'express';

import z from 'zod';
import { CategoriesRepository } from '../repositories/CategoriesRepository';

const ListCategoriesSchema = z.object({
  orderBy: z.string(),
});

const getOrDeleteCategoriesSchema = z.object({
  id: z.string(),
});

const createOrUpdateCategoriesSchema = z.object({
  name: z.string(),
});

export class CategoryController {
  // Listar todos os registros
  static index = async (req: Request, res: Response) => {
    const result = ListCategoriesSchema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        issues: result.error.issues
      })
    }

    const { orderBy } = result.data

    const categories = await CategoriesRepository.findAll(orderBy)

    res.status(200).json(categories)
  }

  // Obter um registro
  static show = async (req: Request, res: Response) => {
    const result = getOrDeleteCategoriesSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        issues: result.error.issues
      })
    }

    const { id } = result.data

    const categorie = await CategoriesRepository.findOne(id)

    if (!categorie) {
      return res.status(404).json({ error: 'Categorie not found.' })
    }

    return res.status(200).json(categorie)
  }

  // Criar novo registro
  static store = async (req: Request, res: Response) => {
    const result = createOrUpdateCategoriesSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        issues: result.error.issues
      })
    }

    const { name } = result.data

    const categoryExists = await CategoriesRepository.findByName(name)

    if (categoryExists) {
      return res.status(409).json({ error: 'Category already in use.' })
    }

    if (!name) {
      return res.status(400).json({ error: 'Name is required' })
    }

    const category = await CategoriesRepository.create(name)

    res.status(201).json(category)
  }

  // Editar um registro
  static update = async (req: Request, res: Response) => {
    const result = createOrUpdateCategoriesSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        issues: result.error.issues
      })
    }

    const { id } = req.params
    const { name } = result.data

    const categoryExists = await CategoriesRepository.findByName(name)

    if (categoryExists) {
      return res.status(409).json({ error: 'Category already in use.' })
    }

    if (!name) {
      return res.status(400).json({ error: 'Name is required.' })
    }

    const category = await CategoriesRepository.update(id, name)

    res.status(200).json(category)
  }

  // Deletar um registro
  static delete = async (req: Request, res: Response) => {
    const result = getOrDeleteCategoriesSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        issues: result.error.issues
      })
    }

    const { id } = result.data

    const categoryExists = await CategoriesRepository.findOne(id)

    if (!categoryExists) {
      return res.status(404).json({ error: 'Category not found.' })
    }

    await CategoriesRepository.delete(id)

    res.sendStatus(204)
  }
}
