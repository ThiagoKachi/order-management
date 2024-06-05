import { Router } from 'express';

import { categoryController as CategoryController } from './app/controllers/CategoryController';
import { favoriteController as FavoriteController } from './app/controllers/FavoriteController';
import { orderController as OrderController } from './app/controllers/OrderController';
import { productController as ProductController } from './app/controllers/ProductController';

const router = Router();

// Categories
router.get('/category', CategoryController.index);
router.get('/category/:id', CategoryController.show);
router.post('/category', CategoryController.store);
router.put('/category/:id', CategoryController.update);
router.delete('/category/:id', CategoryController.delete);

// Products
router.get('/product', ProductController.index);
router.get('/product/:id', ProductController.show);
router.post('/product', ProductController.store);
router.put('/product/:id', ProductController.update);
router.delete('/product/:id', ProductController.delete);

// Orders
router.get('/order', OrderController.index);
router.get('/order/:id', OrderController.show);
router.post('/order', OrderController.store);
router.put('/order/:id', OrderController.update);
router.patch('/order/:id', OrderController.changeStatus);
router.delete('/order/:id', OrderController.delete);
router.delete('/order/:orderId/products/:productId', OrderController.deleteProductFromOrder);

// Favorites
router.get('/favorite', FavoriteController.index);
router.post('/favorite', FavoriteController.store);
router.delete('/favorite/:id', FavoriteController.delete);

export default router;
