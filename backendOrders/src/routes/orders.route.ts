import express from "express";
import * as ordersController from "../controllers/orders.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", verifyToken, ordersController.getOrders);
router.get("/:orderId/notes", verifyToken, ordersController.getOrderNotes);
router.post("/:orderId/notes", verifyToken, ordersController.postPrintNote);

export default router;
