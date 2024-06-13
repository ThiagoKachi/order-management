import { Router } from "express";

import { accountController as AccountController } from "./app/controllers/AccountController";
import { categoryController as CategoryController } from "./app/controllers/CategoryController";
import { favoriteController as FavoriteController } from "./app/controllers/FavoriteController";
import { orderController as OrderController } from "./app/controllers/OrderController";
import { productController as ProductController } from "./app/controllers/ProductController";

import { AuthenticationMiddleware } from "./app/middlewares/AuthenticationMiddleware";

const authMiddleware = new AuthenticationMiddleware();

const router = Router();

// Categories
router.get("/category", CategoryController.index);
router.get("/category/:id", CategoryController.show);
router.post("/category", CategoryController.store);
router.put("/category/:id", CategoryController.update);
router.delete("/category/:id", CategoryController.delete);

// Products
router.get("/product", authMiddleware.handle, ProductController.index);
router.get("/product/:id", authMiddleware.handle, ProductController.show);
router.get(
  "/product/stock/:id",
  authMiddleware.handle,
  ProductController.productStock
);
router.post("/product", authMiddleware.handle, ProductController.store);
router.put("/product/:id", authMiddleware.handle, ProductController.update);
router.delete("/product/:id", authMiddleware.handle, ProductController.delete);

// Orders
router.get("/order", authMiddleware.handle, OrderController.index);
router.get("/order/:id", authMiddleware.handle, OrderController.show);
router.post("/order", authMiddleware.handle, OrderController.store);
router.put("/order/:id", authMiddleware.handle, OrderController.update);
router.patch("/order/:id", authMiddleware.handle, OrderController.changeStatus);
router.delete("/order/:id", authMiddleware.handle, OrderController.delete);
router.delete(
  "/order/:orderId/products/:productId",
  authMiddleware.handle,
  OrderController.deleteProductFromOrder
);

// Favorites
router.get("/favorite", authMiddleware.handle, FavoriteController.index);
router.post("/favorite", authMiddleware.handle, FavoriteController.store);
router.delete(
  "/favorite/:id",
  authMiddleware.handle,
  FavoriteController.delete
);

// Signin
router.post("/auth/sign-in", AccountController.signIn);

// Signup
router.post("/auth/sign-up", AccountController.signUp);

export default router;
