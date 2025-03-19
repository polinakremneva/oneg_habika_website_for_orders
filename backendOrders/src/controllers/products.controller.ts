import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const wooCommerceApi = axios.create({
  baseURL: "https://oneg-habika.co.il/wp-json/wc/v3",
  auth: {
    username: process.env.WC_CONSUMER_KEY as string,
    password: process.env.WC_CONSUMER_SECRET as string,
  },
});

export const getProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { productId } = req.params;
  const fields = req.query.fields as string;

  if (!productId) {
    res.status(400).json({ message: "Product ID is required" });
    return;
  }

  try {
    const response = await wooCommerceApi.get(`/products/${productId}`);

    if (!response.data) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    if (fields === "description") {
      // Если запрошено только описание
      res.json({ description: response.data.description });
    } else {
      // Если запрошен полный объект продукта
      res.json(response.data);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).json({
        message: "Failed to fetch product",
        details: error.response?.data || error.message,
        status: error.response?.status,
      });
    } else {
      res.status(500).json({
        message: "An unknown error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
