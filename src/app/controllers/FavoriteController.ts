import { Request, Response } from 'express';
import { productsRepository as ProductsRepository } from '../repositories/ProductsRepository';

import { favoritesRepository as FavoritesRepository } from '../repositories/FavoritesRepository';

class FavoriteController {
  // Listar todos os favoritos
  async index(req: Request, res: Response) {
    const { orderBy } = req.query
    const favorites = await FavoritesRepository.findAll(orderBy as string)

    res.json(favorites)
  }

  // Adicionar novo favorito
  async store(req: Request, res: Response) {
    const { productId } = req.body

    const productExists = await ProductsRepository.findOne(productId)

    if (!productExists) {
      return res.status(404).json({ error: 'Product not found!' })
    }

    const favoriteExists = await FavoritesRepository.isProductFavorited(productId)

    if (favoriteExists) {
      return res.status(404).json({ error: 'Product already favorited!' })
    }

    const product = await FavoritesRepository.create(productId)

    res.status(201).json(product)
  }

  // Deletar um favorito
  async delete(req: Request, res: Response) {
    const { id } = req.params

    const favoriteExists = await FavoritesRepository.findOne(id)

    if (!favoriteExists) {
      return res.status(404).json({ error: 'Favorite product not found' })
    }

    await FavoritesRepository.delete(id)

    res.sendStatus(204)
  }
}

export const favoriteController = new FavoriteController()
