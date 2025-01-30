// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response.utils";
import { UserJwtPayload } from "../types/authTypes";
import { tokenBlacklist } from "../utils/tokenBlacklist";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader =
      req.header("Authorization") || req.header("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return errorResponse(res, 401, "Access denied");
    }

    if (tokenBlacklist.has(token)) {
      return errorResponse(res, 401, "Token is invalidated");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as UserJwtPayload;

    if (decoded && decoded._id) {
      req.userId = decoded._id;
      next();
    } else {
      return errorResponse(res, 401, "Invalid token payload.");
    }
  } catch (error) {
    return errorResponse(res, 401, "Invalid token");
  }
}
