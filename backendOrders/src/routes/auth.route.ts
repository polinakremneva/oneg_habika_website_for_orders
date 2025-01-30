import express from "express";
import * as authController from "../controllers/auth.controller"; // Auth controller
import { verifyToken } from "../middleware/auth.middleware";
const router = express.Router();

// Auth routes
router.post("/login", authController.login);
router.post("/logout", verifyToken, authController.logout);

export default router;
