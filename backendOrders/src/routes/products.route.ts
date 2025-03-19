import express from "express";
import { verifyToken } from "../middleware/auth.middleware";
import * as productsController from "../controllers/products.controller";

const router = express.Router();

router.get("/:productId", verifyToken, productsController.getProduct);

export default router;
