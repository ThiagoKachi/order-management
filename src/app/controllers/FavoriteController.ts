import { Request, Response } from 'express';
import { ProductsRepository } from '../repositories/ProductsRepository';

import z from 'zod';
import { FavoritesRepository } from '../repositories/FavoritesRepository';

const ListFavoritesSchema = z.object({
  orderBy: z.string(),
});


const getFavoriteSchema = z.object({
  productId: z.string(),
});

const deleteFavoriteSchema = z.object({
  id: z.string(),
});

export class FavoriteController {
  // Listar todos os favoritos
  static index = async (req: Request, res: Response) => {
    const userId = req.userId!
    const result = ListFavoritesSchema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        issues: result.error.issues
      })
    }

    const { orderBy } = result.data

    const favorites = await FavoritesRepository.findAll(orderBy, userId)

    res.status(200).json(favorites)
  }

  // Adicionar novo favorito
  static store = async (req: Request, res: Response) => {
    const userId = req.userId!

    const result = getFavoriteSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        issues: result.error.issues
      })
    }

    const { productId } = result.data

    const productExists = await ProductsRepository.findOne(productId, userId)

    if (!productExists) {
      return res.status(404).json({ error: 'Product not found.' })
    }

    const favoriteExists = await FavoritesRepository.isProductFavorited(productId, userId)

    if (favoriteExists) {
      return res.status(409).json({ error: 'Product already favorited.' })
    }

    const product = await FavoritesRepository.create(productId, userId)

    res.status(201).json(product)
  }

  // Deletar um favorito
  static delete = async (req: Request, res: Response) => {
    const userId = req.userId!

    const result = deleteFavoriteSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        issues: result.error.issues
      })
    }

    const { id } = result.data

    const favoriteExists = await FavoritesRepository.findOne(id, userId)

    if (!favoriteExists) {
      return res.status(404).json({ error: 'Favorite product not found.' })
    }

    await FavoritesRepository.delete(id, userId)

    res.sendStatus(204)
  }
}
