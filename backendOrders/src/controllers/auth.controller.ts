import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { tokenBlacklist } from "../utils/tokenBlacklist";
import dotenv from "dotenv";

dotenv.config();

export const login = (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign(
      { _id: process.env.ADMIN_ID },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "480m" }
    );
    res.json({ token });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

export const logout = (req: Request, res: Response): void => {
  const authHeader = req.header("Authorization") || req.header("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    res.status(400).json({ message: "Token is required" });
    return;
  }

  tokenBlacklist.add(token);

  res.json({ message: "Logged out successfully" });
};
