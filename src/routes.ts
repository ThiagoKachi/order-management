import { Router } from "express";

import { AccountController } from "./app/controllers/AccountController";
import { CategoryController } from "./app/controllers/CategoryController";
import { FavoriteController } from "./app/controllers/FavoriteController";
import { OrderController } from "./app/controllers/OrderController";
import { ProductController } from "./app/controllers/ProductController";
import { RefreshTokenController } from "./app/controllers/RefreshTokenController";

import { AuthenticationMiddleware } from "./app/middlewares/AuthenticationMiddleware";
import { AuthorizationMiddleware } from "./app/middlewares/AuthorizationMiddleware";

const authMiddleware = new AuthenticationMiddleware();
const authorizationMiddleware = new AuthorizationMiddleware();

const router = Router();

// Categories
router.get(
  "/category",
  authMiddleware.handle,
  authorizationMiddleware.handle(['CLIENT', 'SELLER']),
  CategoryController.index
);
router.get(
  "/category/:id",
  authMiddleware.handle,
  authorizationMiddleware.handle(['CLIENT', 'SELLER']),
  CategoryController.show
);
router.post(
  "/category",
  authMiddleware.handle,
  authorizationMiddleware.handle(['SELLER']),
  CategoryController.store
);
router.put(
  "/category/:id",
  authMiddleware.handle,
  authorizationMiddleware.handle(['SELLER']),
  CategoryController.update
);
router.delete(
  "/category/:id",
  authMiddleware.handle,
  authorizationMiddleware.handle(['SELLER']),
  CategoryController.delete
);

// Products
router.get(
  "/product",
  authMiddleware.handle,
  authorizationMiddleware.handle(['CLIENT', 'SELLER']),
  ProductController.index
);
router.get(
  "/product/:id",
  authMiddleware.handle,
  authorizationMiddleware.handle(['CLIENT', 'SELLER']),
  ProductController.show
);
router.get(
  "/product/stock/:id",
  authMiddleware.handle,
  authorizationMiddleware.handle(['SELLER']),
  ProductController.productStock
);
router.post(
  "/product",
  authMiddleware.handle,
  authorizationMiddleware.handle(['SELLER']),
  ProductController.store
);  
router.put(
  "/product/:id",
  authMiddleware.handle,
  authorizationMiddleware.handle(['SELLER']),
  ProductController.update
);
router.delete(
  "/product/:id",
  authMiddleware.handle,
  authorizationMiddleware.handle(['SELLER']),
  ProductController.delete
);

// Orders
router.get(
  "/order",
  authMiddleware.handle,
  authorizationMiddleware.handle(['CLIENT', 'SELLER']),
  OrderController.index
);
router.get(
  "/order/:id",
  authMiddleware.handle,
  authorizationMiddleware.handle(['CLIENT', 'SELLER']),
  OrderController.show
);
router.post(
  "/order",
  authMiddleware.handle,
  authorizationMiddleware.handle(['CLIENT', 'SELLER']),
  OrderController.store
);
router.put(
  "/order/:id",
  authMiddleware.handle,
  authorizationMiddleware.handle(['CLIENT', 'SELLER']),
  OrderController.update
);
router.patch(
  "/order/:id",
  authMiddleware.handle,
  authorizationMiddleware.handle(['SELLER']),
  OrderController.changeStatus
);
router.delete(
  "/order/:id",
  authMiddleware.handle,
  authorizationMiddleware.handle(['SELLER']),
  OrderController.delete
);
router.delete(
  "/order/:orderId/products/:productId",
  authMiddleware.handle,
  authorizationMiddleware.handle(['SELLER']),
  OrderController.deleteProductFromOrder
);

// Favorites
router.get(
  "/favorite",
  authMiddleware.handle,
  authorizationMiddleware.handle(['CLIENT', 'SELLER']),
  FavoriteController.index
);
router.post(
  "/favorite",
  authMiddleware.handle,
  authorizationMiddleware.handle(['CLIENT', 'SELLER']),
  FavoriteController.store
);
router.delete(
  "/favorite/:id",
  authMiddleware.handle,
  authorizationMiddleware.handle(['CLIENT', 'SELLER']),
  FavoriteController.delete
);

// Signin
router.post("/auth/sign-in", AccountController.signIn);

// Signup
router.post("/auth/sign-up", AccountController.signUp);

// Refresh Token
router.post("/refresh-token", RefreshTokenController.handle);

export default router;
