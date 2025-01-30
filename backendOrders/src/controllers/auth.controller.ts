import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { HARDCODED_USER } from "../config/constants";
import { tokenBlacklist } from "../utils/tokenBlacklist";

export const login = (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (
    username === HARDCODED_USER.username &&
    password === HARDCODED_USER.password
  ) {
    const token = jwt.sign(
      { _id: HARDCODED_USER._id },
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
