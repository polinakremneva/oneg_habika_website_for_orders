import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const wooCommerceApi = axios.create({
  baseURL: "https://oneg-habika.co.il/wp-json/wc/v3",
  params: {
    consumer_key: process.env.WC_CONSUMER_KEY,
    consumer_secret: process.env.WC_CONSUMER_SECRET,
  },
});

export const getOrders = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const perPage = Math.max(1, parseInt(req.query.per_page as string) || 20);

    const response = await wooCommerceApi.get("/orders", {
      params: {
        page,
        per_page: perPage,
        orderby: "date",
        order: "desc",
        status: "processing",
      },
    });

    const totalOrders = parseInt(response.headers["x-wp-total"], 10) || 0;
    const totalPages = parseInt(response.headers["x-wp-totalpages"], 10) || 1;

    if (!Array.isArray(response.data)) {
      throw new Error(
        `Invalid response data format. Expected array, got ${typeof response.data}`
      );
    }

    const responseData = {
      orders: response.data,
      totalOrders,
      totalPages,
      currentPage: page,
      perPage,
      actualOrdersCount: response.data.length,
    };

    res.status(200).json(responseData);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).json({
        message: "Failed to fetch orders",
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

export const getOrderNotes = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { orderId } = req.params;
  try {
    const response = await wooCommerceApi.get(`/orders/${orderId}/notes`);
    res.status(200).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      res.status(404).json({ message: "Order not found or has no notes" });
      return;
    }
    console.error(`Error fetching notes for order ${orderId}:`, error);
    res.status(500).json({ message: "Failed to fetch order notes" });
  }
};

export const postPrintNote = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { orderId } = req.params;
  const { note } = req.body;

  if (!note) {
    res.status(400).json({ message: "Note content is required" });
    return;
  }

  try {
    const noteData = {
      note,
    };

    const response = await wooCommerceApi.post(
      `/orders/${orderId}/notes`,
      noteData
    );
    res.status(201).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      res
        .status(404)
        .json({ message: "Order not found or unable to post note" });
      return;
    }
    console.error("PrintSync Error:", error);
    res.status(500).json({ message: "Failed to post note in PrintSync" });
  }
};

export const completeOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { orderId } = req.params;
  const { newStatus } = req.body;

  if (!newStatus) {
    res.status(400).json({ message: "Status is required." });
  }

  try {
    await wooCommerceApi.put(`/orders/${orderId}`, {
      status: newStatus,
    });
    res.json({ message: "Order completed" });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error completing order ${orderId}:`, error.message);
      res.status(500).json({ message: "Failed to complete order" });
    } else {
      console.error(`Unknown error completing order ${orderId}:`, error);
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};
